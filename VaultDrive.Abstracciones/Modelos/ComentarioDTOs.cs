namespace VaultDrive.Abstracciones.DTOs
{
    public class CrearComentarioDto
    {
        public Guid UsuarioId { get; set; }
        public Guid ArchivoId { get; set; }
        public string Comentario { get; set; } = string.Empty;
    }

    public class ActualizarComentarioDto
    {
        public string Comentario { get; set; } = string.Empty;
    }
}

