import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/jornada" element={<JourneyPage />} />
          <Route path="/caixa" element={<Caixa />} />
          <Route path="/abastecimentos" element={<Fueling />} />
          <Route path="/manutencoes" element={<Maintenance />} />
          <Route path="/despesas" element={<Expenses />} />
          <Route path="/metas" element={<Goals />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/veiculo" element={<Vehicle />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}