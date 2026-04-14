using Microsoft.AspNetCore.Mvc;
using VaultDrive.Abstracciones.DTOs;
using VaultDrive.LogicaDeNegocio.Servicios;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VersionArchivoController : ControllerBase
    {
        private readonly VersionArchivoService _service;

        public VersionArchivoController(VersionArchivoService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CrearVersionArchivoDto dto)
        {
            var resultado = await _service.Crear(dto);
            return Ok(new { success = true, data = resultado });
        }

        [HttpGet("historial/{archivoId}")]
        public async Task<IActionResult> ObtenerHistorial(Guid archivoId)
        {
            var versiones = await _service.ObtenerHistorial(archivoId);
            return Ok(new { success = true, data = versiones });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(Guid id)
        {
            var version = await _service.ObtenerPorId(id);
            if (version == null)
                return NotFound(new { success = false, mensaje = "Versión no encontrada" });

            return Ok(new { success = true, data = version });
        }
    }
}
