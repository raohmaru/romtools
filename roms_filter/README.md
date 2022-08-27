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
|:----------|:------------|
| `-t`, `--target`     | Target dir with the zipped ROMs. |
| `-o`, `--output`     | Output file where to write the filtered ROMs list. If omitted the file _selection.txt will be used. |
| `-c`, `--countries`  | Country preference: a comma-separated list of countries, from more relevant to less. Default is USA,World,Europe |
| `-e`, `--exclude`    | Countries that are not in the list of preferred countries will be skipped. |
| `-d`, `--dryrun`     | Dry run/Analyze mode. Prints output in the terminal. |
| `-s`, `--skip`       | Skip ROMs that matches the comma-separated list of attributes. Case insensitive. |
| `-np`, `--noproto`   | Skip ROMs with the attributes Beta, Proto, Sample, Demo or Program. |
| `-nu`, `--nounl`     | Skip ROMs with the attributes Homebrew, Unl, Aftermarket, Pirate or Unknown. |
| `-nm`, `--nomini`    | Skip mini console ROMs and virtual console ROMs. |
| `-nb`, `--nobios`    | Skip BIOS ROMs. |
| `-h`, `--help`       | Display the help. |
