require 'coffeecompiler'
def pathAndCreate(path)
  p = File.expand_path path
  toCreate = File.dirname p
  FileUtils.mkpath toCreate
end

# Watchr script that compiles all coffee files.
puts "Watching coffeescript files..."
comp = CoffeeCompiler.new './globalizer.coffee'
watch '.*\.coffee'  do |filearg|
  f = filearg[0]
  unless f =~ /globalizer/
    outDir = 'public'
    coffeeDir = 'lib/coffee'
    subPath = File.dirname f.gsub /^#{coffeeDir}\//, ''
    #    puts "compiling #{f} -> #{outDir}/#{subPath}"
    dir = if subPath != '.'
      "#{outDir}/#{subPath}"
    else
      outDir
    end
    pathAndCreate dir
    begin
      comp.compile f, dir
    rescue Exception => e
      p e
    end
  end
end
