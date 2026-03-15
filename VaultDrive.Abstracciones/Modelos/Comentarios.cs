using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("Comentarios")]
    public class Comentarios
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UsuarioId { get; set; }
        public Guid ArchivoId { get; set; }
        public string Comentario { get; set; } = string.Empty;
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
    }
}