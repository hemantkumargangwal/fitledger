const Membership = require('../models/Membership');
const Member = require('../models/Member');

const buildMembershipPayload = (body) => {
  const name = String(body.name || '').trim();
  const price = Number(body.price);
  const duration = Number(body.duration);
  const ptIncluded = Boolean(body.ptIncluded);

  if (!name) return { error: 'Membership name is required' };
  if (!Number.isFinite(price) || price < 0) return { error: 'Membership price must be 0 or more' };
  if (!Number.isInteger(duration) || duration < 1) return { error: 'Duration must be at least 1 month' };

  return { data: { name, price, duration, ptIncluded } };
};

const getPopularityByDuration = async (gymId) => {
  const popularity = await Member.aggregate([
    { $match: { gymId } },
    { $group: { _id: '$planDuration', count: { $sum: 1 } } }
  ]);

  return new Map(popularity.map((item) => [Number(item._id), item.count]));
};

const getMemberships = async (req, res) => {
  try {
    const [memberships, popularityByDuration] = await Promise.all([
      Membership.find({ gymId: req.gymId }).sort({ duration: 1, price: 1, name: 1 }).lean(),
      getPopularityByDuration(req.gymId)
    ]);

    res.json({
      memberships: memberships.map((membership) => ({
        ...membership,
        popularity: popularityByDuration.get(Number(membership.duration)) || 0
      }))
    });
  } catch (error) {
    console.error('Get memberships error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMembership = async (req, res) => {
  try {
    const payload = buildMembershipPayload(req.body);
    if (payload.error) return res.status(400).json({ message: payload.error });

    const membership = await Membership.create({
      gymId: req.gymId,
      ...payload.data
    });

    res.status(201).json({ message: 'Membership added successfully', membership });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Membership name already exists' });
    }
    console.error('Create membership error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateMembership = async (req, res) => {
  try {
    const payload = buildMembershipPayload(req.body);
    if (payload.error) return res.status(400).json({ message: payload.error });

    const membership = await Membership.findOneAndUpdate(
      { _id: req.params.id, gymId: req.gymId },
      { ...payload.data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    res.json({ message: 'Membership updated successfully', membership });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Membership name already exists' });
    }
    console.error('Update membership error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteMembership = async (req, res) => {
  try {
    const membership = await Membership.findOneAndDelete({ _id: req.params.id, gymId: req.gymId });

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    res.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    console.error('Delete membership error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMemberships,
  createMembership,
  updateMembership,
  deleteMembership
};
