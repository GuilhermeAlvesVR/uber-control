import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';
import { DollarSign, TrendingUp, Calendar, MapPin, PiggyBank, Fuel, Navigation, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

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
    <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"><AlertTriangle size={28} className="text-red-400" /></div>
      <p className="text-zinc-400 text-sm text-center max-w-md">{error}</p>
      <button onClick={load} className="btn-primary"><RefreshCw size={16} /> Tentar novamente</button>
    </div>
  );

  if (!data) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" /></div>;

  const fmt = (v: number | null | undefined) => 'R$ ' + (v ?? 0).toFixed(2).replace('.', ',');
  const pct = data.daily_goal > 0 ? Math.min((data.today_revenue / data.daily_goal) * 100, 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const todayLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const chartData = {
    labels: (data.daily_revenue || []).map(d => new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
    datasets: [{
      label: 'Receita',
      data: (data.daily_revenue || []).map(d => d.revenue),
      borderColor: '#f59e0b',
      backgroundColor: (ctx: any) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
        g.addColorStop(0, 'rgba(245,158,11,0.25)');
        g.addColorStop(1, 'rgba(245,158,11,0)');
        return g;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#fbbf24',
      pointBorderColor: '#09090b',
      borderWidth: 2.5,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f4f4f5',
        bodyColor: '#fbbf24',
        padding: 10,
        cornerRadius: 10,
        callbacks: { label: (c: any) => ' R$ ' + Number(c.parsed.y).toFixed(2).replace('.', ',') },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#52525b', maxRotation: 0, font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#52525b', font: { size: 11 }, callback: (v: any) => 'R$' + v },
        border: { display: false },
      },
    },
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">{greeting}! 🚗</h1>
          <p className="text-sm text-zinc-500 capitalize">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</span>
        </div>
      </div>

      <button onClick={() => navigate('/jornada')} className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-zinc-950 font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_8px_32px_-8px_rgba(245,158,11,0.7)] active:scale-[0.99]">
        <Navigation size={22} /> Iniciar Jornada
      </button>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={DollarSign} label="Faturamento Hoje" value={fmt(data.today_revenue)} gradient="from-amber-400 to-orange-500" />
        <StatCard icon={TrendingUp} label="Faturamento Semana" value={fmt(data.week_revenue)} gradient="from-emerald-400 to-teal-500" />
        <StatCard icon={Calendar} label="Faturamento Mes" value={fmt(data.month_revenue)} gradient="from-blue-400 to-indigo-500" />
        <StatCard icon={MapPin} label="KM Rodados Hoje" value={data.today_km + ' km'} gradient="from-violet-400 to-purple-500" />
        <StatCard icon={PiggyBank} label="Lucro Liquido" value={fmt(data.net_profit)} gradient="from-emerald-400 to-green-500" />
        <StatCard icon={Fuel} label="Combustivel Total" value={fmt(data.total_fuel)} gradient="from-red-400 to-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card card-hover p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-zinc-100">Meta Diaria</h2>
            <span className="text-xs text-zinc-500">{fmt(data.today_revenue)} / {fmt(data.daily_goal)}</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.6)]" style={{ width: pct + '%' }} />
          </div>
          <p className="text-xs text-zinc-500 mt-2">{pct.toFixed(0)}% concluido</p>
        </div>

        <div className="card card-hover p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-zinc-100">Receita por Dia</h2>
            <span className="chip">Este mes</span>
          </div>
          <div className="h-56">
            {Array.isArray(data.daily_revenue) && data.daily_revenue.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500 text-sm">Nenhum dado de receita ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card card-hover p-5">
        <h2 className="text-sm font-medium text-zinc-100 mb-4">Resumo do Mes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Row label="Receita Total" value={fmt(data.month_revenue)} />
          <Row label="Lucro Liquido" value={fmt(data.net_profit)} />
          <Row label="KM Rodados (hoje)" value={data.today_km + ' km'} />
          <Row label="Progresso da Meta" value={pct.toFixed(0) + '%'} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient }: { icon: any; label: string; value: string; gradient: string }) {
  return (
    <div className="card card-hover p-4 group">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
        <Icon size={20} className="text-zinc-950" />
      </div>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-zinc-800/40 rounded-xl">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-zinc-100 font-semibold">{value}</span>
    </div>
  );
}
