const mongoose = require('mongoose');

const bodyStatsSchema = new mongoose.Schema({
  height: { type: String, trim: true },
  weight: { type: String, trim: true },
  bmi: { type: String, trim: true },
  bodyFat: { type: String, trim: true },
  shoulder: { type: String, trim: true },
  chest: { type: String, trim: true },
  hips: { type: String, trim: true },
  abs: { type: String, trim: true },
  waistHip: { type: String, trim: true },
  bloodMeasurementDate: { type: Date }
}, { _id: false });

const membershipAssignmentSchema = new mongoose.Schema({
  membershipName: { type: String, trim: true },
  membershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' },
  startDate: { type: Date },
  endDate: { type: Date },
  plan: { type: String, trim: true },
  diet: { type: String, trim: true },
  trainer: { type: String, trim: true },
  trainerSlot: { type: String, trim: true },
  membershipPrice: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmountPayable: { type: Number, default: 0 },
  invoiceDate: { type: Date },
  salesManager: { type: String, trim: true },
  note: { type: String, trim: true },
  invoiceSendEmail: { type: Boolean, default: false },
  amountPaid: { type: Number, default: 0 },
  mode: { type: String, enum: ['cash', 'upi', 'card'], default: 'cash' },
  paymentDueDate: { type: Date },
  assignedAt: { type: Date, default: Date.now }
}, { _id: false });

const memberSchema = new mongoose.Schema({
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  memberCode: {
    type: String,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  anniversaryDate: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContactNumber: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    trim: true
  },
  documentId: {
    type: String,
    trim: true
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  planDuration: {
    type: Number,
    default: 0,
    min: 0
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'inactive'
  },
  bodyStats: {
    type: bodyStatsSchema,
    default: () => ({})
  },
  membershipAssignment: {
    type: membershipAssignmentSchema,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

memberSchema.index({ gymId: 1, memberCode: 1 }, { unique: true, sparse: true });

// Calculate expiry date before saving
memberSchema.pre('save', function(next) {
  if ((this.isModified('planDuration') || this.isModified('joiningDate')) && this.planDuration > 0) {
    const expiryDate = new Date(this.joiningDate);
    expiryDate.setMonth(expiryDate.getMonth() + this.planDuration);
    this.expiryDate = expiryDate;
  }
  
  // Update status based on expiry date
  if (!this.membershipAssignment && !this.planDuration) {
    this.status = 'inactive';
  } else if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = 'expired';
  } else {
    this.status = 'active';
  }
  
  next();
});

module.exports = mongoose.model('Member', memberSchema);
