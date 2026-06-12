class User:
    def __init__(self, id: int | None, nombre: str, email: str, role: str = 'fan'):
        self.id = id
        self.nombre = nombre
        self.email = email
        self.role = role
