import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ObligationsPage from './pages/ObligationsPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import AlertsPage from './pages/AlertsPage';
import ControlsPage from './pages/ControlsPage';
import DeadlinesPage from './pages/DeadlinesPage';
import RegulationsPage from './pages/RegulationsPage';
import ChecksPage from './pages/ChecksPage';
import ActionPlansPage from './pages/ActionPlansPage';
import RegulatoryFeed from './pages/RegulatoryFeed';
import RegulationDetails from './pages/RegulationDetails';
import AuditsPage from './pages/AuditsPage';
import AuditDetailsPage from './pages/AuditDetailsPage';
import NewAuditPage from './pages/NewAuditPage';
import './i18n';
import './index.css';
import { isDemoMode } from './demo/mockServer';

const DEMO_MODE = isDemoMode();
const Router = DEMO_MODE ? HashRouter : BrowserRouter;

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirect to dashboard if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      {/* Protected routes with Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="obligations" element={<ObligationsPage />} />
        <Route path="controls" element={<ControlsPage />} />
        <Route path="profile" element={<CompanyProfilePage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="deadlines" element={<DeadlinesPage />} />
        <Route path="regulations" element={<RegulationsPage />} />
        <Route path="regulations/:id" element={<RegulationDetails />} />
        <Route path="checks" element={<ChecksPage />} />
        <Route path="action-plans" element={<ActionPlansPage />} />
        <Route path="jort-feed" element={<RegulatoryFeed />} />
        <Route path="audits" element={<AuditsPage />} />
        <Route path="audits/new" element={<NewAuditPage />} />
        <Route path="audits/:id" element={<AuditDetailsPage />} />
      </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}



function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
