using VaultDrive.Abstracciones.DTOs;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class ConfiguracionUsuarioService
    {
        private readonly IConfiguracionUsuarioRepository _repository;

        public ConfiguracionUsuarioService(IConfiguracionUsuarioRepository repository)
        {
            _repository = repository;
        }

        public async Task<ConfiguracionUsuario> ObtenerOCrearAsync(Guid usuarioId)
        {
            var config = await _repository.ObtenerPorUsuario(usuarioId);
            if (config == null)
            {
                config = new ConfiguracionUsuario { UsuarioId = usuarioId };
                await _repository.Crear(config);
            }
            return config;
        }

        public async Task<ConfiguracionUsuario> ActualizarAsync(Guid usuarioId, ActualizarConfiguracionUsuarioDto dto)
        {
            var config = await _repository.ObtenerPorUsuario(usuarioId);
            if (config == null)
            {
                config = new ConfiguracionUsuario { UsuarioId = usuarioId };
                if (dto.Tema != null) config.Tema = dto.Tema;
                if (dto.Idioma != null) config.Idioma = dto.Idioma;
                await _repository.Crear(config);
            }
            else
            {
                if (dto.Tema != null) config.Tema = dto.Tema;
                if (dto.Idioma != null) config.Idioma = dto.Idioma;
                await _repository.Actualizar(config);
            }
            return config;
        }
    }
}
