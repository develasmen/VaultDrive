using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class VersionArchivoRepository : IVersionArchivoRepository
    {
        private readonly IMongoCollection<VersionArchivo> _collection;

        public VersionArchivoRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<VersionArchivo>("VersionArchivo");
        }

        public async Task Crear(VersionArchivo version) =>
            await _collection.InsertOneAsync(version);

        public async Task<List<VersionArchivo>> GetByArchivoId(Guid archivoId) =>
            await _collection.Find(v => v.ArchivoId == archivoId)
                .SortByDescending(v => v.VersionNumero)
                .ToListAsync();

        public async Task<VersionArchivo> GetById(Guid id) =>
            await _collection.Find(v => v.Id == id).FirstOrDefaultAsync();

        public async Task<int> ObtenerUltimoNumeroVersion(Guid archivoId)
        {
            var ultima = await _collection.Find(v => v.ArchivoId == archivoId)
                .SortByDescending(v => v.VersionNumero)
                .FirstOrDefaultAsync();
            return ultima?.VersionNumero ?? 0;
        }
    }
}
