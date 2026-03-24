namespace VaultDrive.Abstracciones.DTOs
{
    public class CrearCarpetaDto
    {
        public Guid UsuarioId { get; set; }
        public string Nombre { get; set; }= string.Empty;
        public string PortadaImg { get; set; }=string.Empty;
        public Guid? CarpetaPadre { get; set; }
        
    }
}