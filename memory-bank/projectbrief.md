# Project Brief: TheSeam UI Common

## Overview
TheSeam UI Common is an Angular component library that provides reusable UI components and styles for applications developed by The Seam. This is a shared library designed to ensure consistency across The Seam's application ecosystem.

## Core Purpose
- Provide a centralized collection of common UI components
- Ensure design consistency across The Seam applications
- Reduce development time through reusable components
- Maintain a single source of truth for UI patterns

## Key Components & Features
Based on the project structure, the library includes:

### Major Component Categories
- **DataTable**: Advanced data table with filtering, sorting, preferences, and AI integration
- **Forms**: Form fields, validation, rich text editing, telephone input
- **Navigation**: Breadcrumbs, menus, tabbed interfaces
- **Layout**: Cards, modals, popovers, framework components
- **Data Visualization**: Progress indicators, charts
- **Interactive Elements**: Buttons, toggles, checkboxes, carousels
- **Utilities**: Loading states, scrollbars, storage, validators

### Notable Advanced Features
- AI-powered datatable prompting capabilities
- GraphQL integration for data tables
- Rich text editing with Quill
- Google Maps integration
- PDF viewing capabilities
- File export functionality
- Geospatial data handling (Turf.js integration)

## Development Approach
- **Storybook-driven development**: Primary development environment
- **Component isolation**: Each component developed and tested independently
- **Angular 15**: Built on modern Angular framework
- **TypeScript**: Fully typed codebase
- **Jest testing**: Comprehensive test coverage
- **ESLint**: Code quality enforcement

## Distribution
- Published as `@theseam/ui-common` npm package
- Version 0.4.30 (current)
- Supports both npm install and npm link for development

## Target Applications
Applications within The Seam ecosystem that need consistent UI components and patterns.

## Success Criteria
- Consistent UI/UX across The Seam applications
- Reduced development time for common UI patterns
- High component reusability
- Maintainable and well-documented codebase
- Comprehensive test coverage
