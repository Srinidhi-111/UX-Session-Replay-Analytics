import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { SessionsPage } from './pages/SessionsPage';
import { AlertsPage } from './pages/AlertsPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { TimelinePage } from './pages/TimelinePage';
import { SessionProvider } from './SessionContext';
import { LiveProvider } from './LiveContext';
import { ToastProvider } from './Toast';
import { RageClickToastWatcher } from './RageClickToastWatcher';

function App() {
  return (
    <SessionProvider>
      <LiveProvider>
        <ToastProvider>
          <RageClickToastWatcher />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<SessionsPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="heatmap" element={<HeatmapPage />} />
                <Route path="timeline" element={<TimelinePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </LiveProvider>
    </SessionProvider>
  );
}

export default App;