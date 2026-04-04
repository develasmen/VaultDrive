namespace VaultDrive.Abstracciones.DTOs
{
    public class CrearRegistroActividadDto
    {
        public Guid UsuarioId { get; set; }
        public string Accion { get; set; } = string.Empty;
        public Guid? ArchivoId { get; set; }
        public Guid? CarpetaId { get; set; }
    }
}