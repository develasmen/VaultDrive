using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class VersionArchivoService
    {
        private readonly IVersionArchivoRepository _repository;

        public VersionArchivoService(IVersionArchivoRepository repository)
        {
            _repository = repository;
        }

        public async Task<VersionArchivo> Crear(CrearVersionArchivoDto dto)
        {
            var ultimoNumero = await _repository.ObtenerUltimoNumeroVersion(dto.ArchivoId);

            var version = new VersionArchivo
            {
                ArchivoId = dto.ArchivoId,
                VersionNumero = ultimoNumero + 1,
                NombreArchivo = dto.NombreArchivo,
                Tamaño = dto.Tamaño,
                ComentarioCambio = dto.ComentarioCambio,
                UsuarioId = dto.UsuarioId,
                FechaVersion = DateTime.UtcNow
            };

            await _repository.Crear(version);
            return version;
        }

        public async Task<List<VersionArchivo>> ObtenerHistorial(Guid archivoId)
        {
            return await _repository.GetByArchivoId(archivoId);
        }

        public async Task<VersionArchivo> ObtenerPorId(Guid id)
        {
            return await _repository.GetById(id);
        }
    }
}
