
using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace WebApplicationAPP.Repositories
{
    public class CarpetaRepository : ICarpetaRepository
    {
        private readonly IMongoCollection<Carpeta> _collection;
        public CarpetaRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<Carpeta>();
        }

        public async Task Crear(Carpeta carpeta)
        {
            await _collection.InsertOneAsync(carpeta);
        }
        public async Task<List<Carpeta>> GetByUser(Guid usuarioId)
        {
            return await _collection.Find(c => c.UsuarioId == usuarioId).ToListAsync();

        }
        public async Task<Carpeta> GetById(Guid id)
        {
            return await _collection.Find(c => c.Id == id).FirstOrDefaultAsync();
        }
    }
}
