using Microsoft.AspNetCore.Mvc;
using VaultDrive.Abstracciones.DTOs;
using VaultDrive.LogicaDeNegocio.Servicios;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConfiguracionUsuarioController : ControllerBase
    {
        private readonly ConfiguracionUsuarioService _service;

        public ConfiguracionUsuarioController(ConfiguracionUsuarioService service)
        {
            _service = service;
        }

        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> GetByUsuario(Guid usuarioId)
        {
            var config = await _service.ObtenerOCrearAsync(usuarioId);
            return Ok(new { success = true, data = config });
        }

        [HttpPut("{usuarioId}")]
        public async Task<IActionResult> Actualizar(Guid usuarioId, [FromBody] ActualizarConfiguracionUsuarioDto dto)
        {
            var config = await _service.ActualizarAsync(usuarioId, dto);
            return Ok(new { success = true, data = config });
        }
    }
}
