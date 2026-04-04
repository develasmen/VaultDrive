using Microsoft.AspNetCore.Mvc;
using VaultDrive.Abstracciones.DTOs;
using VaultDrive.LogicaDeNegocio.Servicios;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritosController : ControllerBase
    {
        private readonly FavoritosService _favoritosService;

        public FavoritosController(FavoritosService favoritosService)
        {
            _favoritosService = favoritosService;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar([FromBody] CrearFavoritoDto dto)
        {
            try
            {
                var favorito = await _favoritosService.AgregarFavoritoAsync(dto);
                return Ok(new { success = true, data = favorito });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, mensaje = ex.Message });
            }
        }

        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> ObtenerPorUsuario(Guid usuarioId)
        {
            var favoritos = await _favoritosService.ObtenerFavoritosAsync(usuarioId);
            return Ok(new { success = true, data = favoritos });
        }

        [HttpDelete]
        public async Task<IActionResult> Eliminar([FromBody] CrearFavoritoDto dto)
        {
            var eliminado = await _favoritosService.EliminarFavoritoAsync(dto.UsuarioId, dto.ArchivoId);
            if (!eliminado)
                return NotFound(new { success = false, mensaje = "Favorito no encontrado" });

            return Ok(new { success = true, mensaje = "Eliminado de favoritos" });
        }
    }
}