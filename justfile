set dotenv-load := false

# List available commands
default:
    @just --list

# Generate components and build the bundle
build:
    npm run build

# Build the webpack bundle only
build-js:
    npm run build:js

# Build webpack bundle in development mode
build-js-dev:
    npm run build:js:dev

# Generate the Python components
generate:
    npm run build:backends

# Rebuild the bundle on change
watch:
    npm run build:js:dev -- --watch

# Install pip requirements & node modules
install:
    pip install -r requirements.txt
    npm install

# Package the application for distribution using python wheel
package: clean build
    python -m build --wheel

# Publish the package to pypi using twine
publish: package
    twine upload dist/*

# Remove dist & build directories
clean:
    rm -rf dist
    rm -rf build

# Run the development server
dev:
    npm run start

# Run TypeScript type checking
typecheck:
    npm run typecheck

# Run TypeScript type checking in watch mode
typecheck-watch:
    npm run typecheck:watch

# Format code with Prettier
format:
    npm run format

# Check formatting without modifying
format-check:
    npm run format:check

# Run the usage.py demo app
demo:
    python usage.py

# Run pytest
test:
    pytest tests/

# Full check: typecheck + format check + build
check: typecheck format-check build
    @echo "✓ All checks passed!"

# Quick rebuild: just JS, no Python generation
quick:
    npm run build:js
