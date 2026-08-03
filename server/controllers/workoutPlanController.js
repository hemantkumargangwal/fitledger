const WorkoutPlan = require('../models/WorkoutPlan');
const createPlanController = require('./planControllerFactory');

module.exports = createPlanController({
  Model: WorkoutPlan,
  listKey: 'workoutPlans',
  rowFields: ['day', 'exercise', 'sets', 'reps', 'rest'],
  singularLabel: 'Workout plan',
  memberAssignmentField: 'plan'
});
