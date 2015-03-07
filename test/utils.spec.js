(function () {
    "use strict";

    describe("TheaterJS utils", function () {
        var theater;

        beforeEach(function () {
            theater = new TheaterJS({ autoplay: false, locale: "en" });
        });

        it("should recognize an array", function () {
            var candidates = [null, false, true, {}, "", 1, 0, -1, function () {}];

            for (var i = 0; i < candidates.length; i++) {
                expect(theater.utils.isArray(candidates[i])).toBe(false);
            }

            expect(theater.utils.isArray([])).toBe(true);
        });

        it("should recognize a function", function () {
            var candidates = [null, false, true, {}, "", 1, 0, -1, []];

            for (var i = 0; i < candidates.length; i++) {
                expect(theater.utils.isFunction(candidates[i])).toBe(false);
            }

            expect(theater.utils.isFunction(function () {})).toBe(true);
        });

        it("should recognize a string", function () {
            var candidates = [null, false, true, {}, function () {}, 1, 0, -1, []];

            for (var i = 0; i < candidates.length; i++) {
                expect(theater.utils.isString(candidates[i])).toBe(false);
            }

            expect(theater.utils.isString("")).toBe(true);
        });

        it("should recognize a number", function () {
            var candidates = [null, false, true, {}, function () {}, "", []],
                i;

            for (i = 0; i < candidates.length; i++) {
                expect(theater.utils.isNumber(candidates[i])).toBe(false);
            }

            candidates = [-1, -.1, 0, .1, 1];

            for (i = 0; i < candidates.length; i++) {
                expect(theater.utils.isNumber(candidates[i])).toBe(true);
            }
        });

        it("should recognize an object", function () {
            var candidates = [null, false, true, "", function () {}, 1, 0, -1, []];

            for (var i = 0; i < candidates.length; i++) {
                expect(theater.utils.isObject(candidates[i])).toBe(false);
            }

            expect(theater.utils.isObject({})).toBe(true);
        });

        it("should strip html", function () {
            var str = '<b>Hello! </b><br/>I am your <a href="#">father</a>. Type your name: <input>';

            expect(theater.utils.stripHTML(str)).toBe("Hello! I am your father. Type your name: ");
        });

        it("should map html", function () {
            var str = '<b>Hello! </b><br/>I am your <a href="#">father</a>. Type your name: <input> Or <br/>skip <button type="button">this step</button>';

            expect(theater.utils.mapHTML(str)).toEqual([
                { tagName: '<b>', position: 0 },
                { tagName: '</b>', position: 10, opener: { tagName: '<b>', position: 0 } },
                { tagName: '<br/>', position: 14 },
                { tagName: '<a href="#">', position: 29 },
                { tagName: '</a>', position: 47, opener: { tagName: '<a href="#">', position: 29 } },
                { tagName: '<input>', position: 69 },
                { tagName: '<br/>', position: 80 },
                { tagName: '<button type="button">', position: 90 },
                { tagName: '</button>', position: 121, opener: { tagName: '<button type="button">', position: 90 } }
            ]);
        });

        it("should inject html", function () {
            var str      = '<b>Hello! </b><br/>I am your <a href="#">father</a>. Type your name: <input> Or <br/>skip <button type="button">this step</button>',
                map      = theater.utils.mapHTML(str),
                stripped = theater.utils.stripHTML(str);

            expect(theater.utils.injectHTML(stripped, map)).toBe(str);
        });

        it("should map a keyboard", function () {
            var keyboard = ["ab", "cd"];
            expect(theater.utils.mapKeyboard(keyboard)).toEqual({ a: { x: 0, y: 0 }, b: { x: 1, y: 0 }, c: { x: 0, y: 1 }, d: { x: 1, y: 1 } });
        });

        it("should merge two objects", function () {
            var org  = { foo: "foo", quz: "quz" },
                dest = { bar: "bar", quz: "bar" },
                mrg  = theater.utils.merge(org, dest);

            expect(mrg).toEqual({ foo: "foo", bar: "bar", quz: "bar" });
        });

        it("should return x% of a number while defining min (0%) and max (100%)", function () {
            expect(theater.utils.getPercentageBetween(30, 250, 0)).toBe(30);
            expect(theater.utils.getPercentageBetween(30, 250, .5)).toBe(140);
            expect(theater.utils.getPercentageBetween(30, 250, 1)).toBe(250);
        });

        it("should return a character physically placed near the given one", function () {
            var correctResults = ["w", "a", "s"],
                i = 0;

            while (i++ < 500) {
                expect(correctResults.indexOf(theater.utils.randomCharNear("q"))).toBeGreaterThan(-1);
            }
        });

        it("should return a random character", function () {
            var i = 0, chars = "azerty";

            theater.utils.keyboard = chars.split("");

            while (i++ < 500) expect(chars.indexOf(theater.utils.randomChar())).toBeGreaterThan(-1);
        });

        it("should return a random number between min and max", function () {
            var i = 0, n;

            while (i++ < 500) {
                n = theater.utils.randomNumber(50, 250);

                expect(n).toBeGreaterThan(49);
                expect(n).toBeLessThan(251);
            }
        });

        it("should return a random float number between min and max", function () {
            var i = 0, n;

            while (i++ < 500) {
                n = theater.utils.randomFloat(0, 1);

                expect(theater.utils.isNumber(n) && (n === 0 || n === 1 || n % 1 !== 0)).toBe(true);
                expect(n).toBeGreaterThan(-0.1);
                expect(n).toBeLessThan(1.1);
            }
        });
    });
})();