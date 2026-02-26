class QuantityValidationError(ValueError):
    """Raised when quantity values are bad."""
    pass


class UniqueBarcodeError(ValueError):
    """Raised when a user tries to create/update a product with a duplicate barcode."""
    pass