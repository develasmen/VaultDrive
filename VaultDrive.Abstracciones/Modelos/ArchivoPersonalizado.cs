using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("ArchivoPersonalizado")]
    public class ArchivoPersonalizado
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ArchivoId { get; set; }
        public string ImagenPortada { get; set; } = string.Empty;
        public string ColorTexto { get; set; } = "#000000";
        public string Fuente { get; set; } = "Arial";
    }
}