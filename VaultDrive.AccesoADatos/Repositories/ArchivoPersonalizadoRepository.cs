using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class ArchivoPersonalizadoRepository : IArchivoPersonalizadoRepository
    {
        private readonly IMongoCollection<ArchivoPersonalizado> _collection;

        public ArchivoPersonalizadoRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<ArchivoPersonalizado>("ArchivoPersonalizado");
        }

        public async Task Crear(ArchivoPersonalizado archivo) =>
            await _collection.InsertOneAsync(archivo);

        public async Task<ArchivoPersonalizado> GetById(Guid id) =>
            await _collection.Find(a => a.Id == id).FirstOrDefaultAsync();

        public async Task<ArchivoPersonalizado> GetByArchivoId(Guid archivoId) =>
            await _collection.Find(a => a.ArchivoId == archivoId).FirstOrDefaultAsync();

        public async Task<List<ArchivoPersonalizado>> GetByUsuarioArchivos(List<Guid> archivoIds) =>
            await _collection.Find(a => archivoIds.Contains(a.ArchivoId)).ToListAsync();

        public async Task<bool> Actualizar(ArchivoPersonalizado archivo)
        {
            var resultado = await _collection.ReplaceOneAsync(a => a.Id == archivo.Id, archivo);
            return resultado.ModifiedCount > 0;
        }

        public async Task<bool> Eliminar(Guid id)
        {
            var resultado = await _collection.DeleteOneAsync(a => a.Id == id);
            return resultado.DeletedCount > 0;
        }
    }
}
