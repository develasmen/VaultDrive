using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("Etiqueta")]
    public class Etiqueta
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UsuarioId { get; set; }
        public string NombreEtiqueta { get; set; } = string.Empty;
    }
}