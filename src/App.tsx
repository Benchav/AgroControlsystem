import { AppRouter } from './routes/AppRouter';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <PWAInstallBanner />
    </AuthProvider>
  );
}

export default App;
