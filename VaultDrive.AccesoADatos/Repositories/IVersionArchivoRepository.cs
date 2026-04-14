using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface IVersionArchivoRepository
    {
        Task Crear(VersionArchivo version);
        Task<List<VersionArchivo>> GetByArchivoId(Guid archivoId);
        Task<VersionArchivo> GetById(Guid id);
        Task<int> ObtenerUltimoNumeroVersion(Guid archivoId);
    }
}
