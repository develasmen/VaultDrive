using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class ComentarioService
    {
        private readonly IComentarioRepository _repository;

        public ComentarioService(IComentarioRepository repository)
        {
            _repository = repository;
        }

        public async Task<Comentarios> CrearComentarioAsync(CrearComentarioDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Comentario))
                throw new InvalidOperationException("El comentario no puede estar vacío");

            var comentario = new Comentarios
            {
                UsuarioId = dto.UsuarioId,
                ArchivoId = dto.ArchivoId,
                Comentario = dto.Comentario,
                Fecha = DateTime.UtcNow
            };

            await _repository.Crear(comentario);
            return comentario;
        }

        public async Task<List<Comentarios>> ObtenerPorArchivoAsync(Guid archivoId)
            => await _repository.ObtenerPorArchivo(archivoId);

        public async Task<bool> EliminarComentarioAsync(Guid id)
            => await _repository.Eliminar(id);
    }
}