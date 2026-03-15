using Microsoft.AspNetCore.Identity;
using AspNetCore.Identity.MongoDbCore.Infrastructure;
using AspNetCore.Identity.MongoDbCore.Extensions;
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;
using VaultDrive.LogicaDeNegocio.Servicios;
using AspNetCore.Identity.MongoDbCore.Models;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Conexión a MongoDB
builder.Services.AddSingleton<MongoDbContext>();

// Configuración de Identity con MongoDB
var mongoDbIdentityConfig = new MongoDbIdentityConfiguration
{
    MongoDbSettings = new MongoDbSettings
    {
        ConnectionString = builder.Configuration.GetConnectionString("MongoDb"),
        DatabaseName = builder.Configuration["MongoDbSettings:DatabaseName"]
    },
    IdentityOptionsAction = options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;

        options.User.RequireUniqueEmail = true;
    }
};

builder.Services.ConfigureMongoDbIdentity<ApplicationUser, ApplicationRole, Guid>(mongoDbIdentityConfig)
    .AddUserManager<UserManager<ApplicationUser>>()
    .AddSignInManager<SignInManager<ApplicationUser>>()
    .AddRoleManager<RoleManager<ApplicationRole>>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
    options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
}).AddCookie(IdentityConstants.ApplicationScheme);

builder.Services.AddControllers();
builder.Services.AddScoped<AuthService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("ReactApp");
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed de roles
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

    string[] roles = { "Admin", "Usuario" };

    foreach (var rol in roles)
    {
        if (!await roleManager.RoleExistsAsync(rol))
            await roleManager.CreateAsync(new ApplicationRole { Name = rol });
    }
}

// Creamos las colleciones automaticamente si no existen
var mongoContext = app.Services.GetRequiredService<MongoDbContext>();

var colecciones = new[]
{
    "Carpeta", "Archivo", "ArchivoPersonalizado", "ConfiguracionUsuario",
    "Etiqueta", "ArchivoEtiqueta", "RegistroActividad", "Favoritos",
    "Comentarios", "Notificaciones", "VersionArchivo"
};

var coleccionesExistentes = await mongoContext
    .GetCollection<object>("system.namespaces")
    .Database
    .ListCollectionNamesAsync();

var nombresExistentes = await coleccionesExistentes.ToListAsync();

foreach (var coleccion in colecciones)
{
    if (!nombresExistentes.Contains(coleccion))
    {
        await mongoContext
            .GetCollection<object>(coleccion)
            .Database
            .CreateCollectionAsync(coleccion);
    }
}

app.Run();