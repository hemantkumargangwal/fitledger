import { Dumbbell } from 'lucide-react';
import PlanManager from './PlanManager';
import { workoutPlanService } from '../services/planService';

const WorkoutPlans = () => (
  <PlanManager
    config={{
      route: 'workout-plans',
      service: workoutPlanService,
      singularLabel: 'Workout Plan',
      pluralLabel: 'Workout Plans',
      subtitle: 'Create workout plans with description, notes, and editable table details.',
      addButtonLabel: 'Add New Workout',
      namePlaceholder: 'Fat Loss Beginner Plan',
      descriptionPlaceholder: 'Short summary of goals, level, and weekly structure',
      detailsLabel: 'Workout Details',
      detailsPlaceholder: 'Write full workout instructions here...',
      tableTitle: 'Workout Table',
      icon: Dumbbell,
      iconClass: 'bg-lime-100 text-lime-700',
      rowFields: [
        { key: 'day', label: 'Day', placeholder: 'Monday' },
        { key: 'exercise', label: 'Exercise', placeholder: 'Bench press' },
        { key: 'sets', label: 'Sets', placeholder: '3' },
        { key: 'reps', label: 'Reps', placeholder: '12' },
        { key: 'rest', label: 'Rest', placeholder: '60 sec' },
      ],
    }}
  />
);

export default WorkoutPlans;
