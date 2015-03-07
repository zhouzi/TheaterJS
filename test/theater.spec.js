(function () {
    "use strict";

    describe("TheaterJS", function () {
        var theater, speech;

        beforeEach(function () {
            theater = new TheaterJS({ autoplay: false });
            speech  = "";

            theater.describe("Vader", .8, function (newValue) { speech = newValue; });
            theater.write("Vader:Hello!");

            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it("should fallback to en if locale is not supported", function () {
            var t = new TheaterJS({ locale: "foo" });
            expect(t.options.locale).toBe("en");
        });

        it("should not be playing", function () {
            expect(theater.state).toBe("ready");
            expect(theater.scene).toBe(-1);
        });

        it("should be playing", function () {
            spyOn(theater, "next").and.callThrough();

            theater.play();

            expect(theater.next).toHaveBeenCalled();
            expect(theater.state).toBe("playing");
        });

        it("should autoplay", function () {
            var t = new TheaterJS();
            t.describe("Luke");

            spyOn(t, "play");

            expect(t.state).toBe("ready");
            t.write("Luke:Hello!");
            expect(t.play).toHaveBeenCalled();
        });

        describe("should replay the scenario from scratch", function () {
            it("when not yet playing", function () {
                spyOn(theater, "next");

                theater.scene = 9;
                theater.play(true);

                expect(theater.scene).toBe(-1);
            });

            it("if already playing, set scene to -1", function () {
                theater.state = "playing";
                theater.scene = 9;
                theater.play(true);

                expect(theater.scene).toBe(-1);
            });
        });

        it("should stop the scenario", function () {
            theater.play();
            theater.stop();

            expect(theater.state).toBe("stopped");
            expect(theater.scene).toBeGreaterThan(-1);
        });

        it("should resume the scenario", function () {
            theater.play();
            theater.stop();

            var scene = theater.scene;
            theater.play();

            expect(theater.scene).toBe(scene + 1); // stop lets the scene ends before actually stopping
            expect(theater.state).toBe("playing");
        });

        it("should train an actor", function () {
            expect(theater.train({ name: "Luke", voice: null })).toEqual({ name: "Luke", model: "", voice: null, experience: .6, speed: .6, accuracy: .6, invincibility: 6 });
            expect(theater.train({ name: "Luke", model: "", voice: null, experience: .6, speed: .6, accuracy: .6, invincibility: 6 })).toEqual({ name: "Luke", model: "", voice: null, experience: .6, speed: .6, accuracy: .6, invincibility: 6 });
            expect(theater.train({ name: "Luke", voice: null, experience: .6 })).toEqual({ name: "Luke", model: "", voice: null, experience: .6, speed: .6, accuracy: .6, invincibility: 6 });
        });

        it("should add an actor to the casting", function () {
            expect(theater.casting["Vader"]).toBeDefined();
            expect(theater.casting["Luke"]).toBeUndefined();

            theater.describe("Luke");
            expect(theater.casting["Luke"]).toBeDefined();

            theater.describe("Boba", {});
            expect(theater.casting["Boba"]).toBeDefined();
        });

        describe("should add the proper scenes", function () {
            beforeEach(function () {
                theater.scenario = [];
            });

            it("with a scene object { name: 'actor', args: ['Vader'] }", function () {
                theater.write({ name: "actor", args: ["Vader"] });

                expect(theater.scenario.length).toEqual(1);

                expect(theater.scenario[0].name).toBe("actor");
                expect(theater.scenario[0].args).toEqual(["Vader"]);
            });

            it("through the shorthand 'Vader:Hello!'", function () {
                theater.write("Vader:Hello!");

                expect(theater.scenario.length).toEqual(3);

                expect(theater.scenario[0].name).toBe("actor");
                expect(theater.scenario[0].args).toEqual(["Vader"]);

                expect(theater.scenario[1].name).toBe("erase");
                expect(theater.scenario[1].args).toEqual([]);

                expect(theater.scenario[2].name).toBe("say");
                expect(theater.scenario[2].args).toEqual(["Hello!", false]);
            });

            it("through the shorthand 'I am your father'", function () {
                theater.write("I am your father");

                expect(theater.scenario.length).toEqual(1);

                expect(theater.scenario[0].name).toBe("say");
                expect(theater.scenario[0].args).toEqual(["I am your father", true]);
            });

            it("through the shorthand -1", function () {
                theater.write(-1);

                expect(theater.scenario.length).toEqual(1);

                expect(theater.scenario[0].name).toBe("erase");
                expect(theater.scenario[0].args).toEqual([-1]);
            });

            it("through the shorthand 100", function () {
                theater.write(100);

                expect(theater.scenario.length).toEqual(1);

                expect(theater.scenario[0].name).toBe("wait");
                expect(theater.scenario[0].args).toEqual([100]);
            });

            it("through the shorthand function () {}", function () {
                theater.write(function () { return "foo"; });

                expect(theater.scenario.length).toEqual(1);

                expect(theater.scenario[0].name).toBe("call");
                expect(theater.scenario[0].args[0].toString()).toEqual((function () { return "foo"; }).toString());
            });

            it("with an array of arguments", function () {
                theater.write(["Vader:Hello!", "I am your father"]);

                expect(theater.scenario.length).toEqual(4);

                expect(theater.scenario[0].name).toBe("actor");
                expect(theater.scenario[0].args).toEqual(["Vader"]);

                expect(theater.scenario[1].name).toBe("erase");
                expect(theater.scenario[1].args).toEqual([]);

                expect(theater.scenario[2].name).toBe("say");
                expect(theater.scenario[2].args).toEqual(["Hello!", false]);

                expect(theater.scenario[3].name).toBe("say");
                expect(theater.scenario[3].args).toEqual(["I am your father", true]);
            });
        });

        it("should set the current actor", function () {
            expect(theater.current).toEqual({});
            theater.actor("Vader");
            expect(theater.current["name"]).toBe("Vader");
        });

        it("should set current actor's model", function () {
            spyOn(theater, "next");
            theater.actor("Vader");

            theater.set("I am your father.");
            expect(theater.current.model).toBe("I am your father.");
            expect(speech).toBe("I am your father.");
        });

        it("should recover from mistakes", function () {
            theater.actor("Vader");
            theater.current.accuracy = 2;

            expect(theater.recover(0)).toBe(true);

            theater.current.accuracy = 0;
            expect(theater.recover(8)).toBe(true);
        });

        it("should not recover from mistakes", function () {
            theater.actor("Vader");
            theater.current.accuracy = -1;

            expect(theater.recover(0)).toBe(false);
        });

        it("should be mistaking", function () {
            theater.actor("Vader");
            theater.current.accuracy = -1;

            expect(theater.isMistaking()).toBe(true);
        });

        it("should not be mistaking", function () {
            theater.actor("Vader");
            theater.current.accuracy = .8;

            expect(theater.isMistaking()).toBe(false);
        });

        it("should register an event", function () {
            expect(theater.events).toEqual({});

            theater.on("scope:event", function () {});
            theater.on("event2, event3", function () {});

            expect(theater.events["scope:event"]).toBeDefined();
            expect(theater.events["event2"]).toBeDefined();
            expect(theater.events["event3"]).toBeDefined();
        });

        it("should emit an event", function () {
            var spy1 = jasmine.createSpy("event with a scope and event name");
            theater.on("scope:event", spy1);

            theater.emit("scope", "event", ["Hello!"]);
            expect(spy1).toHaveBeenCalledWith("scope:event", "Hello!");

            var spy2 = jasmine.createSpy("event without an event name");
            theater.on("customEvent", spy2);

            theater.emit("customEvent", ["Hello!"]);
            expect(spy2).toHaveBeenCalledWith("customEvent", "Hello!");
        });

        it("should call a method", function () {
            var fn = jasmine.createSpy("fn");
            spyOn(theater, "next");

            theater.call(fn);
            expect(fn).toHaveBeenCalled();
            expect(theater.next.calls.count()).toBe(1);

            theater.call(fn, true);
            expect(fn).toHaveBeenCalled();
            expect(theater.next.calls.count()).toBe(1);
        });

        it("should make an actor say something", function () {
            // poor accuracy to make mistakes and be sure the end result is correct
            theater.casting["Vader"].accuracy = .2;

            theater.play();
            jasmine.clock().tick(9999);
            expect(speech).toBe("Hello!");

            theater.write(" I am your father.");
            theater.play();
            jasmine.clock().tick(9999);
            expect(speech).toBe("Hello! I am your father.");
        });

        it("should wait for a given delay before calling next", function () {
            spyOn(theater, "next");
            theater.wait(100);

            jasmine.clock().tick(99);
            expect(theater.next).not.toHaveBeenCalled();

            jasmine.clock().tick(1);
            expect(theater.next).toHaveBeenCalled();
        });
    });
})();