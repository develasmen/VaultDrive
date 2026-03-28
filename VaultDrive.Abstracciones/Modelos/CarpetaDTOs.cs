namespace VaultDrive.Abstracciones.DTOs
{
    // Crear Carpeta
    public class CrearCarpetaDto
    {
        public Guid UsuarioId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string PortadaImg { get; set; } = string.Empty;
        public Guid? CarpetaPadre { get; set; }
    }

    // Actualizar Carpeta
    public class ActualizarCarpetaDto
    {
        public Guid Id { get; set; }
        public string NuevoNombre { get; set; } = string.Empty;
        public string NuevaPortadaImg { get; set; } = string.Empty;
    }
}