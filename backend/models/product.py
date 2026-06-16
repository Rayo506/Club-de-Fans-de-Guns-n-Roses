# Para mapear y gestionar la información de los productos (ciclo de vida y validación antes de ser vendidos)
class Product:
    def __init__(
        self,
        id: int | None,
        nombre: str,
        vendedor_id: int,
        precio,
        categoria: str,
        estado: str,
        estado_validacion: str,
        imagen_url: str | None,
        descripcion: str
    ):
        self.id = id
        self.nombre = nombre
        self.vendedor_id = vendedor_id
        self.precio = precio
        self.categoria = categoria
        self.estado = estado
        self.estado_validacion = estado_validacion
        self.imagen_url = imagen_url
        self.descripcion = descripcion
