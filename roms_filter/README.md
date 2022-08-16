# ROMs Filter
Generates an opinionated list of filtered ROMs given a folder with zipped ROMs. Works best with [No-Intro ROMs](https://no-intro.org/).

The filter selects one ROM from a group of ROMs with the same name using the following criteria:
- Country preference: USA, World, Europe, other countries.
- Highest version/revision number.
- GameCube reedition.

## Usage
`ruby roms_filter.rb -t [targetdir] [-o [output.file] -a -s [attr1[,attrN]] -np`

### Parameters

| Parameter | Description |
|-----------|-------------|
| `-t`, `--target` | Target directory with the zipped ROMs. |
| `-o`, `--output` | Output file where to write the filtered ROMs list. If omitted the file _selection.txt will be used. |
| `-d`, `--dryrun` | Dry run/Analyze mode. Prints output in the terminal. |
| `-s`, `--skip` | Skip ROMs that matches the comma-separated list of attributes. |
| `-np`, `--noproto` | Skip ROMs with the attributes "Beta", "Proto", "Sample" or "Demo". |
| `-np`, `--nobios` | Skip BIOS roms. |
| `-h`, `--help` | Display this help. |
