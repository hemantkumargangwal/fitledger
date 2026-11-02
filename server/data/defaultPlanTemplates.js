const workout = (templateCode, name, category, difficulty, goal, rows) => ({
  kind: 'workout', templateCode, name, category, difficulty, goal,
  description: `${name} is a practical ${difficulty.toLowerCase()} program for ${goal.toLowerCase()}.`,
  note: 'Adjust load, volume, and exercise selection for injuries, experience, and recovery. A qualified trainer should review form.',
  details: 'Warm up for 5–10 minutes, use controlled form, and progress only when the prescribed work feels comfortable.',
  tableRows: rows.map(([day, exercise, sets, reps, rest, instructions]) => ({ day, exercise, sets, reps, rest, instructions })),
});

const diet = (templateCode, name, category, dietPreference, goal, meals) => ({
  kind: 'diet', templateCode, name, category, dietPreference, goal,
  description: `${name} provides flexible Indian meal ideas for ${goal.toLowerCase()}.`,
  note: 'General sample plan only—not a medical diet. Adjust portions for goals, appetite, allergies, cultural preferences, dairy/egg/nut/gluten tolerance, and medical conditions. Consult a qualified dietitian or healthcare professional when needed.',
  details: 'Trainers should customize portions and food choices with the member; this plan does not guarantee weight-loss or muscle-gain results.',
  tableRows: meals.map(([time, meal, food, quantity, calories, protein, instructions]) => ({ time, meal, food, quantity, calories, protein, instructions })),
});

const templates = [
  workout('workout-beginner-full-body', 'Beginner Full Body', 'General Fitness', 'Beginner', 'General fitness', [
    ['Mon', 'Goblet squat', '3', '10', '60 sec', 'Keep chest tall'], ['Mon', 'Incline push-up', '3', '8–12', '60 sec', 'Use an elevated surface'], ['Wed', 'Romanian deadlift', '3', '10', '75 sec', 'Hinge at hips'], ['Wed', 'Seated row', '3', '10', '60 sec', 'Pause at chest'], ['Fri', 'Plank', '3', '20–30 sec', '45 sec', 'Brace core'],
  ]),
  workout('workout-weight-loss', 'Weight Loss Workout', 'Weight Loss', 'Beginner', 'Improved conditioning and fat loss', [
    ['Mon', 'Brisk incline walk', '1', '20 min', '—', 'Comfortable pace'], ['Mon', 'Bodyweight squat', '3', '12', '45 sec', 'Controlled tempo'], ['Wed', 'Dumbbell row', '3', '12', '45 sec', 'Each side'], ['Fri', 'Low-impact circuit', '3', '8 min', '90 sec', 'March, step-up, press'],
  ]),
  workout('workout-fat-loss-advanced', 'Fat Loss Advanced', 'Weight Loss', 'Intermediate', 'Conditioning and fat loss', [
    ['Mon', 'Barbell squat', '4', '8', '90 sec', 'Use safe working load'], ['Tue', 'Interval cycling', '8', '40 sec hard / 80 sec easy', '—', 'Maintain technique'], ['Thu', 'Kettlebell swing', '4', '15', '60 sec', 'Hip-driven movement'], ['Sat', 'Farmer carry', '4', '30 m', '60 sec', 'Tall posture'],
  ]),
  workout('workout-muscle-gain-beginner', 'Muscle Gain Beginner', 'Muscle Building', 'Beginner', 'Build muscle and movement skill', [
    ['Mon', 'Leg press', '3', '10–12', '90 sec', 'Full controlled range'], ['Mon', 'Chest press', '3', '10–12', '75 sec', 'Do not lock elbows'], ['Wed', 'Lat pulldown', '3', '10–12', '75 sec', 'Pull to upper chest'], ['Fri', 'Dumbbell shoulder press', '3', '10', '75 sec', 'Seated if needed'],
  ]),
  workout('workout-muscle-gain-intermediate', 'Muscle Gain Intermediate', 'Muscle Building', 'Intermediate', 'Hypertrophy', [
    ['Mon', 'Back squat', '4', '6–8', '120 sec', 'Progress gradually'], ['Tue', 'Bench press', '4', '8', '90 sec', 'Use spotter if needed'], ['Thu', 'Barbell row', '4', '8–10', '90 sec', 'Neutral spine'], ['Fri', 'Leg curl', '3', '12', '60 sec', 'Control eccentric'],
  ]),
  workout('workout-push-pull-legs', 'Push Pull Legs', 'Muscle Building', 'Intermediate', 'Muscle building split', [
    ['Push', 'Overhead press', '4', '8', '90 sec', 'Brace core'], ['Push', 'Cable fly', '3', '12', '60 sec', 'Soft elbows'], ['Pull', 'Assisted pull-up', '4', '8–10', '90 sec', 'Full stretch'], ['Legs', 'Walking lunge', '3', '10/side', '75 sec', 'Stable stride'],
  ]),
  workout('workout-upper-lower', 'Upper Lower Split', 'Muscle Building', 'Intermediate', 'Strength and hypertrophy', [
    ['Upper A', 'Dumbbell bench press', '4', '8–10', '90 sec', 'Control descent'], ['Lower A', 'Deadlift', '3', '5', '150 sec', 'Trainer-supervised form'], ['Upper B', 'Cable row', '4', '10', '75 sec', 'Avoid shrugging'], ['Lower B', 'Split squat', '3', '10/side', '75 sec', 'Keep knee aligned'],
  ]),
  workout('workout-home', 'Home Workout', 'General Fitness', 'Beginner', 'At-home general fitness', [
    ['Mon', 'Chair squat', '3', '12', '45 sec', 'Tap chair lightly'], ['Wed', 'Wall push-up', '3', '10', '45 sec', 'Keep body straight'], ['Fri', 'Glute bridge', '3', '12', '45 sec', 'Pause at top'], ['Sat', 'Mobility flow', '1', '15 min', '—', 'Move without pain'],
  ]),
  workout('workout-general-fitness', 'General Fitness', 'General Fitness', 'Beginner', 'Daily fitness', [
    ['Mon', 'Cycle', '1', '15 min', '—', 'Moderate pace'], ['Wed', 'Dumbbell squat to press', '3', '10', '60 sec', 'Light weight'], ['Fri', 'Cable row', '3', '12', '60 sec', 'Squeeze shoulder blades'], ['Sun', 'Walk', '1', '30 min', '—', 'Easy conversational pace'],
  ]),
  workout('workout-strength', 'Strength Training', 'Strength', 'Advanced', 'Strength development', [
    ['Mon', 'Back squat', '5', '3–5', '180 sec', 'Experienced lifters only'], ['Wed', 'Bench press', '5', '3–5', '180 sec', 'Spotter recommended'], ['Fri', 'Deadlift', '3', '3–5', '180 sec', 'Stop if form breaks'], ['Sat', 'Loaded carry', '4', '40 m', '90 sec', 'Stable trunk'],
  ]),
];

const veg = [
  ['6:30 AM', 'Early Morning', 'Warm water + 5 soaked almonds', 'Adjust to tolerance', '', '3 g', 'Skip nuts if allergic'], ['8:30 AM', 'Breakfast', 'Vegetable poha + curd', '1 bowl + 1/2 cup', '320', '10 g', 'Use seasonal vegetables'], ['11:00 AM', 'Mid-Morning Snack', 'Seasonal fruit + sprouts', '1 fruit + 1/2 cup', '180', '7 g', 'Choose local fruit'], ['1:30 PM', 'Lunch', 'Roti, dal, sabzi, salad', '2 roti + 1 cup dal', '450', '18 g', 'Adjust roti/rice portion'], ['5:00 PM', 'Evening Snack', 'Roasted chana or buttermilk', '1 handful / 1 glass', '140', '7 g', 'Avoid if dairy-sensitive'], ['8:30 PM', 'Dinner', 'Paneer/tofu bhurji with vegetables', '100 g + vegetables', '360', '22 g', 'Use tofu if dairy-free'],
];
const nonVeg = [
  ['6:30 AM', 'Early Morning', 'Warm water + 5 soaked almonds', 'Adjust to tolerance', '', '3 g', 'Skip nuts if allergic'], ['8:30 AM', 'Breakfast', 'Egg bhurji with roti or oats', '2 eggs + 1 roti', '350', '18 g', 'Use paneer/tofu alternative if needed'], ['11:00 AM', 'Mid-Morning Snack', 'Seasonal fruit + curd', '1 fruit + 1/2 cup', '170', '5 g', 'Choose dairy-free alternative if needed'], ['1:30 PM', 'Lunch', 'Chicken/fish, rice or roti, vegetables', '100 g protein + 1 cup carbs', '500', '30 g', 'Choose fish/chicken per preference'], ['5:00 PM', 'Evening Snack', 'Roasted chana or milk', '1 handful / 1 glass', '150', '8 g', 'Adjust for lactose tolerance'], ['8:30 PM', 'Dinner', 'Egg curry or grilled fish with vegetables', '2 eggs or 100 g fish', '380', '25 g', 'Keep oil moderate'],
];

const dietMeals = (preference, style) => {
  const base = (preference === 'Vegetarian' ? veg : nonVeg).map((meal) => [...meal]);
  const replacements = {
    'Weight Loss': preference === 'Vegetarian'
      ? [[1, 'Vegetable oats upma', '1 medium bowl', '280', '9 g'], [3, 'Roti, dal, sabzi, large salad', '1 roti + 1 cup dal', '380', '17 g'], [5, 'Tofu stir-fry with vegetables', '100 g + vegetables', '300', '18 g']]
      : [[1, 'Vegetable omelette + fruit', '2 eggs + 1 fruit', '300', '17 g'], [3, 'Grilled chicken, salad, roti', '100 g + 1 roti', '390', '30 g'], [5, 'Grilled fish with vegetables', '100 g + vegetables', '290', '24 g']],
    'Muscle Gain': preference === 'Vegetarian'
      ? [[1, 'Oats, milk, banana, peanut butter', '1 bowl', '480', '18 g'], [3, 'Rice, rajma, paneer, vegetables', '1.5 cups + 100 g paneer', '650', '30 g'], [5, 'Soy chunk pulao + curd', '1.5 cups', '520', '26 g']]
      : [[1, 'Eggs, oats, banana, milk', '3 eggs + 1 bowl oats', '520', '30 g'], [3, 'Chicken rice bowl with vegetables', '150 g chicken + 1.5 cups rice', '680', '42 g'], [5, 'Fish curry, rice, salad', '150 g fish + 1 cup rice', '560', '35 g']],
    'High Protein': preference === 'Vegetarian'
      ? [[1, 'Besan chilla with paneer', '2 chilla + 75 g paneer', '420', '28 g'], [2, 'Greek curd or soy yogurt', '200 g', '160', '18 g'], [3, 'Dal, soy chunks, roti, vegetables', '1 cup + 75 g soy', '540', '32 g'], [5, 'Tofu tikka salad', '150 g tofu', '320', '24 g']]
      : [[1, 'Egg omelette with oats', '3 eggs + 1 bowl oats', '470', '29 g'], [2, 'Curd with roasted chana', '200 g + 1 handful', '250', '17 g'], [3, 'Chicken, dal, roti, vegetables', '150 g chicken + 1 cup dal', '620', '48 g'], [5, 'Egg and vegetable stir-fry', '3 eggs', '330', '22 g']],
    'Maintenance': preference === 'Vegetarian'
      ? [[1, 'Poha with peas + milk', '1 bowl + 1 glass', '400', '15 g'], [3, 'Roti, dal, seasonal sabzi, curd', '2 roti + 1 cup dal', '520', '20 g'], [5, 'Khichdi with vegetables', '1.5 cups', '400', '15 g']]
      : [[1, 'Eggs, poha, fruit', '2 eggs + 1 bowl', '430', '21 g'], [3, 'Fish curry, rice, vegetables', '100 g fish + 1 cup rice', '540', '28 g'], [5, 'Chicken vegetable soup + roti', '1 bowl + 1 roti', '390', '26 g']],
  };
  (replacements[style] || []).forEach(([index, food, quantity, calories, protein]) => { base[index][2] = food; base[index][3] = quantity; base[index][4] = calories; base[index][5] = protein; });
  return base;
};

[
  ['weight-loss-diet', 'Weight Loss Diet', 'Weight Loss', 'Weight management'], ['muscle-gain-diet', 'Muscle Gain Diet', 'Muscle Gain', 'Muscle gain support'], ['balanced-diet', 'Balanced Diet', 'General Fitness', 'Balanced everyday nutrition'], ['high-protein-diet', 'High Protein Diet', 'High Protein', 'Higher protein meal ideas'], ['weight-maintenance-diet', 'Weight Maintenance Diet', 'Maintenance', 'Weight maintenance'],
].forEach(([code, name, category, goal]) => {
  templates.push(diet(`${code}-veg`, name, category, 'Vegetarian', goal, dietMeals('Vegetarian', category)));
  templates.push(diet(`${code}-non-veg`, name, category, 'Non-Vegetarian', goal, dietMeals('Non-Vegetarian', category)));
});

module.exports = { templates };
