using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.Abstracciones.Repositories
{
    public interface IConfiguracionUsuarioRepository
    {
        Task<ConfiguracionUsuario?> ObtenerPorUsuario(Guid usuarioId);
        Task Crear(ConfiguracionUsuario config);
        Task<bool> Actualizar(ConfiguracionUsuario config);
    }
}
