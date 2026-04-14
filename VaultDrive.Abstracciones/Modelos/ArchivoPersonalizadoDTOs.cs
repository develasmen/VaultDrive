namespace VaultDrive.Abstracciones.DTOs
{
    public class CrearArchivoPersonalizadoDto
    {
        public Guid ArchivoId { get; set; }
        public string ImagenPortada { get; set; } = string.Empty;
        public string ColorTexto { get; set; } = "#000000";
        public string Fuente { get; set; } = "Arial";
    }

    public class ActualizarArchivoPersonalizadoDto
    {
        public Guid Id { get; set; }
        public string? ImagenPortada { get; set; }
        public string? ColorTexto { get; set; }
        public string? Fuente { get; set; }
    }
}
