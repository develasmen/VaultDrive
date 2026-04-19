using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    /// <summary>
    /// Contrato del repositorio para la entidad Archivo.
    /// Define las operaciones CRUD básicas sobre la colección MongoDB.
    /// </summary>
    public interface IArchivoRepository
    {
        Task Crear(Archivo archivo);
        Task<Archivo?> GetById(Guid id);
        Task<List<Archivo>> GetByUsuarioId(Guid usuarioId);
        Task<List<Archivo>> GetByCarpetaId(Guid carpetaId);
        Task<bool> Actualizar(Archivo archivo);
        Task<bool> Eliminar(Guid id);
    }
}
