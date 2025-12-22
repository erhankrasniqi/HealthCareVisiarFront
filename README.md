# HealthCareVisiar

A modern healthcare management system built with Next.js 16 and Clean Architecture principles.

## 🏗️ Architecture

This project follows **Clean Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer (UI)                │
│         Next.js App Router + React Hooks            │
├─────────────────────────────────────────────────────┤
│            Application Layer (Use Cases)            │
│         Business Logic + DTOs + Validation          │
├─────────────────────────────────────────────────────┤
│              Domain Layer (Core)                    │
│     Entities + Value Objects + Interfaces           │
├─────────────────────────────────────────────────────┤
│          Infrastructure Layer (External)            │
│    API Clients + Storage + Logger + Repositories    │
└─────────────────────────────────────────────────────┘
```

### Layer Details

- **Domain** (`src/domain/`): Core business entities, value objects, repository interfaces
- **Application** (`src/application/`): Use cases, DTOs, validation logic, mappers
- **Infrastructure** (`src/infrastructure/`): External implementations (HTTP, storage, logging)
- **Presentation** (`app/`): Next.js pages, components, hooks using use cases

## 🎯 Key Features

- **Authentication**: User registration and login with JWT tokens
- **Appointments**: Create and manage medical appointments
- **Doctor Management**: Doctor lookup and recommendation system
- **Clean Architecture**: Dependency injection, Result pattern for error handling
- **Type Safety**: Full TypeScript with Zod validation
- **Testing**: Jest + React Testing Library

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Validation**: Zod
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky

## 📦 Project Structure

```
app/                    # Next.js App Router pages
├── api/               # API routes (backend)
├── login/             # Login page
├── register/          # Registration page
├── appointments/      # Appointment management
└── dashboard/         # User dashboard

src/
├── domain/            # Domain layer (entities, interfaces)
│   ├── auth/         # User, Email, AuthToken
│   ├── appointment/  # Appointment entity
│   └── shared/       # Result type, errors, interfaces
│
├── application/       # Application layer (use cases)
│   ├── auth/         # LoginUseCase, RegisterUseCase
│   ├── appointment/  # CreateAppointmentUseCase
│   └── shared/       # Application errors
│
├── infrastructure/    # Infrastructure layer (implementations)
│   ├── http/         # HTTP client (Fetch)
│   ├── repositories/ # API repositories
│   ├── storage/      # LocalStorage implementation
│   └── logging/      # Console logger
│
├── presentation/      # Presentation layer (hooks)
│   ├── hooks/        # React hooks for use cases
│   └── store/        # Zustand stores
│
└── di/               # Dependency injection container
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage
npm run type-check   # TypeScript type checking
```

## 🐳 Docker

Build and run with Docker:

```bash
# Build image
docker build -t healthcarevisiar .

# Run container
docker run -p 3000:3000 healthcarevisiar

# Or use Docker Compose
docker-compose up
```

## 🧪 Testing

Tests are located alongside the code with `__tests__` directories:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🎨 Design Patterns

- **Dependency Injection**: Container pattern for loose coupling
- **Repository Pattern**: Abstract data access layer
- **Result/Either Pattern**: Type-safe error handling without exceptions
- **Value Objects**: Email, AuthToken for domain validation
- **Use Case Pattern**: Single responsibility for business logic
- **Mapper Pattern**: Convert between domain entities and DTOs

## 📝 Code Quality

- **ESLint**: Code linting with boundaries plugin for architecture enforcement
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **lint-staged**: Run checks on staged files

## 🔒 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=your_api_url
```

## 📄 License

ISC

## 👥 Contributing

This project follows Clean Architecture principles. When contributing:

1. Keep layers separated
2. Follow dependency rules (outer → inner)
3. Use dependency injection
4. Write tests for use cases
5. Use Result pattern for error handling

---

Built with ❤️ using Clean Architecture
