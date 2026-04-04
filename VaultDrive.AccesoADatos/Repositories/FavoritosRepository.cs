using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class FavoritosRepository : IFavoritosRepository
    {
        private readonly IMongoCollection<Favoritos> _collection;

        public FavoritosRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<Favoritos>("Favoritos");
        }

        public async Task Crear(Favoritos favorito)
            => await _collection.InsertOneAsync(favorito);

        public async Task<List<Favoritos>> ObtenerPorUsuario(Guid usuarioId)
            => await _collection.Find(f => f.UsuarioId == usuarioId).ToListAsync();

        public async Task<bool> Eliminar(Guid usuarioId, Guid archivoId)
        {
            var resultado = await _collection.DeleteOneAsync(
                f => f.UsuarioId == usuarioId && f.ArchivoId == archivoId);
            return resultado.DeletedCount > 0;
        }

        public async Task<bool> Existe(Guid usuarioId, Guid archivoId)
            => await _collection.Find(
                f => f.UsuarioId == usuarioId && f.ArchivoId == archivoId)
                .AnyAsync();
    }
}