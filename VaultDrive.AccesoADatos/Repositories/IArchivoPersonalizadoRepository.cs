using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface IArchivoPersonalizadoRepository
    {
        Task Crear(ArchivoPersonalizado archivo);
        Task<ArchivoPersonalizado> GetById(Guid id);
        Task<ArchivoPersonalizado> GetByArchivoId(Guid archivoId);
        Task<bool> Actualizar(ArchivoPersonalizado archivo);
        Task<bool> Eliminar(Guid id);
    }
}
