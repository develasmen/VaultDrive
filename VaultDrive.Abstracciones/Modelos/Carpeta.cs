using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("Carpeta")]
    public class Carpeta
    {
        [BsonId]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UsuarioId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string PortadaImg { get; set; } = string.Empty;
        public Guid? CarpetaPadre { get; set; }
    }
}