import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import JourneyPage from './pages/JourneyPage';
import Caixa from './pages/Caixa';
import Fueling from './pages/Fueling';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Vehicle from './pages/Vehicle';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/jornada" element={<ErrorBoundary><JourneyPage /></ErrorBoundary>} />
          <Route path="/caixa" element={<ErrorBoundary><Caixa /></ErrorBoundary>} />
          <Route path="/abastecimentos" element={<ErrorBoundary><Fueling /></ErrorBoundary>} />
          <Route path="/manutencoes" element={<ErrorBoundary><Maintenance /></ErrorBoundary>} />
          <Route path="/despesas" element={<ErrorBoundary><Expenses /></ErrorBoundary>} />
          <Route path="/metas" element={<ErrorBoundary><Goals /></ErrorBoundary>} />
          <Route path="/relatorios" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
          <Route path="/veiculo" element={<ErrorBoundary><Vehicle /></ErrorBoundary>} />
          <Route path="/configuracoes" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}