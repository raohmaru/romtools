# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.0.1

### Security
- Fixed SQL injection vulnerabilities in gameSearchService.ts by implementing proper SQL escaping for LIKE and MATCH queries
- Removed dangerouslySetInnerHTML from SimpleResults.tsx and DetailedResults.tsx to prevent stored XSS attacks
- Fixed open redirect vulnerabilities in ExternalLink.tsx by implementing proper URL encoding
- Fixed CSV injection in SearchResults.tsx by implementing proper CSV field escaping
- Added database path validation to prevent path traversal attacks
- Improved file drop validation in Textarea.tsx with content validation
- Added Content Security Policy meta tag to index.html
- Fixed potential SSRF via external icon loading by implementing ROM value sanitization
- Sanitized error messages to prevent information disclosure
- Added input length limits to search term validation schema
- Created new security utility functions in frontend/src/utils/security.ts

### Changed
- Updated security validation across multiple components

## v1.0.0

### Added
- Project planning and requirements documentation
- Comprehensive documentation structure
- Implementation plan for SQLite search web application
- Project status tracking
- Memory bank initialization
- Architecture decision records (4 decisions documented)
- System architecture documentation
- Developer documentation with project overview, setup instructions, development workflow, testing instructions, and deployment instructions
- Code structure documentation in README.md

### Changed
- Updated project status documentation
- Improved project structure and organization
- Updated memory bank files to reflect current project state
- Enhanced documentation completeness
- Memory bank files updated with detailed architecture information
- Context documentation updated with current project status
- Updated root README.md with comprehensive developer documentation
- Updated frontend README.md with project-specific information

### Fixed
- Memory bank brief alignment with project documentation
- Memory bank initialization plan status tracking

### Performance Improvements
- Optimized React components with React.memo to prevent unnecessary re-renders
- Added useMemo/useCallback for expensive operations to prevent redundant calculations
- Implemented request debouncing for search functionality to reduce excessive database queries
- Added caching mechanism for search results to avoid repeated database queries
- Optimized bundle size through code splitting and tree shaking
