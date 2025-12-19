# HealthCareVisiar Project

Next.js project with Clean Architecture - TypeScript, App Router, and DI pattern.

## Architecture Layers

- **Domain**: Entities, Value Objects, Domain Services
- **Application**: Use Cases, DTOs, Validators
- **Infrastructure**: API Clients, Storage, External Services
- **Presentation**: Next.js Pages, Components, Hooks

## Development Guidelines

- Follow Clean Architecture principles
- Use dependency injection via container
- Implement Result/Either pattern for error handling
- Write unit tests for use cases
