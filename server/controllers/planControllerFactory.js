const SystemPlanTemplate = require('../models/SystemPlanTemplate');
const Member = require('../models/Member');

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
      category: String(body.category || '').trim(),
      goal: String(body.goal || '').trim(),
      difficulty: String(body.difficulty || '').trim(),
      dietPreference: String(body.dietPreference || '').trim(),
      tableRows: tableRows
        .map((row) => rowFields.reduce((cleanRow, field) => ({
          ...cleanRow,
          [field]: String(row?.[field] || '').trim()
        }), {}))
        .filter((row) => Object.values(row).some(Boolean))
    }
  };
};

const createPlanController = ({ Model, listKey, rowFields, singularLabel, memberAssignmentField, kind }) => {
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

  const getDefaultPlans = async (_req, res) => {
    try {
      const templates = await SystemPlanTemplate.find({ kind }).sort({ category: 1, name: 1 }).lean();
      res.json({ templates });
    } catch (error) {
      console.error(`Get default ${listKey} error:`, error);
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
        { ...payload.data, isCustomized: true, updatedAt: new Date() },
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

  const cloneDefaultPlan = async (req, res) => {
    try {
      const template = await SystemPlanTemplate.findOne({ kind, templateCode: req.params.templateCode }).lean();
      if (!template) return res.status(404).json({ message: 'Default template not found' });
      const existing = await Model.findOne({ gymId: req.gymId, templateCode: template.templateCode });
      if (existing) return res.json({ message: 'Existing customized plan returned', plan: existing, existing: true });
      const plan = await Model.create({ gymId: req.gymId, templateCode: template.templateCode, isCustomized: false, isActive: true, name: template.name, description: template.description, note: template.note, details: template.details, category: template.category, goal: template.goal, difficulty: template.difficulty, dietPreference: template.dietPreference, tableRows: template.tableRows });
      return res.status(201).json({ message: `${singularLabel} added to your plans`, plan });
    } catch (error) {
      if (error.code === 11000) {
        const plan = await Model.findOne({ gymId: req.gymId, templateCode: req.params.templateCode });
        return res.json({ message: 'Existing customized plan returned', plan, existing: true });
      }
      console.error(`Clone default ${singularLabel} error:`, error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  const duplicatePlan = async (req, res) => {
    try {
      const source = await Model.findOne({ _id: req.params.id, gymId: req.gymId }).lean();
      if (!source) return res.status(404).json({ message: `${singularLabel} not found` });
      const baseName = `${source.name} Copy`;
      let name = baseName;
      let suffix = 2;
      while (await Model.exists({ gymId: req.gymId, name })) { name = `${baseName} ${suffix}`; suffix += 1; }
      const { _id, createdAt, updatedAt, templateCode, ...copy } = source;
      const plan = await Model.create({ ...copy, name, gymId: req.gymId, isCustomized: true, isActive: source.isActive !== false });
      return res.status(201).json({ message: `${singularLabel} duplicated successfully`, plan });
    } catch (error) {
      console.error(`Duplicate ${singularLabel} error:`, error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  const updatePlanStatus = async (req, res) => {
    try {
      if (typeof req.body.isActive !== 'boolean') return res.status(400).json({ message: 'isActive must be true or false' });
      const plan = await Model.findOneAndUpdate({ _id: req.params.id, gymId: req.gymId }, { isActive: req.body.isActive, updatedAt: new Date() }, { new: true });
      if (!plan) return res.status(404).json({ message: `${singularLabel} not found` });
      return res.json({ message: `${singularLabel} status updated`, plan });
    } catch (error) {
      console.error(`Update ${singularLabel} status error:`, error);
      return res.status(500).json({ message: 'Server error' });
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
    getDefaultPlans,
    createPlan,
    updatePlan,
    deletePlan,
    cloneDefaultPlan,
    duplicatePlan,
    updatePlanStatus
  };
};

module.exports = createPlanController;
