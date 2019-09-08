import type from "../type";

let candidates;

describe("type utils", () => {
  it("has a method that checks if value is a number", () => {
    candidates = [0, -1, 0.8, 123.23, 4, Infinity, -Infinity];
    candidates.forEach(n => {
      expect(type.isNumber(n)).toBe(true);
    });

    candidates = [null, "", "0", "-1", "1", "azerty", () => {}, {}, []];
    candidates.forEach(n => {
      expect(type.isNumber(n)).toBe(false);
    });
  });

  it("has a method that checks if value is a string", () => {
    candidates = ["", "azerty", "2"];
    candidates.forEach(s => {
      expect(type.isString(s)).toBe(true);
    });

    candidates = [0, 2, -1, null, [], {}, () => {}];
    candidates.forEach(s => {
      expect(type.isString(s)).toBe(false);
    });
  });

  it("has a method that checks if value is an object", () => {
    candidates = [{}, { foo: "bar" }];
    candidates.forEach(o => {
      expect(type.isObject(o)).toBe(true);
    });

    candidates = [null, [], 0, 3, -1, "", "foo", () => {}];
    candidates.forEach(o => {
      expect(type.isObject(o)).toBe(false);
    });
  });

  it("has a method that checks if value is an array", () => {
    candidates = [[], ["foo"], [{ foo: "bar" }]];
    candidates.forEach(a => {
      expect(type.isArray(a)).toBe(true);
    });

    candidates = [null, 0, -2, 9, "", "bar", () => {}];
    candidates.forEach(a => {
      expect(type.isArray(a)).toBe(false);
    });
  });

  it("has a method that checks if value is a function", () => {
    candidates = [() => {}];
    candidates.forEach(f => {
      expect(type.isFunction(f)).toBe(true);
    });

    candidates = [null, "", [], {}, 0, -3, 9, "bar"];
    candidates.forEach(f => {
      expect(type.isFunction(f)).toBe(false);
    });
  });
});
