#!/bin/bash

# Pollen8 Deployment Script

# Set strict mode
set -euo pipefail

# Function to check environment
check_environment() {
  echo "Checking environment..."
  
  # Check required environment variables
  if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
    echo "Error: AWS credentials are not set. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
    exit 1
  fi

  # Check AWS CLI
  if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it and configure it."
    exit 1
  fi

  # Check Docker
  if ! docker info &> /dev/null; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
  fi

  # Check Node.js version
  required_node_version="14.0.0"
  if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js version $required_node_version or higher."
    exit 1
  fi
  if ! node -v | grep -q "v$required_node_version"; then
    echo "Error: Node.js version $required_node_version or higher is required."
    exit 1
  fi

  echo "Environment check passed."
}

# Function to build application
build_application() {
  echo "Building application..."
  npm run build

  echo "Building Docker image..."
  docker build -t pollen8-app .

  # Tag Docker image
  commit_hash=$(git rev-parse --short HEAD)
  docker tag pollen8-app:latest pollen8-app:$commit_hash-$ENVIRONMENT
  
  echo "Application built and Docker image tagged."
}

# Function to push to registry
push_to_registry() {
  echo "Pushing Docker image to ECR..."
  
  # Log in to ECR
  aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

  # Push image to ECR
  docker push $ECR_REGISTRY/pollen8-app:$commit_hash-$ENVIRONMENT

  echo "Docker image pushed to ECR."
}

# Function to update ECS service
update_ecs_service() {
  local environment=$1
  echo "Updating ECS service for $environment..."

  # Update task definition
  sed -i.bak -e "s|{{IMAGE_URI}}|$ECR_REGISTRY/pollen8-app:$commit_hash-$environment|g" task-definition.json
  aws ecs register-task-definition --cli-input-json file://task-definition.json

  # Update ECS service
  aws ecs update-service --cluster pollen8-cluster-$environment --service pollen8-service-$environment --task-definition pollen8-task-$environment

  echo "Waiting for ECS service to stabilize..."
  aws ecs wait services-stable --cluster pollen8-cluster-$environment --services pollen8-service-$environment

  echo "ECS service updated."
}

# Function to run database migrations
run_database_migrations() {
  local environment=$1
  echo "Running database migrations for $environment..."

  # Get RDS endpoint
  db_endpoint=$(aws rds describe-db-instances --db-instance-identifier pollen8-db-$environment --query 'DBInstances[0].Endpoint.Address' --output text)

  # Run migrations
  DB_HOST=$db_endpoint npm run migrate

  echo "Database migrations completed."
}

# Function to perform health check
perform_health_check() {
  local environment=$1
  echo "Performing health check for $environment..."

  # Get the ALB DNS name
  alb_dns=$(aws elbv2 describe-load-balancers --names pollen8-alb-$environment --query 'LoadBalancers[0].DNSName' --output text)

  # Perform health check
  health_check_url="http://$alb_dns/health"
  max_retries=5
  retry_interval=10

  for ((i=1; i<=max_retries; i++)); do
    if curl -sSf "$health_check_url" > /dev/null 2>&1; then
      echo "Health check passed."
      return 0
    else
      echo "Health check failed. Retrying in $retry_interval seconds... (Attempt $i/$max_retries)"
      sleep $retry_interval
    fi
  done

  echo "Health check failed after $max_retries attempts."
  return 1
}

# Function to rollback deployment
rollback() {
  local environment=$1
  echo "Rolling back deployment for $environment..."

  # Get previous task definition
  previous_task_def=$(aws ecs describe-services --cluster pollen8-cluster-$environment --services pollen8-service-$environment --query 'services[0].taskDefinition' --output text)

  # Revert to previous task definition
  aws ecs update-service --cluster pollen8-cluster-$environment --service pollen8-service-$environment --task-definition $previous_task_def

  echo "Waiting for rollback to complete..."
  aws ecs wait services-stable --cluster pollen8-cluster-$environment --services pollen8-service-$environment

  echo "Rollback completed. Notifying team..."
  # TODO: Implement team notification (e.g., Slack webhook)

  echo "Rollback process finished."
}

# Main function
main() {
  local environment=$1
  echo "Starting deployment process for $environment environment..."

  check_environment
  build_application
  push_to_registry
  update_ecs_service "$environment"
  run_database_migrations "$environment"

  if perform_health_check "$environment"; then
    echo "Deployment successful!"
  else
    echo "Deployment failed. Initiating rollback..."
    rollback "$environment"
    exit 1
  fi

  echo "Deployment process completed."
}

# Check if environment argument is provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <environment>"
  exit 1
fi

# Set environment variables
ENVIRONMENT=$1
AWS_REGION="us-west-2"  # TODO: Make this configurable
ECR_REGISTRY="your-account-id.dkr.ecr.$AWS_REGION.amazonaws.com"  # TODO: Replace with actual ECR registry

# Run main function
main "$ENVIRONMENT"