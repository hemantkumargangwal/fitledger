const DietPlan = require('../models/DietPlan');
const createPlanController = require('./planControllerFactory');

module.exports = createPlanController({
  Model: DietPlan,
  listKey: 'dietPlans',
  rowFields: ['time', 'meal', 'food', 'quantity', 'calories'],
  singularLabel: 'Diet plan',
  memberAssignmentField: 'diet'
});
