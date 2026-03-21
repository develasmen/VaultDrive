using Microsoft.AspNetCore.Mvc;
using VaultDrive.LogicaDeNegocio.Servicios;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/carpetas")]
    public class CarpetaController : ControllerBase
    {
        private readonly CarpetaService _carpetaService;

        public CarpetaController(CarpetaService carpetaService)
        {
            _carpetaService = carpetaService;
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CrearCarpetaDto dto)
        {
            var carpeta = await _carpetaService.Crear(dto.UsuarioId, dto.Nombre, dto.CarpetaPadre);
            return Ok(carpeta);

        }
        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> GetByUser(Guid usuarioId)
        {
            var carpetas = await _carpetaService.GetByUser(usuarioId);
            return Ok(carpetas);
        }
    }
}