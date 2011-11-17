importAll = (from) ->
    for i of from
        global[i] = from[i]

partIs = (htmlPart, expected) ->
    same htmlPart.to_html(), expected

same = (thi, that) ->
    expect(thi).toEqual(that)

require 'specBrowserAdapter.js'
describe "Basic Tests", ->
    it "works", ->
        same "oi", new String('oi')
