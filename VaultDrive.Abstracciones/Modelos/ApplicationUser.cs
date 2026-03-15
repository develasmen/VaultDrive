using AspNetCore.Identity.MongoDbCore.Models;
using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("Usuario")]
    public class ApplicationUser : MongoIdentityUser<Guid>
    {
        public string Nombre { get; set; } = string.Empty;
        public long EspacioTotal { get; set; } = 50000;
        public long EspacioOcupado { get; set; } = 0;
    }
}