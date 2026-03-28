using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class CarpetaService
    {
        private readonly ICarpetaRepository _repository;

        public CarpetaService(ICarpetaRepository repository)
        {
            _repository = repository;
        }

        public async Task<Carpeta> Crear(Guid usuarioId, string nombre, string portadaImg, Guid? carpetaPadre)
        {
            var carpeta = new Carpeta 
            { 
                UsuarioId = usuarioId, 
                Nombre = nombre, 
                PortadaImg = portadaImg, 
                CarpetaPadre = carpetaPadre 
            };
            await _repository.Crear(carpeta);
            return carpeta;
        }

        public async Task<List<Carpeta>> GetByUser(Guid usuarioId) => await _repository.GetByUser(usuarioId);

        public async Task<bool> Actualizar(ActualizarCarpetaDto dto)
        {
            var carpeta = await _repository.GetById(dto.Id);
            if (carpeta == null) return false;

            carpeta.Nombre = dto.NuevoNombre;
            carpeta.PortadaImg = dto.NuevaPortadaImg;
            return await _repository.Actualizar(carpeta);
        }

        public async Task<bool> Eliminar(Guid id) => await _repository.Eliminar(id);
    }
}