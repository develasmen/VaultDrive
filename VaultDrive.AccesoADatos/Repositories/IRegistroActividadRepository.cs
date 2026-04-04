using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface IRegistroActividadRepository
    {
        Task Crear(RegistroActividad registro);
        Task<List<RegistroActividad>> ObtenerPorUsuario(Guid usuarioId);
    }
}