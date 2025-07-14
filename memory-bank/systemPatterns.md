# System Patterns: TheSeam UI Common

## Architecture Overview

### Library Structure
The UI Common library follows a modular architecture where each component category is organized into its own directory with clear separation of concerns:

```
projects/ui-common/
├── [component-category]/          # Feature-based organization
│   ├── [component-name]/         # Individual component
│   │   ├── *.component.ts        # Component logic
│   │   ├── *.component.html      # Template
│   │   ├── *.component.scss      # Styles
│   │   ├── *.stories.ts          # Storybook documentation
│   │   └── *.spec.ts             # Unit tests
│   ├── services/                 # Shared services for category
│   ├── models/                   # TypeScript interfaces/types
│   └── public-api.ts             # Controlled exports
```

### Key Architectural Patterns

#### Component Design Patterns
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Components are composed of smaller parts
- **Input/Output Pattern**: Clear data flow through @Input() and @Output()
- **OnPush Change Detection**: Performance optimization where applicable
- **Reactive Forms**: FormControl integration for form components

#### Service Layer Patterns
- **Singleton Services**: Shared state and functionality
- **Facade Pattern**: Services abstract complex operations
- **Observable Streams**: RxJS for reactive data handling
- **Dependency Injection**: Angular's DI system for loose coupling

#### Data Flow Patterns
- **Unidirectional Data Flow**: Parent to child via inputs
- **Event Emission**: Child to parent via outputs
- **Service Communication**: Cross-component communication via services
- **State Management**: Local component state with reactive patterns

## Component Categories & Patterns

### DataTable System
**Location**: `projects/ui-common/datatable/`

**Architecture Pattern**: Complex composite component with multiple sub-components
- **Main Component**: `datatable.component.ts` - Orchestrates the entire table
- **Column Components**: Individual column types and filters
- **Service Layer**: 
  - `columns-filters.service.ts` - Filter management
  - `datatable-preferences.service.ts` - User preferences
- **Model Layer**: Type definitions for columns, filters, alterations

**Key Patterns**:
- **Strategy Pattern**: Different column types and filters
- **Observer Pattern**: Reactive updates to table state
- **Command Pattern**: Column alterations (sort, filter, etc.)
- **Memento Pattern**: Preferences persistence

### AI Integration
**Location**: `projects/ui-common/ai/`

**Pattern**: AI-powered component enhancement
- **datatable-prompter**: Natural language interface for data tables
- **Integration Pattern**: Enhances existing components with AI capabilities

### Form Components
**Location**: Multiple directories (`form-field/`, `rich-text/`, `tel-input/`, etc.)

**Pattern**: Reactive Forms integration
- **ControlValueAccessor**: Custom form controls
- **Validation Integration**: Angular validators
- **Error Handling**: Consistent error display patterns

### Layout & Navigation
**Location**: `framework/`, `breadcrumbs/`, `menu/`, `tabbed/`

**Pattern**: Structural components
- **Container/Presenter**: Layout containers with content projection
- **Router Integration**: Navigation components work with Angular Router
- **Responsive Design**: Flex layout integration

## Design Patterns in Use

### Creational Patterns
- **Factory Pattern**: Component creation through Angular's component factory
- **Builder Pattern**: Complex component configuration through inputs
- **Singleton Pattern**: Services for shared state

### Structural Patterns
- **Adapter Pattern**: Wrapping third-party components (Quill, Google Maps)
- **Facade Pattern**: Simplified interfaces for complex operations
- **Composite Pattern**: Complex components built from simpler ones
- **Decorator Pattern**: Angular decorators for metadata

### Behavioral Patterns
- **Observer Pattern**: RxJS observables for reactive programming
- **Strategy Pattern**: Different implementations for similar functionality
- **Command Pattern**: Encapsulating operations (table alterations)
- **Template Method Pattern**: Angular lifecycle hooks

## Code Organization Principles

### File Naming Conventions
- **Components**: `[name].component.ts`
- **Services**: `[name].service.ts`
- **Models**: `[name].ts` or `[name].model.ts`
- **Stories**: `[name].stories.ts`
- **Tests**: `[name].spec.ts`

### Import/Export Patterns
- **Barrel Exports**: `public-api.ts` files control what's exported
- **Relative Imports**: Within feature modules
- **Absolute Imports**: For cross-feature dependencies

### Testing Patterns
- **AAA Pattern**: Arrange, Act, Assert in tests
- **Test Doubles**: Mocks, stubs, and spies for isolation
- **Page Object Model**: For complex component testing
- **Snapshot Testing**: For UI regression detection

## Integration Patterns

### Third-Party Library Integration
- **Wrapper Components**: Angular components wrapping external libraries
- **Type Safety**: TypeScript definitions for all external dependencies
- **Lifecycle Management**: Proper initialization and cleanup

### GraphQL Integration
**Location**: `projects/ui-common/graphql/`
- **Apollo Client**: Reactive GraphQL queries
- **Type Generation**: Generated TypeScript types from schema
- **Caching Strategy**: Apollo cache for performance

### Styling Architecture
- **SCSS Modules**: Component-scoped styles
- **Theme System**: Consistent color and typography variables
- **Bootstrap Integration**: Extending Bootstrap components
- **Utility Classes**: Common styling patterns

## Performance Patterns

### Change Detection Optimization
- **OnPush Strategy**: Reduced change detection cycles
- **Immutable Data**: Preventing unnecessary updates
- **TrackBy Functions**: Optimized list rendering

### Bundle Optimization
- **Tree Shaking**: Dead code elimination
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Separate bundles for different features

### Memory Management
- **Subscription Management**: Proper observable cleanup
- **Component Lifecycle**: OnDestroy implementation
- **Event Listener Cleanup**: Preventing memory leaks

## Error Handling Patterns

### Component Error Boundaries
- **Try-Catch Blocks**: Graceful error handling
- **Error Services**: Centralized error reporting
- **User Feedback**: Toast notifications for errors

### Validation Patterns
- **Form Validation**: Angular reactive forms validation
- **Custom Validators**: Business logic validation
- **Error Display**: Consistent error message patterns

## Future Architecture Considerations

### Scalability Patterns
- **Micro-Frontend Ready**: Components designed for micro-frontend architecture
- **Version Compatibility**: Backward compatibility strategies
- **Plugin Architecture**: Extensible component system

### Modernization Path
- **Angular Updates**: Preparation for future Angular versions
- **Web Components**: Potential framework-agnostic components
- **Standalone Components**: Migration to standalone component architecture
