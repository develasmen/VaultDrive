using Microsoft.AspNetCore.Mvc;
using VaultDrive.Abstracciones.DTOs;
using VaultDrive.LogicaDeNegocio.Servicios;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArchivoController : ControllerBase
    {
        private readonly ArchivoService _service;

        public ArchivoController(ArchivoService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CrearArchivoDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Nombre))
                    return BadRequest(new { success = false, mensaje = "El nombre del archivo es requerido" });

                if (string.IsNullOrWhiteSpace(dto.RutaArchivo))
                    return BadRequest(new { success = false, mensaje = "La ruta del archivo es requerida" });

                if (dto.UsuarioId == Guid.Empty)
                    return BadRequest(new { success = false, mensaje = "El UsuarioId es requerido" });

                if (dto.CarpetaId == Guid.Empty)
                    return BadRequest(new { success = false, mensaje = "El CarpetaId es requerido" });

                var resultado = await _service.Crear(dto);
                return CreatedAtAction(nameof(GetById), new { id = resultado.Id },
                    new { success = true, data = resultado, mensaje = "Archivo creado exitosamente con versión inicial" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Error interno al crear el archivo", detalle = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var resultado = await _service.GetById(id);
            if (resultado == null)
                return NotFound(new { success = false, mensaje = "Archivo no encontrado" });

            return Ok(new { success = true, data = resultado });
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> GetByUsuarioId(Guid usuarioId)
        {
            var resultado = await _service.GetByUsuarioId(usuarioId);
            return Ok(new { success = true, data = resultado, total = resultado.Count });
        }

        [HttpGet("carpeta/{carpetaId}")]
        public async Task<IActionResult> GetByCarpetaId(Guid carpetaId)
        {
            var resultado = await _service.GetByCarpetaId(carpetaId);
            return Ok(new { success = true, data = resultado, total = resultado.Count });
        }

        [HttpPut]
        public async Task<IActionResult> Actualizar([FromBody] ActualizarArchivoDto dto)
        {
            if (dto.Id == Guid.Empty)
                return BadRequest(new { success = false, mensaje = "El Id del archivo es requerido" });

            if (dto.UsuarioId == Guid.Empty)
                return BadRequest(new { success = false, mensaje = "El UsuarioId es requerido para registrar la versión" });

            var exito = await _service.Actualizar(dto);
            if (!exito)
                return NotFound(new { success = false, mensaje = "Archivo no encontrado" });

            return Ok(new { success = true, mensaje = "Archivo actualizado y nueva versión registrada en el historial" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(Guid id)
        {
            var exito = await _service.Eliminar(id);
            if (!exito)
                return NotFound(new { success = false, mensaje = "Archivo no encontrado" });

            return Ok(new { success = true, mensaje = "Archivo eliminado correctamente" });
        }
    }
}
