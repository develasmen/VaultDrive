namespace VaultDrive.Abstracciones.DTOs
{
    public class CrearVersionArchivoDto
    {
        public Guid ArchivoId { get; set; }
        public string NombreArchivo { get; set; } = string.Empty;
        public long Tamaño { get; set; }
        public string ComentarioCambio { get; set; } = string.Empty;
        public Guid UsuarioId { get; set; }
    }
}
