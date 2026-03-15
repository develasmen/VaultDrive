using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("ConfiguracionUsuario")]
    public class ConfiguracionUsuario
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UsuarioId { get; set; }
        public string Idioma { get; set; } = "ES";
        public string Tema { get; set; } = "Claro";
    }
}