using Microsoft.AspNetCore.Mvc;
using VaultDrive.LogicaDeNegocio.Servicios;
using VaultDrive.Abstracciones.DTOs;

namespace VaultDrive.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("registro")]
        public async Task<IActionResult> Registro([FromBody] RegistroDto dto)
        {
            var resultado = await _authService.RegistrarUsuario(dto.Nombre, dto.Correo, dto.Contrasena);

            if (resultado.Succeeded)
                return Ok(new { mensaje = "Usuario registrado correctamente" });

            if (resultado.Errors.Any(e => e.Code == "DuplicateEmail"))
                return BadRequest(new { mensaje = "El correo ya está registrado" });

            return BadRequest(new { mensaje = "Error al registrar el usuario" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var resultado = await _authService.IniciarSesion(dto.Correo, dto.Contrasena);

            if (resultado.Succeeded)
            {
                var usuario = await _authService.ObtenerUsuarioPorCorreo(dto.Correo);
                return Ok(new 
                { 
                    mensaje = "Login exitoso",
                    id = usuario.Id,
                    nombre = usuario.Nombre,
                    correo = usuario.Email
                });
            }

            return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _authService.CerrarSesion();
            return Ok(new { mensaje = "Sesión cerrada" });
        }
    }
}