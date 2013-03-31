{spawn} = require 'child_process'
puts = console.log

system = (name, args, callback) ->
    print = (buffer) -> process.stdout.write buffer.toString()
    proc = spawn name, args
    proc.stdout.on 'data', print
    proc.stderr.on 'data', print
    proc.on        'exit', (status) -> callback?()

compileall = (from, to, watch = false, callback = null) ->
    args = ['-o', to, '-c', from]
    args.unshift '-w' if watch
    system 'coffee', args, callback

task 'c', 'Compile and watch', ->
    compileall 'lib/', 'public/', true

task 'compile', 'Compile', ->
    puts "Compiling..."
    compileall 'lib/', 'public/'

task 'server', 'Serve the current filesystem. Needed for loading textures from fs.
Require python installed.', ->
    system 'python', '-m SimpleHTTPServer'.split(' ')

task 'spec', "runs unit tests", ->
    puts "Make sure to be running server on port 8000"
    compileall 'lib/', 'public/', false, ->
        compileall 'spec/coffee', 'spec/javascripts', false, ->
            system "open", ["http://localhost:8000/spec/web_runner.html"]