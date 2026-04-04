using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class RegistroActividadRepository : IRegistroActividadRepository
    {
        private readonly IMongoCollection<RegistroActividad> _collection;

        public RegistroActividadRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<RegistroActividad>("RegistroActividad");
        }

        public async Task Crear(RegistroActividad registro)
            => await _collection.InsertOneAsync(registro);

        public async Task<List<RegistroActividad>> ObtenerPorUsuario(Guid usuarioId)
            => await _collection
                .Find(r => r.UsuarioId == usuarioId)
                .SortByDescending(r => r.Fecha)
                .ToListAsync();
    }
}