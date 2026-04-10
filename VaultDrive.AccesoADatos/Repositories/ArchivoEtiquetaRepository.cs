using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class ArchivoEtiquetaRepository : IArchivoEtiquetaRepository
    {
        private readonly IMongoCollection<ArchivoEtiqueta> _collection;

        public ArchivoEtiquetaRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<ArchivoEtiqueta>("ArchivoEtiqueta");
        }

        public async Task Crear(ArchivoEtiqueta archivoEtiqueta)
            => await _collection.InsertOneAsync(archivoEtiqueta);

        public async Task<List<ArchivoEtiqueta>> ObtenerPorArchivo(Guid archivoId)
            => await _collection.Find(ae => ae.ArchivoId == archivoId).ToListAsync();

        public async Task<List<ArchivoEtiqueta>> ObtenerPorEtiqueta(Guid etiquetaId)
            => await _collection.Find(ae => ae.EtiquetaId == etiquetaId).ToListAsync();

        public async Task<bool> Eliminar(Guid archivoId, Guid etiquetaId)
        {
            var resultado = await _collection.DeleteOneAsync(
                ae => ae.ArchivoId == archivoId && ae.EtiquetaId == etiquetaId);
            return resultado.DeletedCount > 0;
        }

        public async Task<bool> Existe(Guid archivoId, Guid etiquetaId)
            => await _collection.Find(
                ae => ae.ArchivoId == archivoId && ae.EtiquetaId == etiquetaId)
                .AnyAsync();
    }
}
