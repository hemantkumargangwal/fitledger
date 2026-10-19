const Lead = require('../models/Lead');
const { AppError } = require('../utils/errorHandler');

const getLeads = async (req, res) => {
  const { status, search } = req.query;
  const filter = { gymId: req.gymId };
  if (status && status !== 'All') filter.status = status;
  if (search) filter.$or = ['name', 'phone', 'email'].map((field) => ({ [field]: { $regex: search, $options: 'i' } }));
  const leads = await Lead.find(filter).sort({ updatedAt: -1 });
  res.json({ leads });
};

const createLead = async (req, res) => {
  const { name, phone, email = '', notes = '', status = 'Inquiry' } = req.body;
  if (!String(name || '').trim() || !String(phone || '').trim()) throw new AppError('Name and phone are required', 400, 'VALIDATION_ERROR');
  const lead = await Lead.create({ gymId: req.gymId, name, phone, email, notes, status, convertedAt: status === 'Converted' ? new Date() : undefined });
  res.status(201).json({ lead });
};

const updateLeadStatus = async (req, res) => {
  const statuses = ['Inquiry', 'Follow-up', 'Trial', 'Converted', 'Lost'];
  if (!statuses.includes(req.body.status)) throw new AppError('Invalid lead status', 400, 'VALIDATION_ERROR');
  const lead = await Lead.findOneAndUpdate({ _id: req.params.id, gymId: req.gymId }, { status: req.body.status, ...(req.body.status === 'Converted' ? { convertedAt: new Date() } : {}) }, { new: true, runValidators: true });
  if (!lead) throw new AppError('Lead not found', 404, 'RESOURCE_NOT_FOUND');
  res.json({ lead });
};

module.exports = { getLeads, createLead, updateLeadStatus };
