using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;

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

        public async Task<List<Carpeta>> GetByUser(Guid usuarioId)
        {
            return await _repository.GetByUser(usuarioId);
        }
        public async Task<Carpeta?> GetById(Guid id)
        {
            return await _repository.GetById(id);
        }
    }
}