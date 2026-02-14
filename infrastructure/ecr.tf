resource "aws_ecr_repository" "smart_grocery_housekeeping_repository" {
  name                 = "smart-grocery-housekeeping"
  image_tag_mutability = "MUTABLE"  
}
