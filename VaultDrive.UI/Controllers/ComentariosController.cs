using Microsoft.AspNetCore.Mvc;
using VaultDrive.Abstracciones.DTOs;
using VaultDrive.LogicaDeNegocio.Servicios;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComentariosController : ControllerBase
    {
        private readonly ComentarioService _comentarioService;

        public ComentariosController(ComentarioService comentarioService)
        {
            _comentarioService = comentarioService;
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CrearComentarioDto dto)
        {
            try
            {
                var comentario = await _comentarioService.CrearComentarioAsync(dto);
                return Ok(new { success = true, data = comentario });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, mensaje = ex.Message });
            }
        }

        [HttpGet("{archivoId}")]
        public async Task<IActionResult> ObtenerPorArchivo(Guid archivoId)
        {
            var comentarios = await _comentarioService.ObtenerPorArchivoAsync(archivoId);
            return Ok(new { success = true, data = comentarios });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarComentarioDto dto)
        {
            try
            {
                var actualizado = await _comentarioService.ActualizarComentarioAsync(id, dto.Comentario);
                if (!actualizado)
                    return NotFound(new { success = false, mensaje = "Comentario no encontrado" });

                return Ok(new { success = true, mensaje = "Comentario actualizado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, mensaje = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(Guid id)
        {
            var eliminado = await _comentarioService.EliminarComentarioAsync(id);
            if (!eliminado)
                return NotFound(new { success = false, mensaje = "Comentario no encontrado" });

            return Ok(new { success = true, mensaje = "Comentario eliminado correctamente" });
        }
    }
}