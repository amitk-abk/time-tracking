// Database/localStorage test
const { save, load } = require('../src/logic.js');

describe('LocalStorage Persistence', () => {
  let localStorageMock;
  beforeEach(() => {
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: key => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
      };
    })();
    global.localStorage = localStorageMock;
    localStorage.clear();
  });

  test('save and load data', () => {
    save('testKey', { foo: 'bar' });
    const data = load('testKey', {});
    expect(data.foo).toBe('bar');
  });
});
