import utils from "../utils";

describe("utils", () => {
  it("has a method that merges an object into another", () => {
    expect(
      utils.merge({}, { foo: "foo", bar: "foo" }, { bar: "bar", baz: "baz" })
    ).toEqual({ foo: "foo", bar: "bar", baz: "baz" });
  });

  it("has a method that returns a percentage between two numbers", () => {
    expect(utils.getPercentageOf(250, 700, 0.1)).toBe(295);
    expect(utils.getPercentageOf(120, 450, 0.5)).toBe(285);
    expect(utils.getPercentageOf(80, 90, 0.8)).toBe(88);
    expect(utils.getPercentageOf(220, 400, 1)).toBe(400);
    expect(utils.getPercentageOf(150, 1500, 0)).toBe(150);
  });
});
