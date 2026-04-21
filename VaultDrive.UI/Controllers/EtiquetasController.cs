using Microsoft.AspNetCore.Mvc;
using VaultDrive.Abstracciones.DTOs;
using VaultDrive.LogicaDeNegocio.Servicios;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EtiquetasController : ControllerBase
    {
        private readonly EtiquetaService _etiquetaService;

        public EtiquetasController(EtiquetaService etiquetaService)
        {
            _etiquetaService = etiquetaService;
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CrearEtiquetaDto dto)
        {
            try
            {
                var etiqueta = await _etiquetaService.CrearEtiquetaAsync(dto);
                return Ok(new { success = true, data = etiqueta });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, mensaje = ex.Message });
            }
        }

        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> ObtenerPorUsuario(Guid usuarioId)
        {
            var etiquetas = await _etiquetaService.ObtenerEtiquetasAsync(usuarioId);
            return Ok(new { success = true, data = etiquetas });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarEtiquetaDto dto)
        {
            try
            {
                var actualizado = await _etiquetaService.ActualizarEtiquetaAsync(id, dto.NombreEtiqueta);
                if (!actualizado)
                    return NotFound(new { success = false, mensaje = "Etiqueta no encontrada" });

                return Ok(new { success = true, mensaje = "Etiqueta actualizada correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, mensaje = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(Guid id)
        {
            var eliminado = await _etiquetaService.EliminarEtiquetaAsync(id);
            if (!eliminado)
                return NotFound(new { success = false, mensaje = "Etiqueta no encontrada" });

            return Ok(new { success = true, mensaje = "Etiqueta eliminada correctamente" });
        }

        [HttpPost("asignar")]
        public async Task<IActionResult> Asignar([FromBody] AsignarEtiquetaDto dto)
        {
            try
            {
                var archivoEtiqueta = await _etiquetaService.AsignarEtiquetaAsync(dto);
                return Ok(new { success = true, data = archivoEtiqueta });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, mensaje = ex.Message });
            }
        }

        [HttpGet("archivo/{archivoId}")]
        public async Task<IActionResult> ObtenerEtiquetasDeArchivo(Guid archivoId)
        {
            var etiquetas = await _etiquetaService.ObtenerEtiquetasDeArchivoAsync(archivoId);
            return Ok(new { success = true, data = etiquetas });
        }

        [HttpDelete("quitar")]
        public async Task<IActionResult> Quitar([FromBody] AsignarEtiquetaDto dto)
        {
            var quitado = await _etiquetaService.QuitarEtiquetaAsync(dto.ArchivoId, dto.EtiquetaId);
            if (!quitado)
                return NotFound(new { success = false, mensaje = "Asignación no encontrada" });

            return Ok(new { success = true, mensaje = "Etiqueta quitada correctamente" });
        }
    }
}