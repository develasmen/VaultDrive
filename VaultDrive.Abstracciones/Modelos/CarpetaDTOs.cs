namespace VaultDrive.Abstracciones.DTOs
{
    public class CrearCarpetaDto
    {
        public Guid UsuarioId { get; set; }
        public string Nombre { get; set; }
        public string PortadaImg { get; set; }
        public Guid? CarpetaPadre { get; set; }
        
    }
}