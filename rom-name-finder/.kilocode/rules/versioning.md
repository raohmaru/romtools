# Versioning Strategy

This document outlines the versioning strategy used for this project.

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

## Version Format

Versions are formatted as: `MAJOR.MINOR.PATCH`

Examples:
- `1.0.0` - Initial release
- `1.1.0` - Added new feature (e.g., new API endpoint, new component)
- `1.1.1` - Bug fix (e.g., fixed authentication bug)
- `2.0.0` - Breaking changes (e.g., changed API response format, removed deprecated endpoints)

## Version Storage

Version numbers are stored in:
- `package.json` - Both frontend and backend packages
- `CHANGELOG.md` - Release history
- Git tags - For release tracking

## Version Tags

- Version tags follow the format: `vMAJOR.MINOR.PATCH`
- Example: `v1.2.3`
- Tags are created during the release process

## Pre-release Versions

For development and testing:
- **Alpha**: `1.0.0-alpha.1` - Early development, unstable
- **Beta**: `1.0.0-beta.1` - Feature complete, testing phase
- **RC**: `1.0.0-rc.1` - Release candidate, final testing

## Version Bumping Rules

### MAJOR Version Bump
- Breaking API changes
- Removing deprecated features
- Major architectural changes
- Database schema changes requiring migrations

### MINOR Version Bump
- New features (backwards compatible)
- New API endpoints
- New components or utilities
- Performance improvements

### PATCH Version Bump
- Bug fixes
- Security patches
- Documentation updates
- Minor refactoring (no behavior change)

## For AI Agents

When making version changes:
1. Determine the change type (MAJOR/MINOR/PATCH)
2. Update `package.json` version in both frontend and backend
3. Update `CHANGELOG.md` with version number and changes
4. Create a git tag: `git tag vMAJOR.MINOR.PATCH`
5. Follow semantic versioning principles strictly
6. Consider API compatibility when determining version bump

