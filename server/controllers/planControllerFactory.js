const buildPlanPayload = (body, rowFields) => {
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const note = String(body.note || '').trim();
  const details = String(body.details || '').trim();
  const tableRows = Array.isArray(body.tableRows) ? body.tableRows : [];

  if (!name) return { error: 'Plan name is required' };

  return {
    data: {
      name,
      description,
      note,
      details,
      tableRows: tableRows
        .map((row) => rowFields.reduce((cleanRow, field) => ({
          ...cleanRow,
          [field]: String(row?.[field] || '').trim()
        }), {}))
        .filter((row) => Object.values(row).some(Boolean))
    }
  };
};

const createPlanController = ({ Model, listKey, rowFields, singularLabel, memberAssignmentField }) => {
  const getPlans = async (req, res) => {
    try {
      const [plans, assignments] = await Promise.all([
        Model.find({ gymId: req.gymId }).sort({ createdAt: -1 }).lean(),
        Member.aggregate([
          { $match: { gymId: req.gymId, [`membershipAssignment.${memberAssignmentField}`]: { $exists: true, $ne: '' } } },
          { $group: { _id: `$membershipAssignment.${memberAssignmentField}`, popularity: { $sum: 1 } } }
        ])
      ]);
      const popularityByName = new Map(assignments.map((assignment) => [assignment._id, assignment.popularity]));

      res.json({
        [listKey]: plans.map((plan) => ({
          ...plan,
          popularity: popularityByName.get(plan.name) || 0
        }))
      });
    } catch (error) {
      console.error(`Get ${listKey} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const createPlan = async (req, res) => {
    try {
      const payload = buildPlanPayload(req.body, rowFields);
      if (payload.error) return res.status(400).json({ message: payload.error });

      const plan = await Model.create({
        gymId: req.gymId,
        ...payload.data
      });

      res.status(201).json({ message: `${singularLabel} added successfully`, plan });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: `${singularLabel} name already exists` });
      }
      console.error(`Create ${singularLabel} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const updatePlan = async (req, res) => {
    try {
      const payload = buildPlanPayload(req.body, rowFields);
      if (payload.error) return res.status(400).json({ message: payload.error });

      const plan = await Model.findOneAndUpdate(
        { _id: req.params.id, gymId: req.gymId },
        { ...payload.data, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!plan) {
        return res.status(404).json({ message: `${singularLabel} not found` });
      }

      res.json({ message: `${singularLabel} updated successfully`, plan });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: `${singularLabel} name already exists` });
      }
      console.error(`Update ${singularLabel} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const deletePlan = async (req, res) => {
    try {
      const plan = await Model.findOneAndDelete({ _id: req.params.id, gymId: req.gymId });

      if (!plan) {
        return res.status(404).json({ message: `${singularLabel} not found` });
      }

      res.json({ message: `${singularLabel} deleted successfully` });
    } catch (error) {
      console.error(`Delete ${singularLabel} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  return {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan
  };
};

module.exports = createPlanController;
const Member = require('../models/Member');
