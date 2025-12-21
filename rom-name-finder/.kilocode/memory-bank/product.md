# Rationale

This project is a React application where the user can input an arcade video game name, and perform a query in a SQLite database to retrieve a MAME ROM name for the given arcade video game name.

Example:
+ User searches for "Ms. Pac-Man"
+ Application returns "mspacman".

# Background

To guess the MAME ROM name for a video game given its name it's difficult because the relationship is not obvious, and there aren't many online services that do that.

Also for performance reasons using a SQLite database file will be faster that relying in calls to APIs.

# How it Works

- Textarea to input the arcade video game names, one per line.
- Select field to choose which SQLite database file to use.
- Submit button.
Below there is a search results to display the results from the query.

1. The user inputs one or several arcade video game name, one per line.
2. Selects which SQLite database to use.
3. Users clicks on search.
4. A call is made to the search service (Prisma ORM + SQLite) with the value of the textarea.
5. A query is performed with the search string using the `LIKE` operator. For each arcade video game name in the search string, whitespaces are replaced with "%" and the arcade video game name are joined using the `OR` operator.
    ```sql
    SELECT
    rom
    FROM games
    WHERE
    name LIKE "%name1a%name1b%"
    OR name LIKE "%name2a%name2b%"
    ```
6. The search services returns the values of the `rom` column (MAME ROM name) that matches the arcade video game name, or none if there are no matches.
7. The response from the service is printed in the search results React component.

# User Experience Goals

Nice and clear UI where the user can write any number of arcade video game names, and with one click get the MAME ROM names.