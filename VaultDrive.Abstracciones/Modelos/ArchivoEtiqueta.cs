using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("ArchivoEtiqueta")]
    public class ArchivoEtiqueta
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ArchivoId { get; set; }
        public Guid EtiquetaId { get; set; }
    }
}