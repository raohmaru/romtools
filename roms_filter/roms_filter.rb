require 'fileutils'

# Options
working_dir = '.'
output = '_selection.txt'
$analyze = false
$skip_attrs = false
# Variables
rom_count = 0
tmp_roms = []
roms = []
roms_attrs = {}
last_match = false
# Constants
RX_ATTRS = /\(([^()]+)\)/
RX_IS_USA = /\(.*USA[^)]*\)/i
RX_IS_WORLD = /\(.*World[^)]*\)/i
RX_IS_EUROPE = /\(.*Europe[^)]*\)/i
RX_GAMECUBE = /\(.*GameCube[^)]*\)/i
RX_HAS_VERSION_NUMBER = /\((Rev|v)[^)]*\)/i
RX_NAME = /(^[^(]+)/
HELP = <<eof
ROMs filter 1.0
---------------
Generates a list of filtered ROMs given a folder with zipped ROMs. Works best with No-Intro ROMs.
The filter selects one ROM from a group of ROMs with the same name using the following criteria:
- Country preference: USA, World, Europe, other countries
- Highest version/revision number
- GameCube reedition

Usage:
    ruby roms_filter.rb -t [targetdir] [-o [output.file] -d -s [attr1[,attrN]]]

Arguments:
    -t  Target dir with the zipped ROMs.
    -o  Output file were write the filtered ROMs.
    -d  Dry run/Analyze mode. Prints output in the terminal.
    -s  Skip ROMs that matches the comma-separated list of attributes. Case insensitive.
    -np Skip ROMs with the attributes "Beta", "Proto", "Sample" or "Demo".
    -h  Display this help.
eof

unless ARGV.empty?
  ARGV.each_with_index { |item, i|
    if item == "-t"
      working_dir = ARGV[i+1]
    elsif item == "-o"
      output = ARGV[i+1]
    elsif item == "-d"
      $analyze = true
    elsif item == "-s"
      $skip_attrs = ARGV[i+1].split(',')
    elsif item == "-np"
      if !$skip_attrs
        $skip_attrs = []
      end
      $skip_attrs.push "Beta", "Proto", "Sample", "Demo"
    elsif item == "-h"
      puts HELP
      exit
    end
  }
else
  puts HELP
  exit
end

if !File.directory?(working_dir)
  puts HELP
  exit
end

def filter_roms(roms, roms_attrs)
  points = Array.new(roms.length, 0)
  revs = {}
  chosen = 0
  roms.each_with_index { |rom, i|
    attrs = rom.scan(RX_ATTRS).flatten
    if attrs.length == 0
      puts "Invalid ROM (missing region): " + rom
      next
    end
    
    attrs.each {|v| roms_attrs[v] = 1}
    
    if rom =~ RX_IS_USA
      points[i] += 3
    elsif rom =~ RX_IS_WORLD
      points[i] += 2
    elsif rom =~ RX_IS_EUROPE
      points[i] += 1
    end
    # Re-edition of some NES games for the GameCube
    if rom =~ RX_GAMECUBE
      points[i] += 1
    end
    if rom =~ RX_HAS_VERSION_NUMBER
      if !revs[attrs[0]]
        revs[attrs[0]] = 0
      end
      revs[attrs[0]] += 1
      points[i] += 0.1 * revs[attrs[0]]
    end
    if $skip_attrs
      skip = false
      attrs.each { |a|
        a = a.downcase
        $skip_attrs.each { |sa|
          if a.include? sa.downcase
            skip = true
            break
          end
        }
      }
      points[i] = -1 if skip
    end
    
    chosen = i if points[i] >= points[chosen]
  }
  
  if $analyze
    roms.each_with_index { |rom, i|
      mark = i == chosen && points[i] > -1 ? '*' : ' '
      puts sprintf('%-4g %s%s', points[i], mark, rom)
    }
    puts ''
  end
  
  return points[chosen] > -1 ? roms[chosen] : nil
end

Dir.chdir(working_dir) do
  Dir.glob("*.zip") do |file|
    next if File.directory?(file)
    rom_count += 1
    match = RX_NAME.match(file)
    if match
      match = match.to_s.rstrip!
      if last_match && last_match != match
        roms.push filter_roms(tmp_roms, roms_attrs)
        tmp_roms = []
      end
      tmp_roms.push(file)
      last_match = match
    end
  end
  roms.push filter_roms(tmp_roms, roms_attrs)
end

roms.compact!
summary = "Selected #{roms.length} of #{rom_count} roms"
puts summary

if !$analyze
  open(output, 'w') { |f|
    # f.puts summary
    # f.puts ARGV.join(' ')
    # f.puts ''
    f.puts roms
  }
  puts "List of filtered ROMs written to #{File.expand_path(output)}"
else
  puts "", "All rom attributes:", ""
  puts roms_attrs.keys.sort
end