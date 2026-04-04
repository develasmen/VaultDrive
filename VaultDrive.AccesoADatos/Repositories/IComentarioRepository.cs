using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface IComentarioRepository
    {
        Task Crear(Comentarios comentario);
        Task<List<Comentarios>> ObtenerPorArchivo(Guid archivoId);
        Task<bool> Eliminar(Guid id);
    }
}

