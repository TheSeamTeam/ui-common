# Technical Context: TheSeam UI Common

## Technology Stack

### Core Framework
- **Angular 20**: Modern Angular framework with latest features
- **TypeScript 5.9.2**: Fully typed codebase for better development experience
- **RxJS 7.8.0**: Reactive programming for data handling

### Build & Development Tools
- **Angular CLI 20.3.1**: Project scaffolding and build management
- **ng-packagr**: Library packaging for npm distribution
- **Webpack 5**: Module bundling (via Angular CLI)
- **ESBuild**: Fast TypeScript compilation

### Testing Framework
- **Jest 30.0.0**: Primary testing framework
- **jest-preset-angular**: Angular-specific Jest configuration
- **@testing-library/angular**: Component testing utilities
- **@ngneat/spectator**: Enhanced Angular testing utilities
- **Storybook Test Runner**: Visual regression testing

### Documentation & Development
- **Storybook 9.6.1**: Component documentation and development environment
- **Compodoc**: TypeScript documentation generation
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting

### UI & Styling
- **Bootstrap 4.6.0**: Base CSS framework
- **Angular Flex Layout**: Responsive layout system
- **FontAwesome**: Icon library
- **SCSS**: Styling preprocessor

### Key Dependencies

#### Data & Forms
- **@ng-select/ng-select**: Advanced select components
- **ngx-quill**: Rich text editor integration
- **@ajsf/core**: JSON Schema forms
- **intl-tel-input**: International telephone input

#### Data Visualization & Tables
- **@marklb/ngx-datatable**: Advanced data table functionality
- **ngx-toastr**: Toast notifications
- **overlayscrollbars**: Custom scrollbar styling

#### Data Processing
- **Apollo Angular**: GraphQL client integration
- **file-saver**: File download functionality
- **xlsx**: Excel file processing
- **jexl**: Expression language for dynamic logic

#### Maps & Geospatial
- **@angular/google-maps**: Google Maps integration
- **@turf/**: Geospatial analysis utilities
  - boolean-contains, helpers, area, kinks
- **shpjs**: Shapefile processing

#### PDF & Documents
- **pdfjs-dist**: PDF viewing capabilities
- **@types/pdfjs-dist**: TypeScript definitions

### Development Environment

#### Package Management
- **npm**: Primary package manager
- **Verdaccio**: Local npm registry for testing

#### Code Quality
- **ESLint Configuration**: 
  - @angular-eslint for Angular-specific rules
  - @typescript-eslint for TypeScript rules
  - Standard style guide compliance
- **Prettier**: Consistent code formatting
- **EditorConfig**: Cross-editor consistency

#### Build Configurations
- **Production Build**: Optimized for distribution
- **Development Build**: Watch mode for rapid iteration
- **Storybook Build**: Static documentation generation

### Architecture Patterns

#### Component Structure
- **Standalone Components**: Self-contained with minimal dependencies
- **Service Layer**: Shared business logic and data management
- **Model Layer**: TypeScript interfaces and types
- **Public API**: Each component package has its own public_api.ts for exports
  - **Main public_api.ts**: The root `projects/ui-common/public_api.ts` should remain empty
  - **Package public-api.ts**: Individual packages export through their own public-api.ts files

#### Testing Strategy
- **Unit Tests**: Component and service testing with Jest
- **Integration Tests**: Component interaction testing
- **Visual Testing**: Storybook-based visual regression

#### Build & Distribution
- **Library Build**: ng-packagr for npm-ready packages
- **Schematics**: Angular CLI integration for component generation
- **Peer Dependencies**: Minimal required dependencies for consuming apps

### Development Workflow

#### Local Development
1. **Storybook**: Primary development environment
2. **Watch Mode**: Continuous building during development
3. **npm link**: Local testing in consuming applications
4. **Jest Watch**: Continuous testing during development

#### Publishing Process
1. **Version Bump**: Manual version increment in package.json
2. **Build**: Production build with ng-packagr
3. **Test**: Full test suite execution
4. **Publish**: npm publish to registry

### Performance Considerations
- **Tree Shaking**: Components can be imported individually
- **Lazy Loading**: Components support lazy loading patterns
- **Bundle Size**: Minimal dependencies to reduce bundle impact
- **Change Detection**: OnPush strategy where applicable

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **ES5 Support**: Configured for older browser compatibility
- **Polyfills**: Included for missing browser features

### Security
- **Dependency Scanning**: Regular security audits
- **Type Safety**: TypeScript prevents common runtime errors
- **Sanitization**: Built-in Angular XSS protection
