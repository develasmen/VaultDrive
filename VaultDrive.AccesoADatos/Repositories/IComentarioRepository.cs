using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface IComentarioRepository
    {
        Task Crear(Comentarios comentario);
        Task<List<Comentarios>> ObtenerPorArchivo(Guid archivoId);
        Task<Comentarios?> ObtenerPorId(Guid id);
        Task<bool> Actualizar(Comentarios comentario);
        Task<bool> Eliminar(Guid id);
    }
}

