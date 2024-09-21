# Output the VPC ID
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.pollen8_vpc.id
}

# Output the public subnet IDs
output "public_subnet_ids" {
  description = "The IDs of the public subnets"
  value       = [
    aws_subnet.pollen8_public_subnet_1.id,
    aws_subnet.pollen8_public_subnet_2.id
  ]
}

# Output the RDS database endpoint
output "db_endpoint" {
  description = "The connection endpoint for the RDS database"
  value       = aws_db_instance.pollen8_db.endpoint
}

# Output the RDS database name
output "db_name" {
  description = "The name of the RDS database"
  value       = aws_db_instance.pollen8_db.name
}

# Output the ElastiCache Redis cluster endpoint
output "redis_endpoint" {
  description = "The connection endpoint for the ElastiCache Redis cluster"
  value       = aws_elasticache_cluster.pollen8_redis.cache_nodes[0].address
}

# Output the ElastiCache Redis cluster port
output "redis_port" {
  description = "The port number for the ElastiCache Redis cluster"
  value       = aws_elasticache_cluster.pollen8_redis.port
}

# Output the web security group ID
output "web_security_group_id" {
  description = "The ID of the security group for web servers"
  value       = aws_security_group.pollen8_web_sg.id
}