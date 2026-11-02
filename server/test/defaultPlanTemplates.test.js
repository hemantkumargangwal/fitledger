const test = require('node:test');
const assert = require('node:assert/strict');
const { templates } = require('../data/defaultPlanTemplates');

test('default plan library contains unique workout and diet templates with detail rows', () => {
  const workouts = templates.filter((template) => template.kind === 'workout');
  const diets = templates.filter((template) => template.kind === 'diet');

  assert.equal(workouts.length, 10);
  assert.equal(diets.length, 10);
  assert.equal(new Set(templates.map((template) => template.templateCode)).size, templates.length);
  assert.ok(templates.every((template) => template.name && template.description && template.tableRows.length > 0));
  assert.ok(diets.every((template) => template.note.includes('qualified dietitian')));
});
