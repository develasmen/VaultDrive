using AspNetCore.Identity.MongoDbCore.Extensions;
using AspNetCore.Identity.MongoDbCore.Infrastructure;
using AspNetCore.Identity.MongoDbCore.Models;
using Microsoft.AspNetCore.Identity;
using MongoDB.Driver;
using MongoDB.Bson;
// Namespaces de el proyecto 
using VaultDrive.Abstracciones.Modelos;
using VaultDrive.AccesoADatos.Contexto;
using VaultDrive.LogicaDeNegocio.Servicios;
using VaultDrive.Abstracciones.Repositories;

var builder = WebApplication.CreateBuilder(args);

// --- 1. REGISTRO DE SERVICIOS (Inyección de Dependencias) ---
// Registramos el contexto como Singleton y los repositorios/servicios como Scoped
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<ICarpetaRepository, CarpetaRepository>();
builder.Services.AddScoped<CarpetaService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IComentarioRepository, ComentarioRepository>();
builder.Services.AddScoped<ComentarioService>();
builder.Services.AddScoped<IFavoritosRepository, FavoritosRepository>();
builder.Services.AddScoped<FavoritosService>();

// --- 2. CONFIGURACIÓN DE CORS ---
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

// --- 3. IDENTITY CON MONGODB ---
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

// --- 4. SWAGGER ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- 5. MIDDLEWARES Y PIPELINE ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "VaultDrive API V1");
    });
}
else
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

// --- 6. SEED DE ROLES ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
        string[] roles = { "Admin", "Usuario" };

        foreach (var rol in roles)
        {
            if (!await roleManager.RoleExistsAsync(rol))
                await roleManager.CreateAsync(new ApplicationRole { Name = rol });
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error al crear los roles iniciales.");
    }
}

// --- 7. INICIALIZACIÓN DE COLECCIONES ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var mongoContext = services.GetRequiredService<MongoDbContext>();
    
    var colecciones = new[]
    {
        "Carpeta", "Archivo", "ArchivoPersonalizado", "ConfiguracionUsuario",
        "Etiqueta", "ArchivoEtiqueta", "RegistroActividad", "Favoritos",
        "Comentarios", "Notificaciones", "VersionArchivo"
    };

    try 
    {
        
        var database = mongoContext.GetCollection<BsonDocument>("Carpeta").Database;
        var cursor = await database.ListCollectionNamesAsync();
        var nombresExistentes = await cursor.ToListAsync();

        foreach (var coleccion in colecciones)
        {
            if (!nombresExistentes.Contains(coleccion))
            {
                await database.CreateCollectionAsync(coleccion);
            }
        }
    }
    catch (Exception ex) 
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogWarning($"Aviso: No se pudieron validar/crear las colecciones: {ex.Message}");
    }
}

app.Run();