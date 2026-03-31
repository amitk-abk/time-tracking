const { diffMinutes } = require('../src/logic.js');
describe('Timer Logic', () => {
  test('diffMinutes returns correct difference', () => {
    expect(diffMinutes('2026-03-31T10:00', '2026-03-31T11:00')).toBe(60);
    expect(diffMinutes('2026-03-31T10:00', '2026-03-31T10:01')).toBe(1);
    expect(diffMinutes('2026-03-31T10:00', '2026-03-31T10:00')).toBe(0);
  });
});
