import voidElements from "void-elements";
import html from "../html";

let candidateHTML;
let candidateMap;
let candidateStr;

describe("html utils", () => {
  beforeEach(() => {
    candidateHTML =
      '<h1 id="some-id" class="some-class">Hey<br/> <strong aria-attribute="some-attribute">there!</strong><img src="/whatever.png"/></h1>';
    candidateMap = [
      {
        tagName: '<h1 id="some-id" class="some-class">',
        position: 0
      },

      {
        tagName: "<br/>",
        position: 39
      },

      {
        tagName: '<strong aria-attribute="some-attribute">',
        position: 45
      },

      {
        tagName: "</strong>",
        position: 91,
        opener: {
          tagName: '<strong aria-attribute="some-attribute">',
          position: 45
        }
      },

      {
        tagName: '<img src="/whatever.png"/>',
        position: 100
      },

      {
        tagName: "</h1>",
        position: 126,
        opener: {
          tagName: '<h1 id="some-id" class="some-class">',
          position: 0
        }
      }
    ];
    candidateStr = "Hey there!";
  });

  describe("has a strip method that", () => {
    it("should remove html from a string", () => {
      expect(html.strip(candidateHTML)).toBe(candidateStr);
    });
  });

  describe("has a map method that", () => {
    it("should return a map of a string's html", () => {
      expect(html.map(candidateHTML)).toEqual(candidateMap);
    });

    it("should be able to map autoclosing tag that are missing the slash", () => {
      Object.keys(voidElements).forEach(voidElement => {
        const str = `<h1>Hey<${voidElement}>there!</h1>`;
        expect(html.map(str)).toEqual([
          { tagName: "<h1>", position: 0 },
          { tagName: `<${voidElement}>`, position: 7 },
          {
            tagName: "</h1>",
            position: str.length - "</h1>".length,
            opener: { tagName: "<h1>", position: 0 }
          }
        ]);
      });
    });
  });

  describe("has an inject method that", () => {
    it("should inject html based on a map", () => {
      expect(html.inject(candidateStr, candidateMap)).toBe(candidateHTML);
    });

    it("should close opened tags even if string is shorter", () => {
      expect(html.inject("H", candidateMap)).toBe(
        '<h1 id="some-id" class="some-class">H</h1>'
      );
      expect(html.inject("Hey t", candidateMap)).toBe(
        '<h1 id="some-id" class="some-class">Hey<br/> <strong aria-attribute="some-attribute">t</strong></h1>'
      );
    });
  });
});
