using Microsoft.AspNetCore.Mvc;
using VaultDrive.Abstracciones.DTOs;
using VaultDrive.LogicaDeNegocio.Servicios;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegistroActividadController : ControllerBase
    {
        private readonly RegistroActividadService _registroService;

        public RegistroActividadController(RegistroActividadService registroService)
        {
            _registroService = registroService;
        }

        [HttpPost]
        public async Task<IActionResult> Registrar([FromBody] CrearRegistroActividadDto dto)
        {
            await _registroService.RegistrarAsync(dto.UsuarioId, dto.Accion, dto.ArchivoId, dto.CarpetaId);
            return Ok(new { success = true, mensaje = "Actividad registrada" });
        }

        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> ObtenerPorUsuario(Guid usuarioId)
        {
            var registros = await _registroService.ObtenerPorUsuarioAsync(usuarioId);
            return Ok(new { success = true, data = registros });
        }
    }
}