using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface IArchivoEtiquetaRepository
    {
        Task Crear(ArchivoEtiqueta archivoEtiqueta);
        Task<List<ArchivoEtiqueta>> ObtenerPorArchivo(Guid archivoId);
        Task<List<ArchivoEtiqueta>> ObtenerPorArchivos(List<Guid> archivoIds);
        Task<List<ArchivoEtiqueta>> ObtenerPorEtiqueta(Guid etiquetaId);
        Task<bool> Eliminar(Guid archivoId, Guid etiquetaId);
        Task<bool> Existe(Guid archivoId, Guid etiquetaId);
    }
}