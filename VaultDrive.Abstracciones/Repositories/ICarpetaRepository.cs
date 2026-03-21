using VaultDrive.Abstracciones.Modelos;

namespace WebApplicationAPP.Repositories
{
    public interface ICarpetaRepository
    {
        Task Crear(Carpeta carpeta);
        Task<List<Carpeta>> GetByUser(Guid usuarioId);
        Task<Carpeta> GetById(Guid id);

    }
}
