require 'fileutils'

# Options
working_dir = '.'
output_dir = ''
romlist = false
inc_clones = false
dry_run = false
copy = false
# Variables
rom_count = 0
rom_total = 0
roms_found = {}
missing = []
# Const
RX_EXT_ZIP = /\.zip$/
HELP = <<eof
Move ROMs 1.0
-------------
Moves zipped ROMs files from the target dir to the specified output directory, given a ROM list generated by roms_filter.rb or arcade_roms_filter.rb.

Usage:
    ruby move_roms.rb [romlist] -t [romddir] [-o [outputdir] -c -d]
    
Arguments:
    romlist Source file with the ROMs
    -t, --target    Directory with the zipped ROMs
    -o, --output    Output directory were to move the ROMs found at romlist
    -c, --clones    Include clones
    -d, --dryrun    Dry run mode (no file is moved)
    -cp, --copy     Copy the ROMs to the output directory instead of moving them
    -h, --help      Display this help
eof

unless ARGV.empty?
  ARGV.each_with_index { |item, i|
    if item == "-t" || item == "--target"
      working_dir = ARGV[i+1]
    elsif item == "-o" || item == "--output"
      output_dir = ARGV[i+1]
    elsif item == "-c" || item == "--clones"
      inc_clones = true
    elsif item == "-d" || item == "--dryrun"
      dry_run = true
    elsif item == "-cp" || item == "--copy"
      copy = true
    elsif item == "-h" || item == "--help"
      puts HELP
      exit
    else
      if !romlist && File.exists?(item) && !File.directory?(item)
        romlist = item
      end
    end
  }
else
  puts HELP
  exit
end

if !romlist
  puts "ERROR: romlist file not found. Type `ruby move_roms.rb -h` for help."
  exit
end

if !File.directory?(working_dir)
  puts "ERROR: Target directory does not exists. Type `ruby move_roms.rb -h` for help."
  exit
end

if output_dir == ''
  output_dir = File.join(working_dir, 'moved')
end

unless File.directory? output_dir
  Dir.mkdir output_dir
end

puts "Running in dry-run mode"

File.open(romlist, "rt") do |f|
  f.each_line do |line|
    roms = []
    rom = line.rstrip
    if inc_clones
      Dir.chdir(working_dir) do
        Dir.glob(rom+"*.zip") do |r|
          next if roms_found[r]
          roms.push r
          roms_found[r] = true
        end
      end
    end
    rom += '.zip' unless RX_EXT_ZIP =~ rom
    roms.push rom
    roms.each do |r|
      rom_total += 1
      romfile = File.join(working_dir, r)
      if File.exists? romfile
        rom_count += 1
        unless dry_run
          args = [romfile, File.join(output_dir, r)]
          if copy
            puts "Copying #{r}..."
            FileUtils.cp(*args)
          else
            puts "Moving #{r}..."
            FileUtils.mv(*args)
          end
        end
      else
        puts "ROM not found: #{r}"
        missing.push(rom)
      end
    end
  end
  puts "\nMoved #{rom_count}/#{rom_total} ROMs to the directory #{output_dir}/"
  if missing.length > 0
    puts "#{missing.length} ROM(s) not found: " + missing.join(", ")
  end
end
# File is closed automatically at end of block, no need to close it