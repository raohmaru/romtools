require 'fileutils'
require 'nokogiri'

# Options
romlist = false
output_file = 'arcade_roms_filtered.txt'
output_xml = false
print_desc = false
dryrun = false
manufacturer = false
skip_attrs = false
# Variables
roms_total = 0
rom_count = 0
clones_count = 0
roms_skipped = 0
output = ''
roms = {}
clones = {}
# Const
HELP = <<eof

Arcade ROMs Filter 1.0
----------------------
Generates a list of filtered arcade ROMs given a romlist XML Dat file.
The filter excludes by default:
- BIOS files
- Neo Geo ROMs
- Clones, except if they support a number of players different form the parent ROM

Usage:
  ruby arcade_roms_filter.rb [romlist] [-o [output.file] -x [xml.file] -pd -m [manufacturer] -s [attr1[,attrN]] -d]
  
Arguments:
    romlist XML Dat file with the ROMs
    -o  Output file with the filtered ROMs
    -x  Creates a XML Dat file
    -pd Print description of the rom and size (uncompressed)
    -m  Filter only ROMs of the given manufacturer (case-insensitive)
    -s  Skip ROMs that matches the comma-separated list of attributes (case-insensitive)
    -d  Doesn't output any file. Prints output in the terminal
    -h  Display this help
eof

# Get arguments
unless ARGV.empty?
  ARGV.each_with_index { |item, i|
    if item == "-o"
      output_file = ARGV[i+1]
    elsif item == "-x"
      output_xml = ARGV[i+1]
    elsif item == "-m"
      manufacturer = ARGV[i+1].downcase
    elsif item == "-pd"
      print_desc = true
    elsif item == "-d"
      dryrun = true
    elsif item == "-s"
      skip_attrs = ARGV[i+1].downcase.split(',')
    elsif item == "-h"
      puts HELP
      exit
    else
      if !romlist && File.exists?(item) && !File.directory?(item)
        romlist = item
      end
    end
  }
end

if !romlist
  puts HELP
  exit
end

# Functions
def getRomSize(rom)
    rom_bytes = rom.xpath('rom').to_a.inject(0) do |sum, r|
      sum + r['size'].to_i
    end
    
    rom_size = rom_bytes / 1024  # KB
    unit = 'KB'
    if rom_size.to_s.length > 3
      rom_size = (rom_size / 1024.0).round(2)  # MB
      unit = 'MB'
    end
    
    return rom_size.to_s + ' ' + unit
end

# Do the magic
doc = File.open(romlist) { |f| Nokogiri::XML(f) }
if output_xml
  builder = Nokogiri::XML::Builder.new do |xml|
     xml.doc.create_internal_subset(
      'datafile',
      '-//FB Alpha//DTD ROM Management Datafile//EN',
      'http://www.logiqx.com/Dats/datafile.dtd'
    )
    xml.datafile {
      xml.header {
        xml.name "Arcade Games Filtered"
        xml.description "Arcade Games"
        xml.category "Standard DatFile"
        xml.author "[Your name here]"
        xml.clrmamepro(:forcenodump => "ignore")
      }
    }
  end
  dat = builder.doc
end

doc.xpath('/datafile/game[not(@isbios)]').each do |game|
  roms_total += 1
  cloneof = game['cloneof']
  if cloneof
    if !clones.key?(cloneof)
      clones[cloneof] = []
    end
    clones[cloneof].push game
  else
    next if game.key?('romof')  # Skip Neo Geo roms
    if skip_attrs
      descr = game.at('description').content.downcase
      if skip_attrs.any? { |word| descr.include?(word) }
        roms_skipped += 1
        next
      end
    end
    roms[game['name']] = game
  end
end

roms.each do |key, rom|
  next if manufacturer && rom.at('manufacturer').content.downcase != manufacturer

  output += rom['name']
  if print_desc
    output += ' ' * (12-rom['name'].length) + ' -- ' + rom.at('description').content
    output += " (#{getRomSize(rom)})"
  end
  output += $/
  rom_count += 1
  if clones.key?(key)
    clones[key].each do |clone|
      desc = clone.at('description').content
      if desc =~ /\bPlayers\b/i  # Valid clone
        if print_desc
          output += '    '
        end
        output += clone['name']
        if print_desc
          output += ' ' * (16-clone['name'].length) + ' -- ' + desc
          output += " (#{getRomSize(rom)})"
        end
        output += $/
        clones_count += 1
        if output_xml
          dat.root.add_child clone
        end
      end
    end
  end
  if output_xml
    dat.root.add_child rom
  end
end

if dryrun
  puts output
else
  open(output_file, 'w') { |f|
    f.puts output
  }
  if output_xml
    File.write(output_xml, dat.to_xml)
  end
end

puts "ROMs in DAT file: #{roms_total}"
puts "Found #{rom_count} roms and #{clones_count} valid clones (#{rom_count+clones_count} total)"
if skip_attrs
  puts "Skipped #{roms_skipped} ROMs that matched criteria \"#{skip_attrs.join(', ')}\""
end
unless dryrun
  puts $/
  puts "Created file \"#{output_file}\" with filtered ROM list"
end