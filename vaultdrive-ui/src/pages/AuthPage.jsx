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
        setSuccess('Cuenta creada. Redirigiendo...')
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
    <div className="auth-bg">
      <div className="w-full max-w-sm fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="logo-mark mb-3" style={{ width: 44, height: 40 }} aria-hidden="true">
            <span className="logo-mark__layer logo-mark__layer--bottom" style={{ width: 40, height: 20, borderRadius: 8 }} />
            <span className="logo-mark__layer logo-mark__layer--top" style={{ width: 40, height: 20, borderRadius: 8 }} />
          </div>
          <h1 className="title-font text-2xl font-semibold text-(--ink) tracking-tight">VaultDrive</h1>
          <p className="mt-1 text-sm text-(--ink-soft)">Tu espacio de archivos seguro</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-lg font-semibold text-(--ink) mb-1">
            {isRegister ? 'Crear cuenta' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-sm text-(--ink-soft) mb-6">
            {isRegister
              ? 'Completa los datos para registrarte'
              : 'Ingresa tus credenciales para continuar'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[13px] font-medium text-(--ink-soft) mb-1.5">
                  Nombre
                </label>
                <input
                  name="nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  className="field"
                  placeholder="Tu nombre completo"
                />
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium text-(--ink-soft) mb-1.5">
                Correo electronico
              </label>
              <input
                name="correo"
                type="email"
                required
                value={form.correo}
                onChange={handleChange}
                className="field"
                placeholder="correo@dominio.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--ink-soft) mb-1.5">
                Contrasena
              </label>
              <input
                name="contrasena"
                type="password"
                required
                minLength={6}
                value={form.contrasena}
                onChange={handleChange}
                className="field"
                placeholder="Minimo 6 caracteres"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-(--danger-light) bg-(--danger-light) px-3 py-2.5 text-sm text-(--danger-text)">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-(--brand-light) bg-(--brand-light) px-3 py-2.5 text-sm text-(--brand-text)">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--brand-strong) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesion'}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="mt-4 text-center text-sm text-(--ink-soft)">
          {isRegister ? 'Ya tienes cuenta? ' : 'No tienes cuenta? '}
          <Link
            to={isRegister ? '/login' : '/register'}
            className="font-semibold text-(--brand) hover:text-(--brand-strong) transition-colors"
          >
            {isRegister ? 'Inicia sesion' : 'Registrate'}
          </Link>
        </p>
      </div>
    </div>
  )
}
