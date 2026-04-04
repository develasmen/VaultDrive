using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface IFavoritosRepository
    {
        Task Crear(Favoritos favorito);
        Task<List<Favoritos>> ObtenerPorUsuario(Guid usuarioId);
        Task<bool> Eliminar(Guid usuarioId, Guid archivoId);
        Task<bool> Existe(Guid usuarioId, Guid archivoId);
    }
}