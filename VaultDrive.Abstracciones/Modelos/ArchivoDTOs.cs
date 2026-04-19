namespace VaultDrive.Abstracciones.DTOs
{
    public class CrearArchivoDto
    {
        public Guid UsuarioId { get; set; }
        public Guid CarpetaId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string TipoArchivo { get; set; } = string.Empty;
        public long Tamaño { get; set; }
        public string? Duracion { get; set; }
        public string RutaArchivo { get; set; } = string.Empty;
        public string? ImagenPortada { get; set; }
        public string? ColorTexto { get; set; }
        public string? Fuente { get; set; }
    }

    public class ActualizarArchivoDto
    {
        public Guid Id { get; set; }
        public string? Nombre { get; set; }
        public string? RutaArchivo { get; set; }
        public long? Tamaño { get; set; }
        public string? Duracion { get; set; }
        public string ComentarioCambio { get; set; } = "Archivo actualizado";
        public Guid UsuarioId { get; set; }
    }

    public class ArchivoDetalleDto
    {
        public Guid Id { get; set; }
        public Guid UsuarioId { get; set; }
        public Guid CarpetaId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string TipoArchivo { get; set; } = string.Empty;
        public long Tamaño { get; set; }
        public string? Duracion { get; set; }
        public string RutaArchivo { get; set; } = string.Empty;
        public DateTime FechaSubida { get; set; }
        public string? ImagenPortada { get; set; }
        public string? ColorTexto { get; set; }
        public string? Fuente { get; set; }
        public int VersionActual { get; set; }
    }
}
