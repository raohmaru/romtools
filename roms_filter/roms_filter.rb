require 'fileutils'

# Options
working_dir = '.'
output = '_rom-selection.txt'
$countries = ["USA", "World", "Europe"]
$analyze = false
$skip_names = false
$skip_attrs = false
$prefer_attrs = false
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
ROMs filter 1.1
---------------
Generates an opinionated list of filtered ROMs given a folder with zipped ROMs or a file with a carriage return-separated list of ROMs.
Works best with No-Intro ROMs.

The filter selects one ROM from a group of ROMs with the same name using the following criteria:
- Country preference: USA, World, Europe (and other countries unless `--exclude` is present).
- Highest version/revision number.

Usage:
    ruby roms_filter.rb -i dirOrFile [-o output.file -sa attr1[,attrN] -c country1[,countryN] -e -np -nu -nm -nb -d]

Arguments:
    -i,  --input      Target dir with the zipped ROMs, or a file with a carriage return-separated list of ROMs.
    -o,  --output     Output file where to write the filtered ROMs list. If omitted the file _rom-selection.txt will be created or overwriten.
    -c,  --countries  Country preference: a comma-separated list of countries, from more relevant to less. Default is USA,World,Europe
    -e,  --exclude    Countries that are not in the list of preferred countries will be skipped.
    -d,  --dryrun     Dry run/Analyze mode. Prints output in the terminal.
    -sn, --skipname   Skip ROMs which name matches a word of the comma-separated list. Case insensitive.
    -sa, --skipattr   Skip ROMs that matches the comma-separated list of attributes. Case insensitive.
    -pa, --preferattr Includes ROMs that matches any of the comma-separated list of attributes. Case insensitive.
    -np, --noproto    Skip ROMs with the attributes Beta, Proto, Sample, Demo or Program.
    -nu, --nounl      Skip ROMs with the attributes Homebrew, Unl, Aftermarket, Pirate or Unknown.
    -nm, --nomini     Skip mini console ROMs and virtual console ROMs.
    -nb, --nobios     Skip BIOS ROMs.
    -h,  --help       Display this help.
eof

unless ARGV.empty?
  ARGV.each_with_index { |item, i|
    if item == "-i" || item == "--input"
      working_dir = ARGV[i+1]
    elsif item == "-o" || item == "--output"
      output = ARGV[i+1]
    elsif item == "-d" || item == "--dryrun"
      $analyze = true
    elsif item == "-c" || item == "--countries"
      $countries = ARGV[i+1].split(',')
    elsif item == "-sn" || item == "--skipname"
      $skip_names = [] if !$skip_names
      $skip_names += ARGV[i+1].split(',')
      print $skip_names, "\n"
    elsif item == "-sa" || item == "--skipattr"
      $skip_attrs = [] if !$skip_attrs
      $skip_attrs += ARGV[i+1].split(',')
    elsif item == "-pa" || item == "--preferattr"
      $prefer_attrs = [] if !$prefer_attrs
      $prefer_attrs += ARGV[i+1].split(',')
    elsif item == "-np" || item == "--noproto"
      $skip_attrs = [] if !$skip_attrs
      $skip_attrs.push "Beta", "Proto", "Sample", "Demo", "Program", "Debug"
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
  score = Array.new(roms.length, 0)
  revs = []
  chosen = 0
  roms.each_with_index { |rom, i|
    attrs = rom.scan(RX_ATTRS).flatten
    if attrs.length == 0
      puts "Invalid ROM (missing region): " + rom
      next
    end    
    attrs.each {|v| $roms_attrs[v] = 1}
    name = rom[RX_NAME].downcase
    countries = attrs[0].split(', ')
    # Country score
    cp = 0
    cp = -1 if $exclude
    countries.each { |c|
      idx = $countries.index(c)
      if idx && cp < $countries.length - idx
        cp = $countries.length - idx
      end
    }
    score[i] += cp
    
    if $prefer_attrs
      attrs.each { |a|
        a = a.downcase
        $prefer_attrs.each { |fa|
          if a.include? fa.downcase
            score[i] += 0.1
          end
        }
      }
    end
    
    if $skip_names
      catch :skipped do
        $skip_names.each { |n|
          if name.include? n.downcase
            score[i] = -1
            throw :skipped
          end
        }
      end
    end
    
    if $skip_attrs
      catch :skipped do
        attrs.each { |a|
          a = a.downcase
          $skip_attrs.each { |sa|
            if a.include? sa.downcase
              score[i] = -1
              throw :skipped
            end
          }
        }
      end
    end
    
    if !$bios && rom.include?("[BIOS]")
      score[i] = -1
    end    
    
    # Add revisions which to apply a score later
    if score[i] > -1 && rom =~ RX_HAS_VERSION_NUMBER
      revs.push([i, rom[RX_HAS_VERSION_NUMBER]])
    end
  }
  
  # Prefer latest versions
  if revs.length
    revs.sort!{ |a, b|
      a[1] <=> b[1]
    }
    revs.each_with_index{ |x, i|
      score[x[0]] += 0.1 * (i + 1)
    }
  end
  
  # Choose the rom with better score
  score.each_with_index{ |s, i|
    chosen = i if s >= score[chosen]
  }
  
  if $analyze
    roms.each_with_index { |rom, i|
      mark = i == chosen && score[i] >= 0 ? '*' : ' '
      puts sprintf('%-4g %s%s', score[i], mark, rom)
    }
    puts ''
  end
  
  return score[chosen] >= 0 ? roms[chosen] : nil
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
elsif File.file?(working_dir)
  file = File.readlines(working_dir)
  file.sort.each { |line|
    filter_rom(line.strip)
  }
else
  abort("Missing input or invalid input.")
end
# Filter last rom of the list
$roms.push filter_roms($tmp_roms)
$roms.compact!
summary = "Selected #{$roms.length} of #{$rom_count} ROMs"
puts summary

if !$analyze
  open(output, 'w') { |f|
    f.puts $roms
  }
  puts "List of filtered ROMs written to #{File.expand_path(output)}"
else
  puts "", "All ROM attributes:", ""
  puts $roms_attrs.keys.sort
end