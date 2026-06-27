import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { requestLogin2FA, requestRegister, verify2FACode } from '../services/api/auth';

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
      setError(err.message || 'Error al iniciar sesion');
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
      setError(err.message || 'Codigo de verificacion invalido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_22%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.65),transparent_55%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mx-auto mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-left backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.18)]">
              <img src="/Logo.png" alt="Agro Control" className="h-full w-full" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white">Agro Control</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-300">
                Smart Farm Platform
              </div>
            </div>
          </button>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/78 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                {view === 'login' && 'Inicio de sesion'}
                {view === 'register' && 'Registro'}
                {view === 'verify' && 'Verificacion'}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[34px]">
                {view === 'login' && 'Bienvenido de nuevo'}
                {view === 'register' && 'Crea tu cuenta'}
                {view === 'verify' && 'Verificacion de seguridad'}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {view === 'login' && 'Ingresa tus credenciales para continuar.'}
                {view === 'register' && 'Configura tu acceso para empezar a trabajar en la plataforma.'}
                {view === 'verify' && `Confirma el PIN enviado a ${email}.`}
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="group">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">
                      Correo electronico
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>

                  <div className="group">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">
                        Contrasena
                      </label>
                      <span className="text-xs text-slate-500">Recuperacion proximamente</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-semibold text-white shadow-[0_16px_34px_rgba(16,185,129,0.22)] transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    'Ingresar a la Plataforma'
                  )}
                </button>

                <p className="text-center text-sm text-slate-500">
                  ¿No tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('register')}
                    className="font-medium text-emerald-300 transition-colors hover:text-emerald-200"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </form>
            )}

            {view === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="group">
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">
                        Nombre
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="Juan Perez"
                      />
                    </div>

                    <div className="group">
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">
                        Organizacion
                      </label>
                      <input
                        type="text"
                        required
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="Finca La Esperanza"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">
                      Correo electronico
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="juan@agrocontrol.io"
                    />
                  </div>

                  <div className="group">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-focus-within:text-emerald-300">
                        Contrasena
                      </label>
                      <span className="text-xs text-slate-500">Minimo 6 caracteres</span>
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="Define una contrasena segura"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-semibold text-white shadow-[0_16px_34px_rgba(16,185,129,0.22)] transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>

                <p className="text-center text-sm text-slate-500">
                  ¿Ya tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="font-medium text-emerald-300 transition-colors hover:text-emerald-200"
                  >
                    Inicia sesión
                  </button>
                </p>
              </form>
            )}

            {view === 'verify' && (
              <form onSubmit={handleVerifySubmit} className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                    <i className="fas fa-envelope-open-text text-lg" />
                  </div>

                  <div className="mx-auto mb-6 max-w-sm text-sm leading-6 text-slate-400">
                    Introduce el codigo de 6 digitos enviado a <span className="font-medium text-slate-200">{email}</span>.
                  </div>

                  <div className="mb-6">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-5 text-center font-mono text-3xl font-bold tracking-[0.5em] text-emerald-300 outline-none transition placeholder:text-slate-600 focus:border-emerald-400/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="000000"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-semibold text-white shadow-[0_16px_34px_rgba(16,185,129,0.22)] transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
                  >
                    {loading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      'Verificar y Acceder'
                    )}
                  </button>
                </div>

                <div className="text-center">
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
      </div>
    </div>
  );
};
