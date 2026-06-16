# Para gestionar la informacion del usuario (inf de perfil básica y el rol)
class User:
    def __init__(self, id: int | None, nombre: str, email: str, role: str = 'fan'):
        self.id = id
        self.nombre = nombre
        self.email = email
        self.role = role
