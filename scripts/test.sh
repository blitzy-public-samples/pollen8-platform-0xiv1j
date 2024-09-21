#!/bin/bash

# Pollen8 Test Automation Script

set -e

# Load environment variables
if [ -f .env.test ]; then
  export $(cat .env.test | xargs)
else
  echo "Error: .env.test file not found"
  exit 1
fi

setup_test_environment() {
  echo "Setting up test environment..."
  docker-compose -f docker-compose.test.yml up -d
  npm run migrate:test
  echo "Test environment setup complete."
}

run_unit_tests() {
  echo "Running unit tests..."
  npm run test:unit:backend
  npm run test:unit:frontend
  npm run test:coverage
  echo "Unit tests completed."
}

run_integration_tests() {
  echo "Running integration tests..."
  npm run test:integration
  echo "Integration tests completed."
}

run_e2e_tests() {
  echo "Running end-to-end tests..."
  npm run test:e2e
  echo "End-to-end tests completed."
}

run_linter() {
  echo "Running linter..."
  npm run lint:backend
  npm run lint:frontend
  echo "Linter checks completed."
}

cleanup_test_environment() {
  echo "Cleaning up test environment..."
  docker-compose -f docker-compose.test.yml down -v
  rm -rf ./tmp
  echo "Test environment cleanup complete."
}

main() {
  echo "Starting Pollen8 test suite..."

  setup_test_environment

  run_linter

  run_unit_tests

  run_integration_tests

  run_e2e_tests

  cleanup_test_environment

  echo "Pollen8 test suite completed successfully."
}

# Allow running specific test types
if [ "$1" = "unit" ]; then
  setup_test_environment
  run_unit_tests
  cleanup_test_environment
elif [ "$1" = "integration" ]; then
  setup_test_environment
  run_integration_tests
  cleanup_test_environment
elif [ "$1" = "e2e" ]; then
  setup_test_environment
  run_e2e_tests
  cleanup_test_environment
elif [ "$1" = "lint" ]; then
  run_linter
else
  main
fi