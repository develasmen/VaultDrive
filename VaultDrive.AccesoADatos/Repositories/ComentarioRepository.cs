using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class ComentarioRepository : IComentarioRepository
    {
        private readonly IMongoCollection<Comentarios> _collection;

        public ComentarioRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<Comentarios>("Comentarios");
        }

        public async Task Crear(Comentarios comentario)
            => await _collection.InsertOneAsync(comentario);

        public async Task<List<Comentarios>> ObtenerPorArchivo(Guid archivoId)
            => await _collection
                .Find(c => c.ArchivoId == archivoId)
                .SortByDescending(c => c.Fecha)
                .ToListAsync();

        public async Task<bool> Eliminar(Guid id)
        {
            var resultado = await _collection.DeleteOneAsync(c => c.Id == id);
            return resultado.DeletedCount > 0;
        }
    }
}


