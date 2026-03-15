using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("RegistroActividad")]
    public class RegistroActividad
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UsuarioId { get; set; }
        public string Accion { get; set; } = string.Empty;
        public Guid? ArchivoId { get; set; }
        public Guid? CarpetaId { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
    }
}