class Event:
    def __init__(
        self,
        id: int | None,
        titulo: str,
        creador_id: int,
        fecha,
        hora,
        localizacion: str,
        precio,
        plazas_totales: int,
        plazas_ocupadas: int,
        imagen_url: str | None,
        descripcion: str,
        estado: str = 'pendiente'
    ):
        self.id = id
        self.titulo = titulo
        self.creador_id = creador_id
        self.fecha = fecha
        self.hora = hora
        self.localizacion = localizacion
        self.precio = precio
        self.plazas_totales = plazas_totales
        self.plazas_ocupadas = plazas_ocupadas
        self.imagen_url = imagen_url
        self.descripcion = descripcion
        self.estado = estado
