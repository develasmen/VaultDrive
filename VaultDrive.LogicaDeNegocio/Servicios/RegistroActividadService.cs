using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class RegistroActividadService
    {
        private readonly IRegistroActividadRepository _repository;

        public RegistroActividadService(IRegistroActividadRepository repository)
        {
            _repository = repository;
        }

        public async Task RegistrarAsync(Guid usuarioId, string accion, Guid? archivoId = null, Guid? carpetaId = null)
        {
            var registro = new RegistroActividad
            {
                UsuarioId = usuarioId,
                Accion = accion,
                ArchivoId = archivoId,
                CarpetaId = carpetaId,
                Fecha = DateTime.UtcNow
            };

            await _repository.Crear(registro);
        }

        public async Task<List<RegistroActividad>> ObtenerPorUsuarioAsync(Guid usuarioId)
            => await _repository.ObtenerPorUsuario(usuarioId);
    }
}