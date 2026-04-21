import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, registro } from '../lib/api'
import { saveSession } from '../lib/session'

const INITIAL_FORM = {
  nombre: '',
  correo: '',
  contrasena: '',
}

export function AuthPage({ mode, onAuthenticated }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isRegister = mode === 'register'

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (isRegister) {
        await registro({
          nombre: form.nombre,
          correo: form.correo,
          contrasena: form.contrasena,
        })
        setSuccess('Cuenta creada. Ahora puedes iniciar sesion.')
        setTimeout(() => navigate('/login'), 700)
      } else {
        const response = await login({
          correo: form.correo,
          contrasena: form.contrasena,
        })

        const sessionUser = {
          id: response.id,
          nombre: response.nombre,
          correo: response.correo,
        }

        saveSession(sessionUser)
        onAuthenticated?.(sessionUser)

        navigate('/app')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-8">
      <section className="glass-card fade-up grid w-full overflow-hidden rounded-3xl md:grid-cols-[1.2fr_1fr]">
        <article className="relative hidden min-h-[420px] flex-col justify-between bg-[linear-gradient(150deg,#0f7a52,#0b5e40)] p-8 text-white md:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">VaultDrive</p>
            <h1 className="title-font mt-3 text-4xl font-semibold leading-tight">
              Tus archivos seguros, organizados y listos para colaborar.
            </h1>
          </div>

          <p className="max-w-md text-sm text-emerald-100/90">
            Gestiona carpetas, etiquetas y favoritos con una experiencia fluida.
          </p>

          <span className="absolute -right-14 -top-12 h-40 w-40 rounded-full bg-[var(--accent)]/40 blur-2xl" />
          <span className="absolute -bottom-14 left-14 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        </article>

        <article className="bg-[var(--paper)] p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {isRegister ? 'Crear cuenta' : 'Bienvenido de nuevo'}
          </p>
          <h2 className="title-font mt-1 text-3xl font-semibold text-[var(--ink)]">
            {isRegister ? 'Registro de usuario' : 'Iniciar sesion'}
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isRegister && (
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-[var(--ink-soft)]">Nombre</span>
                <input
                  name="nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  placeholder="Tu nombre"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[var(--ink-soft)]">Correo</span>
              <input
                name="correo"
                type="email"
                required
                value={form.correo}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                placeholder="correo@dominio.com"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[var(--ink-soft)]">Contrasena</span>
              <input
                name="contrasena"
                type="password"
                required
                minLength={6}
                value={form.contrasena}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                placeholder="Minimo 6 caracteres"
              />
            </label>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            {success && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>

          <p className="mt-5 text-sm text-[var(--ink-soft)]">
            {isRegister ? 'Ya tienes cuenta?' : 'Aun no tienes cuenta?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="font-semibold text-[var(--brand)] hover:underline">
              {isRegister ? 'Inicia sesion' : 'Registrate'}
            </Link>
          </p>
        </article>
      </section>
    </main>
  )
}
