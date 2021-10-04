# ROMs Filter
Generates a list of filtered ROMs given a folder with zipped ROMs. Works best with [No-Intro ROMs](https://no-intro.org/).

The filter selects one ROM from a group of ROMs with the same name using the following criteria:
- Country preference: USA, World, Europe, other countries.
- Highest version/revision number.
- GameCube reedition.

## Usage
`ruby roms_filter.rb -t [targetdir] [-o [output.file] -a -s [attr1[,attrN]] -np`

### Arguments
- `-t`  Target dir with the zipped ROMs.
- `-o`  Output file where to write the filtered ROMs list.
- `-d`  Dry run/Analyze mode. Prints output in the terminal.
- `-s`  Skip ROMs that matches the comma-separated list of attributes.
- `-np` Skip ROMs with the attributes "Beta", "Proto" or "Sample".
- `-h`  Display this help.
