namespace VaultDrive.Abstracciones.DTOs
{
    public class CrearEtiquetaDto
    {
        public Guid UsuarioId { get; set; }
        public string NombreEtiqueta { get; set; } = string.Empty;
    }

    public class AsignarEtiquetaDto
    {
        public Guid ArchivoId { get; set; }
        public Guid EtiquetaId { get; set; }
    }
}