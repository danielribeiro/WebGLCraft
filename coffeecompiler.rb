require 'fileutils'
require 'set'
require 'find'
require 'open3'


class CoffeeCompiler
  attr_reader :plugin, :force

  def initialize(plugin = nil, force = false)
    @plugin = plugin
    @force = force
  end

  def compile(filename, outputDir = nil)
    FileUtils.mkpath outputDir if outputDir
    return if doesnNeedCompiling(filename, outputDir)
    args = ["coffee"]
    args.push '-r', plugin if plugin
    args.push '-o', outputDir if outputDir
    args.push '-c', filename
    Open3.popen3 *args do |stdin, stdout, stderr|
      error_message = stderr.read
      unless error_message.empty?
        msg = "CoffeeScript compile failed. #{error_message}"
        msg += "\n Command line: #{args.inspect}"
        raise msg
      end
    end
  end

  def doesnNeedCompiling(filename, outputDir)
    return false if force
    jsName = filename.gsub(".coffee", ".js")
    outputDir = File.dirname(filename) if outputDir.nil?
    cacheName = File.join outputDir, File.basename(jsName)
    exists = File.exist?(cacheName)
    return exists && File.stat(cacheName).mtime >= File.stat(filename).mtime
  end

  def compileAll(baseFile, coffeeDir, outDir)
    Dir["#{coffeeDir}/**/*.coffee"].each do |f|
      subPath = File.dirname f.gsub /^#{coffeeDir}\//, ''
      dir = "#{outDir}/#{subPath}"
      compile f, dir
    end
  end

  def compileDir(dir, outputDir = nil)
    Dir["#{dir}/**/*.coffee"].each {|f| compile f, outputDir}
  end

end