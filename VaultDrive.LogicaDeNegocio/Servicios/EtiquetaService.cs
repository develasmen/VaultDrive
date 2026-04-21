using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class EtiquetaService
    {
        private readonly IEtiquetaRepository _etiquetaRepository;
        private readonly IArchivoEtiquetaRepository _archivoEtiquetaRepository;

        public EtiquetaService(IEtiquetaRepository etiquetaRepository,
                               IArchivoEtiquetaRepository archivoEtiquetaRepository)
        {
            _etiquetaRepository = etiquetaRepository;
            _archivoEtiquetaRepository = archivoEtiquetaRepository;
        }

        public async Task<Etiqueta> CrearEtiquetaAsync(CrearEtiquetaDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NombreEtiqueta))
                throw new InvalidOperationException("El nombre de la etiqueta es requerido");

            var etiqueta = new Etiqueta
            {
                UsuarioId = dto.UsuarioId,
                NombreEtiqueta = dto.NombreEtiqueta
            };

            await _etiquetaRepository.Crear(etiqueta);
            return etiqueta;
        }

        public async Task<List<Etiqueta>> ObtenerEtiquetasAsync(Guid usuarioId)
            => await _etiquetaRepository.ObtenerPorUsuario(usuarioId);

        public async Task<bool> ActualizarEtiquetaAsync(Guid id, string nuevoNombre)
        {
            if (string.IsNullOrWhiteSpace(nuevoNombre))
                throw new InvalidOperationException("El nombre de la etiqueta es requerido");

            var etiqueta = await _etiquetaRepository.ObtenerPorId(id);
            if (etiqueta is null)
                return false;

            etiqueta.NombreEtiqueta = nuevoNombre.Trim();
            return await _etiquetaRepository.Actualizar(etiqueta);
        }

        public async Task<bool> EliminarEtiquetaAsync(Guid id)
            => await _etiquetaRepository.Eliminar(id);

        public async Task<ArchivoEtiqueta> AsignarEtiquetaAsync(AsignarEtiquetaDto dto)
        {
            if (await _archivoEtiquetaRepository.Existe(dto.ArchivoId, dto.EtiquetaId))
                throw new InvalidOperationException("Esta etiqueta ya está asignada a este archivo");

            var etiqueta = await _etiquetaRepository.ObtenerPorId(dto.EtiquetaId);
            if (etiqueta == null)
                throw new InvalidOperationException("Etiqueta no encontrada");

            var archivoEtiqueta = new ArchivoEtiqueta
            {
                ArchivoId = dto.ArchivoId,
                EtiquetaId = dto.EtiquetaId
            };

            await _archivoEtiquetaRepository.Crear(archivoEtiqueta);
            return archivoEtiqueta;
        }

        public async Task<List<ArchivoEtiqueta>> ObtenerEtiquetasDeArchivoAsync(Guid archivoId)
            => await _archivoEtiquetaRepository.ObtenerPorArchivo(archivoId);

        public async Task<bool> QuitarEtiquetaAsync(Guid archivoId, Guid etiquetaId)
            => await _archivoEtiquetaRepository.Eliminar(archivoId, etiquetaId);
    }
}