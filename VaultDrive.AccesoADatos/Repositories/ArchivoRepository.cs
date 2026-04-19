using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class ArchivoRepository : IArchivoRepository
    {
        private readonly IMongoCollection<Archivo> _collection;

        public ArchivoRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<Archivo>("Archivo");
        }

        public async Task Crear(Archivo archivo) =>
            await _collection.InsertOneAsync(archivo);

        public async Task<Archivo?> GetById(Guid id) =>
            await _collection.Find(a => a.Id == id).FirstOrDefaultAsync();

        public async Task<List<Archivo>> GetByUsuarioId(Guid usuarioId) =>
            await _collection.Find(a => a.UsuarioId == usuarioId)
                .SortByDescending(a => a.FechaSubida)
                .ToListAsync();

        public async Task<List<Archivo>> GetByCarpetaId(Guid carpetaId) =>
            await _collection.Find(a => a.CarpetaId == carpetaId)
                .SortByDescending(a => a.FechaSubida)
                .ToListAsync();

        public async Task<bool> Actualizar(Archivo archivo)
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
