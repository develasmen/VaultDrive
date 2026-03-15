using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("Notificaciones")]
    public class Notificaciones
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UsuarioId { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public bool Leida { get; set; } = false;
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
        public Guid? ArchivoId { get; set; }
        public string Sistema { get; set; } = string.Empty;
    }
}