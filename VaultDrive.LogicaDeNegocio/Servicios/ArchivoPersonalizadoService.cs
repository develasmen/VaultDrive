using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class ArchivoPersonalizadoService
    {
        private readonly IArchivoPersonalizadoRepository _repository;
        private readonly IVersionArchivoRepository _versionRepository;

        public ArchivoPersonalizadoService(
            IArchivoPersonalizadoRepository repository,
            IVersionArchivoRepository versionRepository)
        {
            _repository = repository;
            _versionRepository = versionRepository;
        }

        public async Task<ArchivoPersonalizado> Crear(CrearArchivoPersonalizadoDto dto)
        {
            var existente = await _repository.GetByArchivoId(dto.ArchivoId);
            if (existente != null)
                throw new InvalidOperationException("Ya existe una personalización para este archivo");

            var personalizado = new ArchivoPersonalizado
            {
                ArchivoId = dto.ArchivoId,
                ImagenPortada = dto.ImagenPortada,
                ColorTexto = dto.ColorTexto,
                Fuente = dto.Fuente
            };

            await _repository.Crear(personalizado);

            await RegistrarVersion(dto.ArchivoId, "Personalización inicial creada",
                $"ImagenPortada={dto.ImagenPortada}; ColorTexto={dto.ColorTexto}; Fuente={dto.Fuente}");

            return personalizado;
        }

        public async Task<ArchivoPersonalizado> GetByArchivoId(Guid archivoId)
        {
            return await _repository.GetByArchivoId(archivoId);
        }

        public async Task<List<ArchivoPersonalizado>> GetByArchivoIds(List<Guid> archivoIds)
        {
            if (archivoIds == null || archivoIds.Count == 0)
                return new List<ArchivoPersonalizado>();
            return await _repository.GetByUsuarioArchivos(archivoIds);
        }

        public async Task<ArchivoPersonalizado> GetById(Guid id)
        {
            return await _repository.GetById(id);
        }

        public async Task<bool> Actualizar(ActualizarArchivoPersonalizadoDto dto)
        {
            var personalizado = await _repository.GetById(dto.Id);
            if (personalizado == null) return false;

            var cambios = new List<string>();

            if (dto.ImagenPortada != null && dto.ImagenPortada != personalizado.ImagenPortada)
            {
                cambios.Add($"ImagenPortada: '{personalizado.ImagenPortada}' → '{dto.ImagenPortada}'");
                personalizado.ImagenPortada = dto.ImagenPortada;
            }

            if (dto.ColorTexto != null && dto.ColorTexto != personalizado.ColorTexto)
            {
                cambios.Add($"ColorTexto: '{personalizado.ColorTexto}' → '{dto.ColorTexto}'");
                personalizado.ColorTexto = dto.ColorTexto;
            }

            if (dto.Fuente != null && dto.Fuente != personalizado.Fuente)
            {
                cambios.Add($"Fuente: '{personalizado.Fuente}' → '{dto.Fuente}'");
                personalizado.Fuente = dto.Fuente;
            }

            if (cambios.Count == 0) return true;

            var resultado = await _repository.Actualizar(personalizado);

            if (resultado)
            {
                await RegistrarVersion(personalizado.ArchivoId,
                    "Personalización actualizada",
                    string.Join("; ", cambios));
            }

            return resultado;
        }

        public async Task<bool> Eliminar(Guid id)
        {
            return await _repository.Eliminar(id);
        }

        private async Task RegistrarVersion(Guid archivoId, string comentario, string detallesCambio)
        {
            var ultimoNumero = await _versionRepository.ObtenerUltimoNumeroVersion(archivoId);

            var version = new VersionArchivo
            {
                ArchivoId = archivoId,
                VersionNumero = ultimoNumero + 1,
                CambiosRealizados = detallesCambio,
                ComentarioCambio = comentario,
                FechaVersion = DateTime.UtcNow
            };

            await _versionRepository.Crear(version);
        }
    }
}
