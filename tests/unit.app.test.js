// Unit tests for core logic in logic.js
const { diffMinutes, formatMinutes } = require('../src/logic.js');

describe('Time Utility Functions', () => {
  test('diffMinutes returns correct difference', () => {
    expect(diffMinutes('2026-03-31T10:00', '2026-03-31T11:00')).toBe(60);
    expect(diffMinutes('2026-03-31T10:00', '2026-03-31T10:01')).toBe(1);
    expect(diffMinutes('2026-03-31T10:00', '2026-03-31T10:00')).toBe(0);
  });

  test('formatMinutes formats as HH:MM', () => {
    expect(formatMinutes(0)).toBe('00:00');
    expect(formatMinutes(5)).toBe('00:05');
    expect(formatMinutes(65)).toBe('01:05');
    expect(formatMinutes(135)).toBe('02:15');
  });
});
