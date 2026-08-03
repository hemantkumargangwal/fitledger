const Enquiry = require('../models/Enquiry');
const Gym = require('../models/Gym');
const { sendMsg91TemplateEmail } = require('../services/emailService');

const cleanString = (value) => String(value || '').trim();
const parseDate = (value) => (value ? new Date(value) : undefined);

const getPayload = (body) => ({
  name: cleanString(body.name),
  email: cleanString(body.email).toLowerCase(),
  mobile: cleanString(body.mobile || body.phone),
  address: cleanString(body.address),
  sender: cleanString(body.sender),
  source: cleanString(body.source),
  assignedTo: cleanString(body.assignedTo),
  occupation: cleanString(body.occupation),
  suitableTimeSlot: cleanString(body.suitableTimeSlot),
  nextFollowUp: parseDate(body.nextFollowUp),
  convertibilityNote: cleanString(body.convertibilityNote),
  enquiryDate: parseDate(body.enquiryDate) || new Date()
});

const createEnquiry = async (req, res) => {
  try {
    const payload = getPayload(req.body);
    if (!payload.name || !payload.mobile) {
      return res.status(400).json({ message: 'Name and mobile number are required' });
    }
    const enquiry = await Enquiry.create({ gymId: req.gymId, ...payload });
    return res.status(201).json({ message: 'Enquiry added successfully', enquiry });
  } catch (error) {
    console.error('Create enquiry error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getEnquiries = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = { gymId: req.gymId };
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = ['name', 'mobile', 'email'].map((field) => ({
        [field]: { $regex: search, $options: 'i' }
      }));
    }
    const enquiries = await Enquiry.find(query).sort({ enquiryDate: -1, createdAt: -1 });
    return res.json({ enquiries });
  } catch (error) {
    console.error('Get enquiries error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateEnquiry = async (req, res) => {
  try {
    const payload = getPayload(req.body);
    if (!payload.name || !payload.mobile) {
      return res.status(400).json({ message: 'Name and mobile number are required' });
    }
    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: req.params.id, gymId: req.gymId },
      { $set: payload },
      { new: true, runValidators: true }
    );
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    return res.json({ message: 'Enquiry updated successfully', enquiry });
  } catch (error) {
    console.error('Update enquiry error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'in-progress', 'closed', 'converted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid enquiry status' });
    }
    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: req.params.id, gymId: req.gymId },
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    return res.json({ message: 'Enquiry status updated', enquiry });
  } catch (error) {
    console.error('Update enquiry status error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const sendEnquiryEmail = async (req, res) => {
  try {
    const enquiry = await Enquiry.findOne({ _id: req.params.id, gymId: req.gymId }).lean();
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    if (!enquiry.email) return res.status(400).json({ message: 'This enquiry does not have an email address' });

    const gym = await Gym.findById(req.gymId).select('gymName').lean();
    const result = await sendMsg91TemplateEmail({
      toEmail: enquiry.email,
      recipientName: enquiry.name,
      companyName: gym?.gymName,
      templateId: req.body.templateId || process.env.MSG91_ENQUIRY_EMAIL_TEMPLATE_ID,
      variables: {
        enquiry_source: enquiry.source || '',
        assigned_to: enquiry.assignedTo || ''
      }
    });

    if (!result.delivered) return res.status(503).json({ message: 'MSG91 email is not configured', result });
    return res.json({ message: 'Enquiry email sent successfully', result });
  } catch (error) {
    console.error('Send enquiry email error:', error);
    return res.status(502).json({ message: 'Enquiry email could not be sent' });
  }
};

const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findOneAndDelete({ _id: req.params.id, gymId: req.gymId });
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    return res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createEnquiry, getEnquiries, updateEnquiry, updateEnquiryStatus, sendEnquiryEmail, deleteEnquiry };
