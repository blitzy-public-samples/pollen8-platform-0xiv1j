# AWS Region
variable "region" {
  type        = string
  description = "The AWS region where resources will be created"
  default     = "us-west-2"
}

# Deployment Environment
variable "environment" {
  type        = string
  description = "The deployment environment (e.g., dev, staging, prod)"
  default     = "prod"
}

# VPC Configuration
variable "vpc_cidr" {
  type        = string
  description = "The CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "List of CIDR blocks for public subnets"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

# RDS Configuration
variable "db_instance_class" {
  type        = string
  description = "The instance type of the RDS instance"
  default     = "db.t3.micro"
}

variable "db_name" {
  type        = string
  description = "The name of the database to create"
  default     = "pollen8db"
}

variable "db_username" {
  type        = string
  description = "Username for the database"
  default     = "pollen8admin"
}

# ElastiCache Redis Configuration
variable "redis_node_type" {
  type        = string
  description = "The node type for the ElastiCache Redis cluster"
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  type        = number
  description = "The number of cache nodes in the ElastiCache Redis cluster"
  default     = 1
}

# Project Configuration
variable "project_name" {
  type        = string
  description = "The name of the project, used for resource naming"
  default     = "pollen8"
}