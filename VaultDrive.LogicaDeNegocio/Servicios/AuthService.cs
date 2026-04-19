using Microsoft.AspNetCore.Identity;
using VaultDrive.Abstracciones.Modelos;

namespace VaultDrive.LogicaDeNegocio.Servicios
{
    public class AuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthService(UserManager<ApplicationUser> userManager,
                           SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<IdentityResult> RegistrarUsuario(string nombre, string correo, string contrasena)
        {
            var user = new ApplicationUser
            {
                UserName = correo,
                Email = correo,
                Nombre = nombre,
                EspacioTotal = 50000,
                EspacioOcupado = 0
            };

            var resultado = await _userManager.CreateAsync(user, contrasena);

            if (resultado.Succeeded)
                await _userManager.AddToRoleAsync(user, "Usuario");

            return resultado;
        }

        public async Task<SignInResult> IniciarSesion(string correo, string contrasena)
        {
            return await _signInManager.PasswordSignInAsync(correo, contrasena, false, false);
        }

        public async Task CerrarSesion()
        {
            await _signInManager.SignOutAsync();
        }

        public async Task<ApplicationUser?> ObtenerUsuarioPorCorreo(string correo)
        {
            return await _userManager.FindByEmailAsync(correo);
        }




        public async Task<bool> ActualizarEspacioOcupado(Guid usuarioId, long bytesAgregados)
        {
            var usuario = await _userManager.FindByIdAsync(usuarioId.ToString());
            if (usuario == null) return false;

            var mbAgregados = bytesAgregados / (1024.0 * 1024.0);
            usuario.EspacioOcupado += (long)Math.Ceiling(mbAgregados);

            if (usuario.EspacioOcupado > usuario.EspacioTotal)
                throw new InvalidOperationException("No hay espacio suficiente disponible");

            await _userManager.UpdateAsync(usuario);
            return true;
        }

        public async Task<bool> LiberarEspacio(Guid usuarioId, long bytesLiberados)
        {
            var usuario = await _userManager.FindByIdAsync(usuarioId.ToString());
            if (usuario == null) return false;

            var mbLiberados = bytesLiberados / (1024.0 * 1024.0);
            usuario.EspacioOcupado -= (long)Math.Ceiling(mbLiberados);

            if (usuario.EspacioOcupado < 0)
                usuario.EspacioOcupado = 0;

            await _userManager.UpdateAsync(usuario);
            return true;
        }
    }
}