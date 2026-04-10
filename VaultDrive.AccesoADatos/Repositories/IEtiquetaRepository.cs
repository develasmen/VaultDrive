using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface IEtiquetaRepository
    {
        Task Crear(Etiqueta etiqueta);
        Task<List<Etiqueta>> ObtenerPorUsuario(Guid usuarioId);
        Task<Etiqueta> ObtenerPorId(Guid id);
        Task<bool> Eliminar(Guid id);
    }
}