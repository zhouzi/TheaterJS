import utils from "../utils";

describe("utils", () => {
  it("has a method that merges an object into another", () => {
    expect(
      utils.merge({}, { foo: "foo", bar: "foo" }, { bar: "bar", baz: "baz" })
    ).toEqual({ foo: "foo", bar: "bar", baz: "baz" });
  });
});
