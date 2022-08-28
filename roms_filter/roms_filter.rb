require 'fileutils'

# Options
working_dir = '.'
output = '_selection.txt'
$countries = ["USA", "World", "Europe"]
$analyze = false
$skip_attrs = false
$bios = true
$exclude = false
# Variables
$rom_count = 0
$tmp_roms = []
$roms = []
$roms_attrs = {}
# Constants
RX_ATTRS = /\(([^()]+)\)/
RX_HAS_VERSION_NUMBER = /\((Rev|v)[^)]*\)/i
RX_NAME = /(^[^(]+)/
HELP = <<eof
ROMs filter 1.0
---------------
Generates an opinionated list of filtered ROMs given a folder with zipped ROMs. Works best with No-Intro ROMs.
The filter selects one ROM from a group of ROMs with the same name using the following criteria:
- Country preference: USA, World, Europe, other countries
- Highest version/revision number
- GameCube reedition

Usage:
    ruby roms_filter.rb -t [dir or file] [-o [output.file] -d -s [attr1[,attrN]]]

Arguments:
    -t, --target     Target dir with the zipped ROMs, or a file with a carriage return-separated list of ROMs.
    -o, --output     Output file where to write the filtered ROMs list. If omitted the file _selection.txt will be used.
    -c, --countries  Country preference: a comma-separated list of countries, from more relevant to less. Default is USA,World,Europe
    -e, --exclude    Countries that are not in the list of preferred countries will be skipped.
    -d, --dryrun     Dry run/Analyze mode. Prints output in the terminal.
    -s, --skip       Skip ROMs that matches the comma-separated list of attributes. Case insensitive.
    -np, --noproto   Skip ROMs with the attributes Beta, Proto, Sample, Demo or Program.
    -nu, --nounl     Skip ROMs with the attributes Homebrew, Unl, Aftermarket, Pirate or Unknown.
    -nm, --nomini    Skip mini console ROMs and virtual console ROMs.
    -nb, --nobios    Skip BIOS ROMs.
    -h, --help       Display this help.
eof

unless ARGV.empty?
  ARGV.each_with_index { |item, i|
    if item == "-t" || item == "--target"
      working_dir = ARGV[i+1]
    elsif item == "-o" || item == "--output"
      output = ARGV[i+1]
    elsif item == "-d" || item == "--dryrun"
      $analyze = true
    elsif item == "-c" || item == "--countries"
      $countries = ARGV[i+1].split(',')
    elsif item == "-s" || item == "--skip"
      $skip_attrs = [] if !$skip_attrs
      $skip_attrs += ARGV[i+1].split(',')
    elsif item == "-np" || item == "--noproto"
      $skip_attrs = [] if !$skip_attrs
      $skip_attrs.push "Beta", "Proto", "Sample", "Demo", "Program"
    elsif item == "-nu" || item == "--nounl"
      $skip_attrs = [] if !$skip_attrs
      $skip_attrs.push "Homebrew", "Unl", "Aftermarket", "Pirate", "Unknown"
    elsif item == "-nm" || item == "--nomini"
      $skip_attrs = [] if !$skip_attrs
      $skip_attrs.push "Virtual Console", "Genesis Mini", "Mega Drive Mini", "Switch Online", "Classic Mini"
    elsif item == "-nb" || item == "--nobios"
      $bios = false
    elsif item == "-e" || item == "--exclude"
      $exclude = true
    elsif item == "-h" || item == "--help"
      puts HELP
      exit
    end
  }
else
  puts HELP
  exit
end

def filter_roms(roms)
  points = Array.new(roms.length, 0)
  revs = {}
  chosen = 0
  roms.each_with_index { |rom, i|  
    attrs = rom.scan(RX_ATTRS).flatten
    if attrs.length == 0
      puts "Invalid ROM (missing region): " + rom
      next
    end
    
    attrs.each {|v| $roms_attrs[v] = 1}
    countries = attrs[0].split(', ')
    # Country points
    cp = 0
    cp = -1 if $exclude
    countries.each { |c|
      idx = $countries.index(c)
      if idx && cp < $countries.length - idx
        cp = $countries.length - idx
      end
    }
    points[i] += cp
    # Re-edition of some NES games for the GameCube
    if rom.include?("GameCube Edition")
      points[i] += 1
    end
    if rom =~ RX_HAS_VERSION_NUMBER
      if !revs[countries[0]]
        revs[countries[0]] = 0
      end
      revs[countries[0]] += 1
      points[i] += 0.1 * revs[countries[0]]
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
    
    if !$bios && rom.include?("[BIOS]")
      points[i] = -1
    end
    
    chosen = i if points[i] >= points[chosen]
  }
  
  if $analyze
    roms.each_with_index { |rom, i|
      mark = i == chosen && points[i] >= 0 ? '*' : ' '
      puts sprintf('%-4g %s%s', points[i], mark, rom)
    }
    puts ''
  end
  
  return points[chosen] >= 0 ? roms[chosen] : nil
end

def filter_rom(file)
  return if File.directory?(file)
  $rom_count += 1
  match = RX_NAME.match(file)
  if match
    match = match.to_s.rstrip!
    if $last_match && $last_match != match
      $roms.push filter_roms($tmp_roms)
      $tmp_roms = []
    end
    $tmp_roms.push(file)
    $last_match = match
  end
end

if File.directory?(working_dir)
  Dir.chdir(working_dir) do
    Dir.glob("*.zip") do |file|
      filter_rom(file)
    end
  end
else
  File.readlines(working_dir).each do |line|
    filter_rom(line)
  end
end
$roms.push filter_roms($tmp_roms)
$roms.compact!
summary = "Selected #{$roms.length} of #{$rom_count} ROMs"
puts summary

if !$analyze
  open(output, 'w') { |f|
    # f.puts summary
    # f.puts ARGV.join(' ')
    # f.puts ''
    f.puts $roms
  }
  puts "List of filtered ROMs written to #{File.expand_path(output)}"
else
  puts "", "All ROM attributes:", ""
  puts $roms_attrs.keys.sort
end