import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { DollarSign, TrendingUp, Calendar, MapPin, PiggyBank, Fuel, Navigation, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast';

interface DashboardData {
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  today_km: number;
  net_profit: number;
  total_fuel: number;
  daily_goal: number;
  daily_progress: number;
  daily_revenue: { date: string; revenue: number }[];
}

export default function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  function load() {
    setError('');
    api.get('/dashboard/').then(r => setData(r.data)).catch(e => { const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message; setError(msg); toast('Erro ao carregar dashboard', 'error'); });
  }

  useEffect(() => { load(); }, []);

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center"><AlertTriangle size={28} className="text-red-400" /></div>
      <p className="text-zinc-400 text-sm text-center max-w-md">{error}</p>
      <button onClick={load} className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer"><RefreshCw size={16} /> Tentar novamente</button>
    </div>
  );

  if (!data) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" /></div>;

  const fmt = (v: number) => 'R$ ' + v.toFixed(2).replace('.', ',');
  const pct = data.daily_goal > 0 ? Math.min((data.today_revenue / data.daily_goal) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
        </div>
      </div>
      <button onClick={() => navigate('/jornada')} className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
        <Navigation size={20} /> Iniciar Jornada
      </button>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={DollarSign} label="Faturamento Hoje" value={fmt(data.today_revenue)} color="bg-amber-500/20 text-amber-400" />
        <StatCard icon={TrendingUp} label="Faturamento Semana" value={fmt(data.week_revenue)} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard icon={Calendar} label="Faturamento Mes" value={fmt(data.month_revenue)} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={MapPin} label="KM Rodados Hoje" value={data.today_km + ' km'} color="bg-violet-500/20 text-violet-400" />
        <StatCard icon={PiggyBank} label="Lucro Liquido" value={fmt(data.net_profit)} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard icon={Fuel} label="Combustivel Total" value={fmt(data.total_fuel)} color="bg-red-500/20 text-red-400" />
      </div>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-100">Meta Diaria</h2>
          <span className="text-sm text-zinc-400">{fmt(data.today_revenue)} / {fmt(data.daily_goal)}</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2.5">
          <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-500" style={{ width: pct + '%' }} />
        </div>
        <p className="text-xs text-zinc-500 mt-2">{pct.toFixed(0)}% concluido</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <h2 className="text-sm font-medium text-zinc-100 mb-4">Receita por Dia</h2>
          <div className="space-y-2">
            {data.daily_revenue.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">{new Date(d.date).toLocaleDateString('pt-BR')}</span>
                <span className="text-zinc-100 font-medium">{fmt(d.revenue)}</span>
              </div>
            ))}
            {data.daily_revenue.length === 0 && <p className="text-zinc-500 text-sm">Nenhum dado</p>}
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <h2 className="text-sm font-medium text-zinc-100 mb-4">Resumo do Mes</h2>
          <div className="space-y-3">
            <Row label="Receita Total" value={fmt(data.month_revenue)} />
            <Row label="Lucro Liquido" value={fmt(data.net_profit)} />
            <Row label="KM Rodados (hoje)" value={data.today_km + ' km'} />
            <Row label="Progresso da Meta" value={pct.toFixed(0) + '%'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-all">
      <div className={'w-10 h-10 rounded-lg flex items-center justify-center mb-3 ' + color}>
        <Icon size={20} />
      </div>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-100 font-medium">{value}</span>
    </div>
  );
}