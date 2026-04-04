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
    }
}