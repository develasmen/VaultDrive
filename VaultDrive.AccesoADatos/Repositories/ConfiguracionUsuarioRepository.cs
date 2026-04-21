using MongoDB.Driver;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;

namespace VaultDrive.Abstracciones.Repositories
{
    public class ConfiguracionUsuarioRepository : IConfiguracionUsuarioRepository
    {
        private readonly IMongoCollection<ConfiguracionUsuario> _collection;

        public ConfiguracionUsuarioRepository(MongoDbContext context)
        {
            _collection = context.GetCollection<ConfiguracionUsuario>("ConfiguracionUsuario");
        }

        public async Task<ConfiguracionUsuario?> ObtenerPorUsuario(Guid usuarioId)
            => await _collection.Find(c => c.UsuarioId == usuarioId).FirstOrDefaultAsync();

        public async Task Crear(ConfiguracionUsuario config)
            => await _collection.InsertOneAsync(config);

        public async Task<bool> Actualizar(ConfiguracionUsuario config)
        {
            var resultado = await _collection.ReplaceOneAsync(c => c.Id == config.Id, config);
            return resultado.ModifiedCount > 0;
        }
    }
}
