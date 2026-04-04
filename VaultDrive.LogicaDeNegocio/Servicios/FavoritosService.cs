using VaultDrive.Abstracciones.Modelos;
using VaultDrive.Abstracciones.Repositories;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class FavoritosService
    {
        private readonly IFavoritosRepository _repository;

        public FavoritosService(IFavoritosRepository repository)
        {
            _repository = repository;
        }

        public async Task<Favoritos> AgregarFavoritoAsync(CrearFavoritoDto dto)
        {
            if (await _repository.Existe(dto.UsuarioId, dto.ArchivoId))
                throw new InvalidOperationException("El archivo ya está en favoritos");

            var favorito = new Favoritos
            {
                UsuarioId = dto.UsuarioId,
                ArchivoId = dto.ArchivoId
            };

            await _repository.Crear(favorito);
            return favorito;
        }

        public async Task<List<Favoritos>> ObtenerFavoritosAsync(Guid usuarioId)
            => await _repository.ObtenerPorUsuario(usuarioId);

        public async Task<bool> EliminarFavoritoAsync(Guid usuarioId, Guid archivoId)
            => await _repository.Eliminar(usuarioId, archivoId);
    }
}