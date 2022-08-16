# Arcade ROMs Filter
Generates an opinionated list of filtered arcade ROMs given a romlist XML Dat file.

The filter excludes by default:
- BIOS files
- Neo Geo ROMs
- Clones, except if they support a number of players different form the parent ROM

## Usage
`ruby arcade_roms_filter.rb [romlist.xml] [-o [output.file] -x [file.xml] -pd -m [manufacturer] -s [attr1[,attrN]] -d]`
  
### Arguments
- `romlist` XML Dat file with the ROMs
- `-o`  Output file with the filtered ROMs
- `-x`  Creates a XML Dat file
- `-pd` Print description of the rom and size (uncompressed)
- `-m`  Filter only ROMs of the given manufacturer (case-insensitive)
- `-s`  Skip ROMs that matches the comma-separated list of attributes (case-insensitive)
- `-d`  Doesn't output any file. Prints output in the terminal
- `-h`  Display this help
