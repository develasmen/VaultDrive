using Microsoft.AspNetCore.Mvc;
using VaultDrive.LogicaDeNegocio.Servicios;
using VaultDrive.Abstracciones.DTOs;
using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/carpetas")] // importante para el frontend(Dilan)
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
            var carpeta = await _carpetaService.Crear(dto.UsuarioId, dto.Nombre, dto.PortadaImg, dto.CarpetaPadre);
            return Ok(carpeta);
        }

        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> GetByUser(Guid usuarioId) => Ok(await _carpetaService.GetByUser(usuarioId));

        [HttpPut("actualizar")]
        public async Task<IActionResult> Actualizar([FromBody] ActualizarCarpetaDto dto)
        {
            var exito = await _carpetaService.Actualizar(dto);
            return exito ? Ok(new { mensaje = "Carpeta actualizada" }) : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(Guid id)
        {
            var exito = await _carpetaService.Eliminar(id);
            return exito ? Ok(new { mensaje = "Carpeta eliminada" }) : NotFound();
        }
    }
}