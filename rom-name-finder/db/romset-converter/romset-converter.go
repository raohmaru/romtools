package main

import (
	"bufio"
	"encoding/csv"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// Reads a file line by line and processes each line
func processMAMEDATfile(filename string) ([][]string, error) {
	// Open the file
	file, err := os.Open(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to open file %s: %w", filename, err)
	}
	defer file.Close()

	// Create a scanner to read the file line by line
	scanner := bufio.NewScanner(file)

	// Track line number for better error reporting
	lineNum := 0

	// Compile regex patterns once for efficiency
	nameRegex := regexp.MustCompile(`name="([^"]+)"`)
	cloneOfRegex := regexp.MustCompile(`(?:clone|rom)of="([^"]+)"`)
	descriptionRegex := regexp.MustCompile(`<description>(.+)</description>`)

	// Array to store game pairs [name, cloneof]
	var games [][]string
    var gameFound = false
    var parents = make(map[string]int)

	// Read file line by line
	for scanner.Scan() {
		lineNum++
		line := scanner.Text()
        line = strings.TrimSpace(line)

        // Extract description if game tag was found
        if gameFound {
			descr := ""
			descrMatches := descriptionRegex.FindStringSubmatch(line)
			if len(descrMatches) > 1 {
				descr = descrMatches[1]

                // Append to the last item of games
                if len(games) > 0 {
                    lastIndex := len(games) - 1
                    games[lastIndex] = append(games[lastIndex], descr)
                }
			}
            gameFound = false
        }

		// Check if line starts with "<game"
		if (len(line) >= 5 && line[:5] == "<game") || (len(line) >= 8 && line[:8] == "<machine") {
            // Skip ROMs that are not games
            if strings.Contains(line, `runnable="no"`) {
                continue
            }
            gameFound = true
			// Extract name attribute
			name := ""
			nameMatches := nameRegex.FindStringSubmatch(line)
			if len(nameMatches) > 1 {
				name = nameMatches[1]
			}

			// Extract cloneof attribute
			cloneOf := ""
			cloneOfMatches := cloneOfRegex.FindStringSubmatch(line)
			if len(cloneOfMatches) > 1 {
				cloneOf = cloneOfMatches[1]
			} else {
                // Save a reference if it is a parent ROM
                // If parents[name] does not exist
                if _, ok := parents[name]; !ok {
				    parents[name] = len(games) + 1
                }
			}

			// Store the pair in the games array
			games = append(games, []string{name, cloneOf})

			// Optional: print the parsed game for debugging
            if verbose {
                fmt.Printf("Game %d: name='%s', cloneof='%s'\n", lineNum, name, cloneOf)
            }
		}
	}

	// Check for errors during scanning
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading file %s: %w", filename, err)
	}

    // Set cloneof to parent ID
    for _, game := range games {
        if game[1] != "" {
            game[1] = fmt.Sprintf("%d", parents[game[1]])
        }
    }

	fmt.Printf("\nSuccessfully processed %d lines from %s\n", lineNum, filename)
	return games, nil
}

// WriteGamesToCSV writes the games data to a CSV file
func writeGamesToCSV(games [][]string, filename string) error {
    // Create output CSV filename based on input filename
    csvFilename := strings.TrimSuffix(filename, filepath.Ext(filename)) + ".csv"

    // Create the CSV file
    file, err := os.Create(csvFilename)
    if err != nil {
        return fmt.Errorf("failed to create CSV file %s: %w", csvFilename, err)
    }
    defer file.Close()

    // Create CSV writer
    writer := csv.NewWriter(file)
    defer writer.Flush()

    // Write header
    header := []string{"name", "cloneOf", "description"}
    if err := writer.Write(header); err != nil {
        return fmt.Errorf("failed to write CSV header: %w", err)
    }

    // Write game data
    for _, game := range games {
        // Ensure we have all three fields, fill missing with empty strings
        row := make([]string, 3)
        for i := 0; i < 3; i++ {
            if i < len(game) {
                row[i] = game[i]
            } else {
                row[i] = ""
            }
        }
        if err := writer.Write(row); err != nil {
            return fmt.Errorf("failed to write CSV row: %w", err)
        }
    }

    fmt.Printf("Successfully wrote %d games to %s\n", len(games), csvFilename)
    return nil
}

func main() {
	// Define command line flags
	filename := flag.String("file", "", "Path to the file to read")
	verboseFlag := flag.Bool("v", false, "Path to the file to read")
	flag.Parse()

	// Check if filename was provided
	if *filename == "" {
		fmt.Println("Converts a MAME DAT file into a CSV files with the fields ROM name, clone, name")
		fmt.Println("Usage: go run romset-converter.go -file <filename> [-q]")
		fmt.Println("Example: go run romset-converter.go -file romset.txt")
		os.Exit(1)
	}

    if (*verboseFlag) {
        verbose = true
    }

	// Call the function to read the file
    games, err := processMAMEDATfile(*filename)
	if err != nil {
		log.Fatal(err)
	}

	// Print summary of parsed games
    if verbose {
        fmt.Printf("\nParsed %d game entries from %s\n", len(games), *filename)
        for i, game := range games {
            fmt.Printf("  %d: [%s, %s, %s]\n", i+1, game[0], game[1], game[2])
        }
    }

	// Write games to CSV file
	if err := writeGamesToCSV(games, *filename); err != nil {
		log.Fatal(err)
	}
}

var verbose = false
