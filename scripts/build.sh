#!/bin/bash

# Pollen8 Build Script

set -e

# Function to check if required environment variables are set
check_environment() {
  if [ -z "$NODE_ENV" ]; then
    echo "ERROR: NODE_ENV is not set"
    exit 1
  fi

  # Add checks for other required environment variables
  for var in DB_HOST REDIS_HOST; do
    if [ -z "${!var}" ]; then
      echo "ERROR: $var is not set"
      exit 1
    fi
  done

  echo "Environment check passed"
}

# Function to clean the build directory
clean_build_directory() {
  echo "Cleaning build directory..."
  rm -rf dist
  mkdir dist
  echo "Build directory cleaned"
}

# Function to build the backend
build_backend() {
  echo "Building backend..."
  npx tsc
  cp -R src/backend/views dist/backend/
  cp -R src/backend/public dist/backend/
  echo "Backend built successfully"
}

# Function to build the frontend
build_frontend() {
  echo "Building frontend..."
  npx webpack --config webpack.config.js
  cp -R src/frontend/public dist/frontend/
  echo "Frontend built successfully"
}

# Function to run tests
run_tests() {
  echo "Running tests..."
  npm run test
  echo "Tests completed"
}

# Function to generate documentation
generate_documentation() {
  echo "Generating documentation..."
  npx typedoc --out dist/docs src
  echo "Documentation generated"
}

# Main function to orchestrate the build process
main() {
  echo "Starting build process for Pollen8..."

  check_environment
  clean_build_directory
  build_backend
  build_frontend
  run_tests
  generate_documentation

  echo "Build process completed successfully"
}

# Run the main function
main