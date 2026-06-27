import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { requestLogin2FA, verify2FACode, requestRegister } from '../services/api/auth';

type AuthState = 'login' | 'register' | 'verify';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const from = location.state?.from?.pathname || '/app/dashboard';
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate]);

  const [view, setView] = useState<AuthState>('login');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const authHighlights = [
    { label: '24/7', description: 'Telemetria continua' },
    { label: 'IA', description: 'Diagnostico visual asistido' },
    { label: '2FA', description: 'Acceso con verificacion segura' },
  ];

  const authMetrics = [
    { value: '24', label: 'sensores en linea' },
    { value: '12 km', label: 'terreno monitoreado' },
    { value: '+4', label: 'modulos integrados' },
  ];

  const switchView = (nextView: AuthState) => {
    setError('');
    setLoading(false);

    if (nextView !== 'verify') {
      setCode('');
    }

    setView(nextView);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestLogin2FA(email, password);
      switchView('verify');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestRegister(name, org, email, password);
      switchView('verify');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await verify2FACode(email, code);
      if (data.success && data.user && data.token) {
        login(data.user, data.token);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Código de verificación inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.12),transparent_28%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-left backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                <img src="/Logo.png" alt="Agro Control" className="h-full w-full" />
              </div>
              <div>
                <div className="text-base font-extrabold tracking-tight text-white">Agro Control</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-300">
                  Smart Farm Platform
                </div>
              </div>
            </button>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-2 text-[11px] font-medium text-emerald-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.75)]" />
              Sistema activo
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-12 lg:mx-0 lg:py-0">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Acceso seguro para operacion en campo
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Gestiona tu operacion agricola con una entrada
              <span className="text-emerald-400"> clara, segura y profesional.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Accede al monitoreo IoT, diagnostico con IA y control operativo desde una interfaz alineada al nivel del producto.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {authHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 backdrop-blur"
                >
                  <span className="font-semibold text-white">{item.label}</span>
                  <span className="ml-2 text-slate-400">{item.description}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {authMetrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
                >
                  <div className="text-3xl font-black tracking-tight text-white">{item.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[22px] border border-white/10 bg-slate-950/40 p-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                    Flujo recomendado
                  </div>
                  <div className="mt-2 text-xl font-bold text-white">Autenticacion con doble verificacion</div>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  2FA habilitado
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  'Ingresa tus credenciales.',
                  'Valida el PIN enviado a tu correo.',
                  'Entra al panel con tu sesion protegida.',
                ].map((step, index) => (
                  <div key={step} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-sm font-semibold text-emerald-300">0{index + 1}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-8 lg:py-12">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-slate-950/65 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                  {view === 'login' && 'Inicio de sesion'}
                  {view === 'register' && 'Registro'}
                  {view === 'verify' && 'Verificacion'}
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {view === 'login' && 'Bienvenido de nuevo'}
                  {view === 'register' && 'Crea tu cuenta'}
                  {view === 'verify' && 'Verificacion de seguridad'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {view === 'login' && 'Accede a tu panel operativo con credenciales seguras y continuidad visual del sistema.'}
                  {view === 'register' && 'Configura tu cuenta para centralizar sensores, parcelas e inteligencia operativa.'}
                  {view === 'verify' && `Ingresamos al paso final. Confirma el PIN enviado a ${email}.`}
                </p>
              </div>

              <div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-slate-300 sm:flex">
                <i className="fas fa-shield-alt text-lg text-emerald-300" />
              </div>
            </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="relative">
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-4 rounded-[22px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="group">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">Correo electronico</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>
                  <div className="group">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">Contrasena</label>
                      <span className="text-xs text-slate-500">Recuperacion disponible proximamente</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-semibold text-white shadow-[0_16px_36px_rgba(16,185,129,0.28)] transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Ingresar a la Plataforma'
                  )}
                </button>

                <p className="mt-6 text-center text-sm text-slate-500">
                  ¿No tienes una cuenta?{' '}
                  <button type="button" onClick={() => switchView('register')} className="font-medium text-emerald-300 transition-colors hover:text-emerald-200">
                    Regístrate aquí
                  </button>
                </p>
              </form>
            )}

            {view === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="space-y-4 rounded-[22px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="group">
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">Nombre</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="Juan Perez"
                      />
                    </div>
                    <div className="group">
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">Finca u organizacion</label>
                      <input
                        type="text"
                        required
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="Finca La Esperanza"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">Correo electronico</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="juan@agrocontrol.io"
                    />
                  </div>

                  <div className="group">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">Contrasena</label>
                      <span className="text-xs text-slate-500">Minimo 6 caracteres</span>
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="Define una contrasena segura"
                    />
                  </div>

                  <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4 text-sm leading-6 text-slate-300">
                    Tu cuenta quedara pendiente hasta completar la verificacion por correo. Esto evita accesos y registros incompletos.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-semibold text-white shadow-[0_16px_36px_rgba(16,185,129,0.28)] transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>

                <p className="mt-6 text-center text-sm text-slate-500">
                  ¿Ya tienes una cuenta?{' '}
                  <button type="button" onClick={() => switchView('login')} className="font-medium text-emerald-300 transition-colors hover:text-emerald-200">
                    Inicia sesión
                  </button>
                </p>
              </form>
            )}

            {view === 'verify' && (
              <form onSubmit={handleVerifySubmit} className="space-y-6">
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-5 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                    <i className="fas fa-envelope-open-text text-xl" />
                  </div>

                  <div className="mx-auto mb-6 max-w-sm text-sm leading-6 text-slate-400">
                    Introduce el codigo de 6 digitos enviado a <span className="font-medium text-slate-200">{email}</span> para finalizar el acceso.
                  </div>

                  <div className="mb-6">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-5 text-center font-mono text-3xl font-bold tracking-[0.5em] text-emerald-300 outline-none transition placeholder:text-slate-600 focus:border-emerald-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="000000"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-semibold text-white shadow-[0_16px_36px_rgba(16,185,129,0.28)] transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Verificar y Acceder'
                    )}
                  </button>
                  <div className="mt-6 rounded-2xl border border-white/8 bg-slate-950/50 p-4 text-left">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Consejo</div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Si no ves el mensaje, revisa spam o promociones antes de volver a solicitar acceso.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 text-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => switchView('login')}
                    className="text-sm text-slate-500 transition-colors hover:text-white"
                  >
                    Volver e intentar con otro correo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        </section>
      </div>
    </div>
  );
};
