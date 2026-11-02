const crypto = require('crypto');
const XLSX = require('xlsx');
const { AppError } = require('../utils/errorHandler');

const MAX_ROWS = 5000;
const IMPORT_TTL_MS = 20 * 60 * 1000;
const sessions = new Map();

const fields = [
  ['name', 'Member name', ['name', 'full name', 'member name', 'customer name', 'client name']],
  ['phone', 'Mobile number', ['phone', 'mobile', 'mobile number', 'phone number', 'contact number', 'contact', 'whatsapp number']],
  ['gender', 'Gender', ['gender', 'sex']],
  ['email', 'Email', ['email', 'email address', 'e-mail address', 'mail']],
  ['dateOfBirth', 'Date of birth', ['date of birth', 'dob', 'birth date', 'birthday']],
  ['anniversaryDate', 'Anniversary date', ['anniversary', 'anniversary date']],
  ['address', 'Address', ['address', 'home address', 'location']],
  ['emergencyContactNumber', 'Emergency mobile', ['emergency contact', 'emergency number', 'emergency mobile']],
  ['photo', 'Photo URL', ['photo', 'photo url', 'image', 'image url']],
  ['joiningDate', 'Joining date', ['joining date', 'join date', 'date of joining', 'admission date']],
  ['documentId', 'Document ID', ['document id', 'id proof', 'aadhar', 'aadhaar', 'pan']],
  ['bodyStats.height', 'Height', ['height']],
  ['bodyStats.weight', 'Weight', ['weight']],
  ['bodyStats.bmi', 'BMI', ['bmi']],
  ['bodyStats.bodyFat', 'Body fat', ['body fat', 'bodyfat']],
  ['bodyStats.shoulder', 'Shoulder', ['shoulder']],
  ['bodyStats.chest', 'Chest', ['chest']],
  ['bodyStats.hips', 'Hips', ['hips', 'hip']],
  ['bodyStats.abs', 'Abs', ['abs', 'abdomen']],
  ['bodyStats.waistHip', 'Waist hip', ['waist hip', 'waist/hip', 'waist hip ratio']],
  ['bodyStats.bloodMeasurementDate', 'Measurement date', ['measurement date', 'blood measurement date']],
];

const supportedFields = Object.fromEntries(fields.map(([key, label]) => [key, label]));
const normalizeHeader = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const normalizePhone = (value) => String(value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
const clean = (value) => String(value ?? '').trim();
const validDate = (value) => {
  if (!clean(value)) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const suggestMappings = (headers) => Object.fromEntries(headers.map((header) => {
  const normalized = normalizeHeader(header);
  const field = fields.find(([, , synonyms]) => synonyms.some((synonym) => normalizeHeader(synonym) === normalized));
  return [header, field?.[0] || ''];
}));

const parseFile = (file) => {
  if (!file?.buffer?.length) throw new AppError('Choose a non-empty CSV or Excel file.', 400, 'IMPORT_FILE_REQUIRED');
  if (file.size > 5 * 1024 * 1024) throw new AppError('Import files must be 5 MB or smaller.', 413, 'IMPORT_FILE_TOO_LARGE');
  const extension = String(file.originalname || '').split('.').pop().toLowerCase();
  if (!['csv', 'xlsx', 'xls'].includes(extension)) throw new AppError('Only CSV, XLS, and XLSX files are supported.', 415, 'IMPORT_FILE_TYPE_INVALID');
  let workbook;
  try { workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true }); } catch (_error) { throw new AppError('The uploaded file could not be read.', 400, 'IMPORT_FILE_INVALID'); }
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
  const headerIndex = matrix.findIndex((row) => row.some((cell) => clean(cell)));
  if (headerIndex < 0) throw new AppError('The file does not contain a header row.', 400, 'IMPORT_HEADERS_REQUIRED');
  const headers = matrix[headerIndex].map((cell, index) => clean(cell) || `Column ${index + 1}`);
  if (new Set(headers.map(normalizeHeader)).size !== headers.length) throw new AppError('Column names must be unique.', 400, 'IMPORT_HEADERS_DUPLICATE');
  const rows = matrix.slice(headerIndex + 1).filter((row) => row.some((cell) => clean(cell))).map((row, index) => ({
    rowNumber: headerIndex + index + 2,
    values: Object.fromEntries(headers.map((header, column) => [header, clean(row[column])])),
  }));
  if (!rows.length) throw new AppError('The file has no member rows to import.', 400, 'IMPORT_ROWS_REQUIRED');
  if (rows.length > MAX_ROWS) throw new AppError(`Imports are limited to ${MAX_ROWS.toLocaleString()} rows.`, 413, 'IMPORT_TOO_MANY_ROWS');
  return { headers, rows };
};

const buildRecord = (row, mappings) => {
  const values = {};
  Object.entries(mappings || {}).forEach(([header, field]) => {
    if (supportedFields[field] && clean(row.values[header])) values[field] = clean(row.values[header]);
  });
  const errors = [];
  if (!values.name) errors.push('Member name is required');
  const phone = normalizePhone(values.phone);
  if (!phone) errors.push('Mobile number is required');
  else if (phone.length < 7 || phone.length > 15) errors.push('Mobile number is invalid');
  if (values.gender && !['male', 'female', 'other'].includes(values.gender.toLowerCase())) errors.push('Gender must be male, female, or other');
  ['dateOfBirth', 'anniversaryDate', 'joiningDate', 'bodyStats.bloodMeasurementDate'].forEach((field) => {
    if (values[field] && validDate(values[field]) === null) errors.push(`${supportedFields[field]} is invalid`);
  });
  return { rowNumber: row.rowNumber, values, phone, errors };
};

const reviewRows = async ({ rows, mappings, existingMembers }) => {
  const existingByPhone = new Map(existingMembers.map((member) => [normalizePhone(member.phone), member]));
  const seenPhones = new Set();
  const review = rows.map((row) => {
    const record = buildRecord(row, mappings);
    if (!record.errors.length && (seenPhones.has(record.phone) || existingByPhone.has(record.phone))) {
      record.duplicate = existingByPhone.has(record.phone)
        ? { type: 'existing', member: { id: String(existingByPhone.get(record.phone)._id), name: existingByPhone.get(record.phone).name, phone: existingByPhone.get(record.phone).phone } }
        : { type: 'file' };
    }
    if (record.phone) seenPhones.add(record.phone);
    return record;
  });
  const invalidRows = review.filter((row) => row.errors.length);
  const duplicates = review.filter((row) => row.duplicate);
  return {
    rows: review,
    summary: { totalRows: rows.length, validRows: review.length - invalidRows.length - duplicates.length, duplicates: duplicates.length, invalidRows: invalidRows.length },
  };
};

const createSession = ({ gymId, userId, file }) => {
  const parsed = parseFile(file);
  const importId = crypto.randomUUID();
  const session = { importId, gymId: String(gymId), userId: String(userId), ...parsed, mappings: suggestMappings(parsed.headers), expiresAt: Date.now() + IMPORT_TTL_MS, committed: null };
  sessions.set(importId, session);
  const expiryTimer = setTimeout(() => sessions.delete(importId), IMPORT_TTL_MS);
  expiryTimer.unref?.();
  return session;
};

const getSession = ({ importId, gymId, userId }) => {
  const session = sessions.get(importId);
  if (!session || session.expiresAt <= Date.now() || session.gymId !== String(gymId) || session.userId !== String(userId)) {
    throw new AppError('This import review has expired. Upload the file again.', 404, 'IMPORT_SESSION_INVALID');
  }
  return session;
};

const cleanMappings = (headers, mappings) => Object.fromEntries(headers.map((header) => [header, supportedFields[mappings?.[header]] ? mappings[header] : '']));

const payloadFromRecord = (record) => {
  const payload = { name: record.values.name, phone: record.phone };
  Object.entries(record.values).forEach(([field, value]) => {
    if (field === 'name' || field === 'phone' || !value) return;
    if (field.startsWith('bodyStats.')) {
      const key = field.slice('bodyStats.'.length);
      payload.bodyStats ||= {};
      payload.bodyStats[key] = key === 'bloodMeasurementDate' ? validDate(value) : value;
    } else if (field === 'gender') payload[field] = value.toLowerCase();
    else payload[field] = ['dateOfBirth', 'anniversaryDate', 'joiningDate'].includes(field) ? validDate(value) : value;
  });
  return payload;
};

module.exports = { MAX_ROWS, supportedFields, normalizePhone, suggestMappings, parseFile, reviewRows, createSession, getSession, cleanMappings, payloadFromRecord };
