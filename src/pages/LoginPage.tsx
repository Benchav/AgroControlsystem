import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { requestLogin2FA, verify2FACode, requestRegister } from '../services/api/auth';

type AuthState = 'login' | 'register' | 'verify';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || '/app/dashboard';

  const [view, setView] = useState<AuthState>('login');
  
  // Form state
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestLogin2FA(email, password);
      setView('verify');
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
      setView('verify');
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
    <div className="min-h-screen flex bg-gray-950 font-sans text-white overflow-hidden selection:bg-emerald-500/30">
      
      {/* Lado Izquierdo: Visual (Oculto en móviles muy pequeños) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden items-center justify-center p-12">
        {/* Gradientes abstractos de fondo */}
        <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] bg-emerald-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-500/20 rounded-full blur-[100px] mix-blend-screen"></div>
        
        {/* Patrón de malla (Grid) sutil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>

        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20 border border-white/10">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
            El futuro de tu <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
              campo conectado.
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Monitoreo IoT, diagnóstico visual con IA y gestión de parcelas en una plataforma única de alto rendimiento.
          </p>
          
          <div className="mt-12 flex items-center gap-4 text-sm text-gray-500 font-medium">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-xs">
                  A{i}
                </div>
              ))}
            </div>
            <p>Únete a +2,000 fincas innovadoras</p>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Formulario Glassmorphism */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Círculo sutil en el fondo para móviles */}
        <div className="lg:hidden absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]"></div>

        <div className="w-full max-w-md relative z-10 transition-all duration-500 ease-out">
          
          {/* Header del formulario */}
          <div className="mb-10 lg:text-left text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {view === 'login' && 'Bienvenido de nuevo'}
              {view === 'register' && 'Crea tu cuenta'}
              {view === 'verify' && 'Verificación de Seguridad'}
            </h2>
            <p className="text-gray-400">
              {view === 'login' && 'Ingresa tus credenciales para continuar.'}
              {view === 'register' && 'Comienza a gestionar tu campo inteligentemente.'}
              {view === 'verify' && `Hemos enviado un PIN a ${email}`}
            </p>
          </div>

          {/* Manejo de errores */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Vistas dinámicas */}
          <div className="relative">
            {/* LOGIN */}
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-400 transition-colors">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white placeholder-gray-600 transition-all outline-none"
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider group-focus-within:text-emerald-400 transition-colors">Contraseña</label>
                      <a href="#" className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">¿Olvidaste tu contraseña?</a>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white placeholder-gray-600 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Ingresar a la Plataforma'
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-8">
                  ¿No tienes una cuenta?{' '}
                  <button type="button" onClick={() => setView('register')} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Regístrate aquí
                  </button>
                </p>
              </form>
            )}

            {/* REGISTER */}
            {view === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-400 transition-colors">Nombre</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white placeholder-gray-600 transition-all outline-none"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-400 transition-colors">Finca / Org</label>
                    <input
                      type="text"
                      required
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white placeholder-gray-600 transition-all outline-none"
                      placeholder="La Esperanza"
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-400 transition-colors">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white placeholder-gray-600 transition-all outline-none"
                    placeholder="juan@agrocontrol.io"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-400 transition-colors">Contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white placeholder-gray-600 transition-all outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-8">
                  ¿Ya tienes una cuenta?{' '}
                  <button type="button" onClick={() => setView('login')} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Inicia sesión
                  </button>
                </p>
              </form>
            )}

            {/* VERIFY 2FA */}
            {view === 'verify' && (
              <form onSubmit={handleVerifySubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <div className="mb-8">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full max-w-[280px] mx-auto text-center tracking-[0.5em] text-3xl px-4 py-5 bg-gray-900/80 border-2 border-gray-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-400 placeholder-gray-700 transition-all outline-none font-mono font-bold shadow-inner"
                      placeholder="000000"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Verificar y Acceder'
                    )}
                  </button>
                  
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setView('login')}
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      Volver e intentar con otro correo
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
