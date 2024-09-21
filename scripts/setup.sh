#!/bin/bash

# Pollen8 Development Environment Setup Script

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check dependencies
check_dependencies() {
    print_color $YELLOW "Checking dependencies..."
    
    local missing_deps=()

    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi

    if ! command_exists npm; then
        missing_deps+=("npm")
    fi

    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi

    if ! command_exists docker-compose; then
        missing_deps+=("docker-compose")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_color $RED "The following dependencies are missing:"
        for dep in "${missing_deps[@]}"; do
            echo "- $dep"
        done
        print_color $RED "Please install the missing dependencies and run the script again."
        exit 1
    fi

    print_color $GREEN "All dependencies are installed."
}

# Function to set up the environment
setup_environment() {
    print_color $YELLOW "Setting up environment..."

    if [ ! -f .env ]; then
        cp .env.example .env
        print_color $GREEN ".env file created from .env.example"
    else
        print_color $YELLOW ".env file already exists. Skipping creation."
    fi

    # Generate random values for sensitive variables
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env

    # Prompt user for database credentials
    read -p "Enter database name (default: pollen8): " DB_NAME
    DB_NAME=${DB_NAME:-pollen8}
    read -p "Enter database user (default: pollen8user): " DB_USER
    DB_USER=${DB_USER:-pollen8user}
    read -s -p "Enter database password: " DB_PASSWORD
    echo

    # Update .env file with user input
    sed -i.bak "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
    sed -i.bak "s/DB_USER=.*/DB_USER=$DB_USER/" .env
    sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env

    print_color $GREEN "Environment setup completed."
}

# Function to install dependencies
install_dependencies() {
    print_color $YELLOW "Installing project dependencies..."

    npm install

    # Install global dependencies if needed
    # npm install -g <global-dependency>

    print_color $GREEN "Dependencies installed successfully."
}

# Function to set up the database
setup_database() {
    print_color $YELLOW "Setting up database..."

    docker-compose up -d db
    print_color $YELLOW "Waiting for database to be ready..."
    sleep 10 # Wait for the database to be ready

    # Run migrations
    npm run migrate

    # Seed the database
    npm run seed

    print_color $GREEN "Database setup completed."
}

# Function to set up Redis
setup_redis() {
    print_color $YELLOW "Setting up Redis..."

    docker-compose up -d redis
    print_color $YELLOW "Waiting for Redis to be ready..."
    sleep 5 # Wait for Redis to be ready

    # Test Redis connection
    if docker-compose exec redis redis-cli ping | grep -q 'PONG'; then
        print_color $GREEN "Redis is ready and responding."
    else
        print_color $RED "Failed to connect to Redis. Please check the Redis container."
        exit 1
    fi
}

# Main function
main() {
    print_color $GREEN "Welcome to the Pollen8 Development Environment Setup!"

    check_dependencies
    setup_environment
    install_dependencies
    setup_database
    setup_redis

    print_color $GREEN "Setup completed successfully!"
    print_color $YELLOW "Next steps:"
    echo "1. Review the .env file and make any necessary changes."
    echo "2. Start the development server with: npm run dev"
    echo "3. Access the application at: http://localhost:3000"
}

# Run the main function
main