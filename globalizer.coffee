# Cofeescript Plugin that makes all top level varibles globals. Coffeescript generated
# vars are ignored.
puts = (arg) -> console.log arg
getVars = (line) ->
    return [] unless line.indexOf('var ') >= 0
    line.replace('var ', '').replace(';', '').trim().split /\s*,\s*/

addToTheEnd = (array, addedArray) ->
    addedArray.unshift(-2, 0)
    Array.prototype.splice.apply array, addedArray

CoffeeScript.on 'success', (task) ->
    lines = task.output.split(/\n/)
    containsEqual = lines[1].indexOf("=") >= 0
    variables = if containsEqual then [] else getVars(lines[1])
    newLines = "window.#{v} = #{v}" for v in variables
    addToTheEnd lines, newLines
    task.output = lines.join "\n"
