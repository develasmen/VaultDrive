using AspNetCore.Identity.MongoDbCore.Models;
using MongoDbGenericRepository.Attributes;

namespace VaultDrive.Abstracciones.Modelos
{
    [CollectionName("Rol")]
    public class ApplicationRole : MongoIdentityRole<Guid>
    {
    }
}