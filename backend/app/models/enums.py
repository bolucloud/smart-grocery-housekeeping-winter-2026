import enum


class ProductType(str, enum.Enum):
    vegetable = "vegetable"
    fruit = "fruit"
    packaged = "packaged"


class StorageLocation(str, enum.Enum):
    fridge = "fridge"
    pantry = "pantry"
    freezer = "freezer"