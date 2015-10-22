/* global describe, it, expect */

import html from '../src/helpers/html'

describe('html utils', function () {
  it('has a strip method that strips html from a string', function () {
    expect(html.strip('<h1 id="some-id" class="some-class">Hey<br/> <strong aria-attribute="some-attribute">there!</strong><img src="/whatever.png"></h1>')).toBe('Hey there!')
  })

  it('has a map and inject method that can re-inject html in a mapped string', function () {
    let candidate = '<h1 id="some-id" class="some-class">Hey<br/> <strong aria-attribute="some-attribute">there!</strong><img src="/whatever.png"/></h1>'
    let map = html.map(candidate)

    expect(map).toEqual([
      {
        tagName: '<h1 id="some-id" class="some-class">',
        position: 0
      },

      {
        tagName: '<br/>',
        position: 39
      },

      {
        tagName: '<strong aria-attribute="some-attribute">',
        position: 45
      },

      {
        tagName: '</strong>',
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
        tagName: '</h1>',
        position: 126,
        opener: {
          tagName: '<h1 id="some-id" class="some-class">',
          position: 0
        }
      }
    ])

    expect(html.inject('Hey there!', map)).toBe(candidate)

    candidate = '<a href="http://google.com/">Some site</a><br/> there!'
    map = html.map(candidate)

    expect(html.inject('', map)).toBe('')
    expect(html.inject('S', map)).toBe('<a href="http://google.com/">S</a>')
    expect(html.inject('Some site', map)).toBe('<a href="http://google.com/">Some site</a><br/>')
    expect(html.inject('Some si', map)).toBe('<a href="http://google.com/">Some si</a>')
    expect(html.inject('Some site t', map)).toBe('<a href="http://google.com/">Some site</a><br/> t')
    expect(html.inject('whatever', map)).toBe('<a href="http://google.com/">whatever</a>')
    expect(html.inject('whatever you want', map)).toBe('<a href="http://google.com/">whatever </a><br/>you want')
    expect(html.inject('Some site there!', map)).toBe(candidate)

    candidate = '<h1>Hello<br/> there!</h1>'
    map = html.map(candidate)

    expect(html.inject('', map)).toBe('')
    expect(html.inject('H', map)).toBe('<h1>H</h1>')
    expect(html.inject('Hel', map)).toBe('<h1>Hel</h1>')
    expect(html.inject('Hello', map)).toBe('<h1>Hello<br/></h1>')
    expect(html.inject('Hello th', map)).toBe('<h1>Hello<br/> th</h1>')
  })
})
