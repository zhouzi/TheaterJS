/* global window */
import actor from "../Actor";

let vader;

describe("actor", () => {
  beforeEach(() => {
    jest.spyOn(window.document, "querySelector").mockReturnValue({});
  });

  it("has a read-only name", () => {
    vader = actor("vader");

    expect(vader.name).toBe("vader");
    expect(() => {
      vader.name = "luke";
    }).toThrow();
  });

  describe("has a displayValue property", () => {
    it("that calls a callback when it's changed", () => {
      const spy = jest.fn();
      vader = actor("vader", 0.8, spy);

      vader.displayValue = "Hey!";

      expect(vader.displayValue).toBe("Hey!");
      expect(spy).toHaveBeenCalledWith("Hey!");
    });
  });

  describe("has a shouldBeMistaken method that", () => {
    it("cannot return true if an actor's accuracy is greater or equal to 0.8", () => {
      vader = actor("vader", { accuracy: 0.8 });

      for (let i = 0; i < 100; i += 1) {
        expect(vader.shouldBeMistaken("aaaaa", "aaaaaaaaaa")).toBe(false);
      }
    });

    it("randomly returns true or false when actor's accuracy is below 0.8", () => {
      vader = actor("vader", { accuracy: 0.3 });
      const results = {};

      for (let i = 0; i < 100; i += 1) {
        const returnValue = vader.shouldBeMistaken("aaaa", "aaaaaaaaaa");
        if (results[returnValue] == null) {
          results[returnValue] = 0;
        }

        results[returnValue] += 1;
      }

      expect(Object.keys(results).length).toBe(2);
      expect(Object.keys(results)).toContain("true");
      expect(Object.keys(results)).toContain("false");

      expect(results.true).toBeGreaterThan(0);
      expect(results.false).toBeGreaterThan(0);
    });

    it("return false when actual value's length is <= actor's accuracy", () => {
      vader = actor("vader", { accuracy: 0.3 });

      for (let i = 0; i < 10; i += 1) {
        expect(vader.shouldBeMistaken("a", "aaaaaaaaaa")).toBe(false);
        expect(vader.shouldBeMistaken("aa", "aaaaaaaaaa")).toBe(false);
        expect(vader.shouldBeMistaken("aaa", "aaaaaaaaaa")).toBe(false);
      }
    });

    it("return false if actual value's length is equal to the supposed end value", () => {
      vader = actor("vader");

      for (let i = 0; i < 100; i += 1) {
        expect(vader.shouldBeMistaken("azeqwe", "azerty")).toBe(false);
      }
    });

    it("based on actor's accuracy, cannot return true if actor made a mistake in the previous x characters", () => {
      vader = actor("vader", { accuracy: 0.4 });

      for (let i = 0; i < 100; i += 1) {
        expect(vader.shouldBeMistaken("awwww", "azertyuiop", 1)).toBe(false);
      }
    });

    it("return false if actor just fixed a mistake", () => {
      vader = actor("vader", { accuracy: 0 });
      let i;

      for (i = 0; i < 100; i += 1) {
        expect(
          vader.shouldBeMistaken("hello th", "hello there!", null, 4)
        ).toBe(false);
      }

      for (i = 0; i < 100; i += 1) {
        if (
          vader.shouldBeMistaken("hello th", "hello there!", null, 2) === true
        ) {
          break;
        }
      }

      expect(i).toBeLessThan(100);
    });
  });

  describe("has a getTypingSpeed method that", () => {
    it("return a random value depending on its characteristics", () => {
      vader = actor("vader", { speed: 1 });

      expect(vader.getTypingSpeed(50, 200)).toBe(50);

      vader = actor("vader", { speed: 0.5 });

      for (let i = 0; i < 100; i += 1) {
        const speed = vader.getTypingSpeed(300, 600);

        expect(speed).toBeLessThanOrEqual(450);
        expect(speed).toBeGreaterThanOrEqual(300);
      }
    });
  });
});
