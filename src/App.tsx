import { AppRouter } from './routes/AppRouter';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';

function App() {
  return (
    <>
      <AppRouter />
      <PWAInstallBanner />
    </>
  );
}

export default App;
