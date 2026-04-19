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
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly AuthService _authService;

        public ArchivoController(ArchivoService service, IWebHostEnvironment webHostEnvironment, AuthService authService)
        {
            _service = service;
            _webHostEnvironment = webHostEnvironment; // Solucion para no hardcodear la ruta de almacenamiento en el proyecto 
            _authService = authService;
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
            try
            {
                var archivo = await _service.GetById(id);
                if (archivo == null)
                    return NotFound(new { success = false, mensaje = "Archivo no encontrado" });

                // Eliminar archivo físico del servidor
                var rutaFisica = Path.Combine(_webHostEnvironment.WebRootPath, archivo.RutaArchivo.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(rutaFisica))
                    System.IO.File.Delete(rutaFisica);

                // Eliminar registro en MongoDB
                var exito = await _service.Eliminar(id);
                if (!exito)
                    return NotFound(new { success = false, mensaje = "Archivo no encontrado" });

                // Liberar espacio del usuario
                await _authService.LiberarEspacio(archivo.UsuarioId, archivo.Tamaño);

                return Ok(new { success = true, mensaje = "Archivo eliminado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Error al eliminar el archivo", detalle = ex.Message });
            }
        }



        [HttpPost("subir")]
        public async Task<IActionResult> SubirArchivo(
            [FromQuery] Guid usuarioId,
            [FromQuery] Guid carpetaId,
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, mensaje = "No se proporcionó ningún archivo" });

                if (usuarioId == Guid.Empty)
                    return BadRequest(new { success = false, mensaje = "El usuarioId es requerido" });

                if (carpetaId == Guid.Empty)
                    return BadRequest(new { success = false, mensaje = "El carpetaId es requerido" });

                // Se valida/actualiza el espacio antes de subir el archivo 
                await _authService.ActualizarEspacioOcupado(usuarioId, file.Length);


                var uploadPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", usuarioId.ToString(), carpetaId.ToString());
                Directory.CreateDirectory(uploadPath);

                var nombreArchivo = $"{Guid.NewGuid()}_{file.FileName}";
                var rutaCompleta = Path.Combine(uploadPath, nombreArchivo);

                using (var stream = new FileStream(rutaCompleta, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var rutaWeb = $"/uploads/{usuarioId}/{nombreArchivo}";

                var dto = new CrearArchivoDto
                {
                    UsuarioId = usuarioId,
                    CarpetaId = carpetaId,
                    Nombre = file.FileName,
                    TipoArchivo = file.ContentType,
                    Tamaño = file.Length,
                    RutaArchivo = rutaWeb
                };

                var resultado = await _service.Crear(dto);
                return Ok(new { success = true, data = resultado, mensaje = "Archivo subido correctamente" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Error al subir el archivo", detalle = ex.Message });
            }
        }
    }
}
