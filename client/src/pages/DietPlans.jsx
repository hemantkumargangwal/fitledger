import { Salad } from 'lucide-react';
import PlanManager from './PlanManager';
import { dietPlanService } from '../services/planService';

const DietPlans = () => (
  <PlanManager
    config={{
      route: 'diet-plans',
      service: dietPlanService,
      singularLabel: 'Diet Plan',
      pluralLabel: 'Diet Plans',
      subtitle: 'Create diet plans with description, notes, and meal table details.',
      addButtonLabel: 'Add New Diet',
      namePlaceholder: 'Muscle Gain Veg Diet',
      descriptionPlaceholder: 'Short summary of calories, target, and diet type',
      detailsLabel: 'Diet Details',
      detailsPlaceholder: 'Write full diet instructions here...',
      tableTitle: 'Diet Table',
      icon: Salad,
      iconClass: 'bg-teal-100 text-teal-700',
      rowFields: [
        { key: 'time', label: 'Time', placeholder: '8:00 AM' },
        { key: 'meal', label: 'Meal', placeholder: 'Breakfast' },
        { key: 'food', label: 'Food', placeholder: 'Oats + banana' },
        { key: 'quantity', label: 'Quantity', placeholder: '1 bowl' },
        { key: 'calories', label: 'Calories', placeholder: '350' },
      ],
    }}
  />
);

export default DietPlans;
