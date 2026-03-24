using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("Carpeta")]
    public class Carpeta
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; } = Guid.NewGuid();
        [BsonRepresentation(BsonType.String)]
        public Guid UsuarioId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string PortadaImg { get; set; } = string.Empty;
        [BsonRepresentation(BsonType.String)]
        public Guid? CarpetaPadre { get; set; }
    }
}