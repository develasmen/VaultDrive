using Microsoft.AspNetCore.Mvc;
using VaultDrive.Abstracciones.DTOs;
using VaultDrive.LogicaDeNegocio.Servicios;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArchivoPersonalizadoController : ControllerBase
    {
        private readonly ArchivoPersonalizadoService _service;

        public ArchivoPersonalizadoController(ArchivoPersonalizadoService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CrearArchivoPersonalizadoDto dto)
        {
            try
            {
                var resultado = await _service.Crear(dto);
                return Ok(new { success = true, data = resultado });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, mensaje = ex.Message });
            }
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> GetBulk([FromBody] List<Guid> archivoIds)
        {
            var resultado = await _service.GetByArchivoIds(archivoIds);
            return Ok(new { success = true, data = resultado });
        }

        [HttpGet("archivo/{archivoId}")]
        public async Task<IActionResult> GetByArchivoId(Guid archivoId)
        {
            var resultado = await _service.GetByArchivoId(archivoId);
            if (resultado == null)
                return NotFound(new { success = false, mensaje = "No se encontró personalización para este archivo" });

            return Ok(new { success = true, data = resultado });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var resultado = await _service.GetById(id);
            if (resultado == null)
                return NotFound(new { success = false, mensaje = "Personalización no encontrada" });

            return Ok(new { success = true, data = resultado });
        }

        [HttpPut]
        public async Task<IActionResult> Actualizar([FromBody] ActualizarArchivoPersonalizadoDto dto)
        {
            var exito = await _service.Actualizar(dto);
            if (!exito)
                return NotFound(new { success = false, mensaje = "Personalización no encontrada" });

            return Ok(new { success = true, mensaje = "Personalización actualizada y versión registrada" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(Guid id)
        {
            var exito = await _service.Eliminar(id);
            if (!exito)
                return NotFound(new { success = false, mensaje = "Personalización no encontrada" });

            return Ok(new { success = true, mensaje = "Personalización eliminada" });
        }
    }
}
