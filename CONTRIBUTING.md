# Contributing to Dash Kaleido

Thank you for your interest in contributing to Dash Kaleido! This document provides guidelines for contributing to the project.

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/LudwigAJ/dash-kaleido.git
cd dash-kaleido
```

2. Install dependencies:
```bash
just install
# or manually:
pip install -r requirements.txt
npm install
```

3. Build the project:
```bash
just build
```

## Development Workflow

### Making Changes

1. Create a new branch for your feature/fix:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes in the `src` directory

3. Run type checking and formatting:
```bash
just typecheck
just format
```

4. Test your changes:
```bash
just demo  # Run the demo app
just test  # Run pytest
```

5. Build and verify:
```bash
just build
```

### Available Commands

We use [Just](https://github.com/casey/just) as a command runner. Run `just` to see all available commands:

- `just build` - Build JavaScript bundle and generate Python components
- `just watch` - Watch mode for development
- `just typecheck` - Run TypeScript type checking
- `just format` - Format code with Prettier
- `just check` - Run all checks (typecheck + format + build)
- `just demo` - Run the demo application
- `just test` - Run tests

### Code Style

- **TypeScript/React**: Follow the existing code style, enforced by ESLint and Prettier
- **Python**: Follow PEP 8 guidelines
- Format your code before committing: `just format`

### Component Architecture

This project follows the Dash TypeScript component template pattern:

- **`src/lib/components`** - Dash component wrappers (what gets exported to Python)
- **`src/lib/fragments`** - React implementation logic
- **`src/lib/components/ui`** - Reusable UI components (shadcn/ui style)
- **`src/lib/fragments/hooks`** - Custom React hooks
- **`src/lib/types`** - TypeScript type definitions

### Testing

- Add tests for new features in the `tests` directory
- Run `just test` to execute the test suite
- Test your components with the demo app: `just demo`

## Submitting Changes

1. Ensure all checks pass: `just check`
2. Commit your changes with a clear message:
```bash
git commit -m "Add feature: description of your changes"
```
3. Push to your fork:
```bash
git push origin feature/your-feature-name
```
4. Open a Pull Request on GitHub

## Reporting Issues

- Use the GitHub issue tracker
- Provide a clear description of the issue
- Include steps to reproduce if reporting a bug
- Include your environment details (OS, Python version, Dash version)

## Questions?

Feel free to open an issue for any questions about contributing!

## License

By contributing to Dash Kaleido, you agree that your contributions will be licensed under the Apache License 2.0.

