# Configure the AWS provider
terraform {
  required_version = ">= 0.14.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
  backend "s3" {
    bucket         = "pollen8-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "pollen8-terraform-locks"
  }
}

provider "aws" {
  region = "us-west-2"
}

# Create VPC
resource "aws_vpc" "pollen8_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "pollen8-vpc"
  }
}

# Create public subnets
resource "aws_subnet" "pollen8_public_subnet_1" {
  vpc_id                  = aws_vpc.pollen8_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = true

  tags = {
    Name = "pollen8-public-subnet-1"
  }
}

resource "aws_subnet" "pollen8_public_subnet_2" {
  vpc_id                  = aws_vpc.pollen8_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-west-2b"
  map_public_ip_on_launch = true

  tags = {
    Name = "pollen8-public-subnet-2"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "pollen8_igw" {
  vpc_id = aws_vpc.pollen8_vpc.id

  tags = {
    Name = "pollen8-igw"
  }
}

# Create route table
resource "aws_route_table" "pollen8_public_rt" {
  vpc_id = aws_vpc.pollen8_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.pollen8_igw.id
  }

  tags = {
    Name = "pollen8-public-rt"
  }
}

# Associate route table with subnets
resource "aws_route_table_association" "pollen8_public_1_rt_assoc" {
  subnet_id      = aws_subnet.pollen8_public_subnet_1.id
  route_table_id = aws_route_table.pollen8_public_rt.id
}

resource "aws_route_table_association" "pollen8_public_2_rt_assoc" {
  subnet_id      = aws_subnet.pollen8_public_subnet_2.id
  route_table_id = aws_route_table.pollen8_public_rt.id
}

# Create security group
resource "aws_security_group" "pollen8_web_sg" {
  name        = "pollen8-web-sg"
  description = "Security group for Pollen8 web servers"
  vpc_id      = aws_vpc.pollen8_vpc.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pollen8-web-sg"
  }
}

# Create DB subnet group
resource "aws_db_subnet_group" "pollen8_db_subnet_group" {
  name       = "pollen8-db-subnet-group"
  subnet_ids = [aws_subnet.pollen8_public_subnet_1.id, aws_subnet.pollen8_public_subnet_2.id]

  tags = {
    Name = "Pollen8 DB subnet group"
  }
}

# Generate random password for DB
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Create RDS instance
resource "aws_db_instance" "pollen8_db" {
  identifier             = "pollen8-db"
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "13.4"
  instance_class         = "db.t3.micro"
  name                   = "pollen8db"
  username               = "pollen8admin"
  password               = random_password.db_password.result
  parameter_group_name   = "default.postgres13"
  publicly_accessible    = false
  db_subnet_group_name   = aws_db_subnet_group.pollen8_db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.pollen8_web_sg.id]
  skip_final_snapshot    = true

  tags = {
    Name = "pollen8-db"
  }
}

# Create ElastiCache subnet group
resource "aws_elasticache_subnet_group" "pollen8_redis_subnet_group" {
  name       = "pollen8-redis-subnet-group"
  subnet_ids = [aws_subnet.pollen8_public_subnet_1.id, aws_subnet.pollen8_public_subnet_2.id]
}

# Create ElastiCache cluster
resource "aws_elasticache_cluster" "pollen8_redis" {
  cluster_id           = "pollen8-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.pollen8_redis_subnet_group.name
  security_group_ids   = [aws_security_group.pollen8_web_sg.id]

  tags = {
    Name = "pollen8-redis"
  }
}