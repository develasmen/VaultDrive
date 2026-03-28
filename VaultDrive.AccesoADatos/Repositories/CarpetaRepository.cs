using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class CarpetaRepository : ICarpetaRepository
    {
        private readonly IMongoCollection<Carpeta> _collection;

        public CarpetaRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<Carpeta>("Carpeta");
        }

        public async Task Crear(Carpeta carpeta) => await _collection.InsertOneAsync(carpeta);

        public async Task<List<Carpeta>> GetByUser(Guid usuarioId) => 
            await _collection.Find(c => c.UsuarioId == usuarioId).ToListAsync();

        public async Task<Carpeta> GetById(Guid id) => 
            await _collection.Find(c => c.Id == id).FirstOrDefaultAsync();

        public async Task<bool> Actualizar(Carpeta carpeta)
        {
            var resultado = await _collection.ReplaceOneAsync(c => c.Id == carpeta.Id, carpeta);
            return resultado.ModifiedCount > 0;
        }

        public async Task<bool> Eliminar(Guid id)
        {
            var resultado = await _collection.DeleteOneAsync(c => c.Id == id);
            return resultado.DeletedCount > 0;
        }
    }
}