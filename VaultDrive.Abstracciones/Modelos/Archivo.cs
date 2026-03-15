using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("Archivo")]
    public class Archivo
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UsuarioId { get; set; }
        public Guid CarpetaId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string TipoArchivo { get; set; } = string.Empty;
        public long Tamaño { get; set; }
        public string? Duracion { get; set; }
        public string RutaArchivo { get; set; } = string.Empty;
        public DateTime FechaSubida { get; set; } = DateTime.UtcNow;
    }
}