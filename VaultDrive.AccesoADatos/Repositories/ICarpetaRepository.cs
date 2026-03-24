using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface ICarpetaRepository
    {
        Task Crear(Carpeta carpeta);
        Task<List<Carpeta>> GetByUser(Guid usuarioId);
        Task<Carpeta> GetById(Guid id);

    }
}
