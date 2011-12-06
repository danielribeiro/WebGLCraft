require 'rubygems'
require 'rake'
require 'rake/clean'
require 'rubygems/package_task'
require 'rake/testtask'


task :default => [:compile_watch]
#################################
## Custom tasks
#################################
$LOAD_PATH.unshift File.join(File.dirname(__FILE__),'lib')
def compileall(from, to, force = false)
  require 'coffeecompiler'
  outDir = File.expand_path to
  coffeeDir = File.expand_path from
  puts "Compiling all files: #{coffeeDir} -> #{outDir}"
  compiler = CoffeeCompiler.new force
  begin
    compiler.compileAll(__FILE__, coffeeDir, outDir)
  rescue Exception => ex
    puts ex.inspect
  end

end

desc "compile all coffeescripts and start watching them"
task :compile_watch do
  compileall 'lib/', 'public'
  system "watchr", 'compileall.rb'
end

desc "Forces the compilation of all coffeescripts and start watching them"
task :compile do
  compileall 'lib/', 'public', true
  system "watchr", 'compileall.rb'
end

desc "runs unit tests"
task :spec do
  compileall 'lib/', 'public'
  compileall 'spec/coffee', 'spec/javascripts'
  imports = %w[spec/jasmine-node/lib spec/javascripts public]
  system "env NODE_PATH=#{imports.join ':'} node spec/jasmine-node/specs.js"
end
