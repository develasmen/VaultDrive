using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class ArchivoService
    {
        private readonly IArchivoRepository _archivoRepository;
        private readonly IVersionArchivoRepository _versionRepository;
        private readonly IArchivoPersonalizadoRepository _personalizadoRepository;

        public ArchivoService(
            IArchivoRepository archivoRepository,
            IVersionArchivoRepository versionRepository,
            IArchivoPersonalizadoRepository personalizadoRepository)
        {
            _archivoRepository = archivoRepository;
            _versionRepository = versionRepository;
            _personalizadoRepository = personalizadoRepository;
        }

        public async Task<ArchivoDetalleDto> Crear(CrearArchivoDto dto)
        {
            var archivo = new Archivo
            {
                UsuarioId   = dto.UsuarioId,
                CarpetaId   = dto.CarpetaId,
                Nombre      = dto.Nombre,
                TipoArchivo = dto.TipoArchivo,
                Tamaño      = dto.Tamaño,
                Duracion    = dto.Duracion,
                RutaArchivo = dto.RutaArchivo,
                FechaSubida = DateTime.UtcNow
            };
            await _archivoRepository.Crear(archivo);

            var version = new VersionArchivo
            {
                ArchivoId        = archivo.Id,
                VersionNumero    = 1,
                NombreArchivo    = dto.Nombre,
                Tamaño           = dto.Tamaño,
                ComentarioCambio = "Archivo creado",
                CambiosRealizados = $"Subida inicial: {dto.Nombre} ({dto.TipoArchivo}, {dto.Tamaño} bytes)",
                UsuarioId        = dto.UsuarioId,
                FechaVersion     = DateTime.UtcNow
            };
            await _versionRepository.Crear(version);

            string? imagenPortada = null;
            string? colorTexto   = null;
            string? fuente       = null;

            bool tienePersonalizacion = !string.IsNullOrWhiteSpace(dto.ImagenPortada)
                                     || !string.IsNullOrWhiteSpace(dto.ColorTexto)
                                     || !string.IsNullOrWhiteSpace(dto.Fuente);

            if (tienePersonalizacion)
            {
                var personalizado = new ArchivoPersonalizado
                {
                    ArchivoId     = archivo.Id,
                    ImagenPortada = dto.ImagenPortada ?? string.Empty,
                    ColorTexto    = dto.ColorTexto   ?? "#000000",
                    Fuente        = dto.Fuente       ?? "Arial"
                };
                await _personalizadoRepository.Crear(personalizado);

                imagenPortada = personalizado.ImagenPortada;
                colorTexto    = personalizado.ColorTexto;
                fuente        = personalizado.Fuente;
            }

            return MapearDetalle(archivo, imagenPortada, colorTexto, fuente, versionActual: 1);
        }

        public async Task<ArchivoDetalleDto?> GetById(Guid id)
        {
            var archivo = await _archivoRepository.GetById(id);
            if (archivo == null) return null;

            return await EnriquecerArchivo(archivo);
        }

        public async Task<List<ArchivoDetalleDto>> GetByUsuarioId(Guid usuarioId)
        {
            var archivos = await _archivoRepository.GetByUsuarioId(usuarioId);
            var resultado = new List<ArchivoDetalleDto>();
            foreach (var a in archivos)
                resultado.Add(await EnriquecerArchivo(a));
            return resultado;
        }

        public async Task<List<ArchivoDetalleDto>> GetByCarpetaId(Guid carpetaId)
        {
            var archivos = await _archivoRepository.GetByCarpetaId(carpetaId);
            var resultado = new List<ArchivoDetalleDto>();
            foreach (var a in archivos)
                resultado.Add(await EnriquecerArchivo(a));
            return resultado;
        }

        public async Task<bool> Actualizar(ActualizarArchivoDto dto)
        {
            var archivo = await _archivoRepository.GetById(dto.Id);
            if (archivo == null) return false;

            var cambios = new List<string>();

            if (dto.Nombre != null && dto.Nombre != archivo.Nombre)
            {
                cambios.Add($"Nombre: '{archivo.Nombre}' → '{dto.Nombre}'");
                archivo.Nombre = dto.Nombre;
            }

            if (dto.RutaArchivo != null && dto.RutaArchivo != archivo.RutaArchivo)
            {
                cambios.Add($"RutaArchivo actualizada");
                archivo.RutaArchivo = dto.RutaArchivo;
            }

            if (dto.Tamaño.HasValue && dto.Tamaño.Value != archivo.Tamaño)
            {
                cambios.Add($"Tamaño: {archivo.Tamaño} → {dto.Tamaño.Value} bytes");
                archivo.Tamaño = dto.Tamaño.Value;
            }

            if (dto.Duracion != null && dto.Duracion != archivo.Duracion)
            {
                cambios.Add($"Duración: '{archivo.Duracion}' → '{dto.Duracion}'");
                archivo.Duracion = dto.Duracion;
            }

            if (cambios.Count == 0) return true;

            var actualizado = await _archivoRepository.Actualizar(archivo);

            if (actualizado)
            {
                var ultimaVersion = await _versionRepository.ObtenerUltimoNumeroVersion(archivo.Id);
                var version = new VersionArchivo
                {
                    ArchivoId         = archivo.Id,
                    VersionNumero     = ultimaVersion + 1,
                    NombreArchivo     = archivo.Nombre,
                    Tamaño            = archivo.Tamaño,
                    ComentarioCambio  = dto.ComentarioCambio,
                    CambiosRealizados = string.Join("; ", cambios),
                    UsuarioId         = dto.UsuarioId,
                    FechaVersion      = DateTime.UtcNow
                };
                await _versionRepository.Crear(version);
            }

            return actualizado;
        }

        public async Task<bool> Eliminar(Guid id)
        {
            return await _archivoRepository.Eliminar(id);
        }

        private async Task<ArchivoDetalleDto> EnriquecerArchivo(Archivo archivo)
        {
            var personalizado = await _personalizadoRepository.GetByArchivoId(archivo.Id);
            var versionActual = await _versionRepository.ObtenerUltimoNumeroVersion(archivo.Id);

            return MapearDetalle(
                archivo,
                personalizado?.ImagenPortada,
                personalizado?.ColorTexto,
                personalizado?.Fuente,
                versionActual);
        }

        private static ArchivoDetalleDto MapearDetalle(
            Archivo archivo,
            string? imagenPortada,
            string? colorTexto,
            string? fuente,
            int versionActual)
        {
            return new ArchivoDetalleDto
            {
                Id            = archivo.Id,
                UsuarioId     = archivo.UsuarioId,
                CarpetaId     = archivo.CarpetaId,
                Nombre        = archivo.Nombre,
                TipoArchivo   = archivo.TipoArchivo,
                Tamaño        = archivo.Tamaño,
                Duracion      = archivo.Duracion,
                RutaArchivo   = archivo.RutaArchivo,
                FechaSubida   = archivo.FechaSubida,
                ImagenPortada = imagenPortada,
                ColorTexto    = colorTexto,
                Fuente        = fuente,
                VersionActual = versionActual
            };
        }
    }
}
