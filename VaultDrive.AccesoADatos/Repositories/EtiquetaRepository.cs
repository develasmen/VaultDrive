using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class EtiquetaRepository : IEtiquetaRepository
    {
        private readonly IMongoCollection<Etiqueta> _collection;

        public EtiquetaRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<Etiqueta>("Etiqueta");
        }

        public async Task Crear(Etiqueta etiqueta)
            => await _collection.InsertOneAsync(etiqueta);

        public async Task<List<Etiqueta>> ObtenerPorUsuario(Guid usuarioId)
            => await _collection.Find(e => e.UsuarioId == usuarioId).ToListAsync();

        public async Task<Etiqueta> ObtenerPorId(Guid id)
            => await _collection.Find(e => e.Id == id).FirstOrDefaultAsync();

        public async Task<bool> Actualizar(Etiqueta etiqueta)
        {
            var resultado = await _collection.ReplaceOneAsync(e => e.Id == etiqueta.Id, etiqueta);
            return resultado.ModifiedCount > 0;
        }

        public async Task<bool> Eliminar(Guid id)
        {
            var resultado = await _collection.DeleteOneAsync(e => e.Id == id);
            return resultado.DeletedCount > 0;
        }
    }
}