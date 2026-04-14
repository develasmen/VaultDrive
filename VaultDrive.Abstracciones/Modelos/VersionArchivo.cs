using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("VersionArchivo")]
    public class VersionArchivo
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ArchivoId { get; set; }
        public int VersionNumero { get; set; }
        public string NombreArchivo { get; set; } = string.Empty;
        public long Tamaño { get; set; }
        public DateTime FechaVersion { get; set; } = DateTime.UtcNow;
        public string ComentarioCambio { get; set; } = string.Empty;
        public string CambiosRealizados { get; set; } = string.Empty;
        public Guid UsuarioId { get; set; }
    }
}