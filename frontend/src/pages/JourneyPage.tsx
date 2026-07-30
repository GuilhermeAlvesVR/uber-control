import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Play, Pause, Flag, RotateCcw, DollarSign, Wallet, PiggyBank, Gauge } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { Journey } from '../types';

export default function JourneyPage() {
  const [state, setState] = useState<'idle' | 'active' | 'paused' | 'ending' | 'done'>('idle');
  const [journey, setJourney] = useState<Journey | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [pausedTotal, setPausedTotal] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);
  const pauseStartRef = useRef<number | null>(null);

  const [endKm, setEndKm] = useState('');
  const [totalRevenue, setTotalRevenue] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cashOnHand, setCashOnHand] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [result, setResult] = useState<Journey | null>(null);

  useEffect(() => {
    api.get('/journeys/active/').then(r => {
      if (r.data) {
        setJourney(r.data);
        setState(r.data.is_paused ? 'paused' : 'active');
      }
    }).catch(() => toast('Erro ao verificar jornada ativa', 'error'));
  }, []);

  useEffect(() => {
    if (state === 'active') {
      timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current !== undefined) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current !== undefined) clearInterval(timerRef.current); };
  }, [state]);

  const displayTime = () => {
    const total = elapsed;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  async function handleStart() {
    setLoading(true);
    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const start_time = now.toTimeString().split(':').slice(0, 2).join(':');
      const { data } = await api.post('/journeys/start/', {
        date, start_time, start_km: 0,
      });
      setJourney(data);
      setElapsed(0);
      setState('active');
    } catch { toast('Erro ao iniciar jornada', 'error'); }
    setLoading(false);
  }

  async function handlePause() {
    try {
      await api.post(`/journeys/${journey!.id}/pause/`);
      pauseStartRef.current = Date.now();
      setState('paused');
    } catch { toast('Erro ao pausar jornada', 'error'); }
  }

  async function handleResume() {
    try {
      if (pauseStartRef.current) {
        const pausedMs = Math.floor((Date.now() - pauseStartRef.current) / 1000);
        setPausedTotal(p => p + pausedMs);
        setElapsed(e => e + pausedMs);
        pauseStartRef.current = null;
      }
      await api.post(`/journeys/${journey!.id}/resume/`);
      setState('active');
    } catch { toast('Erro ao retomar jornada', 'error'); }
  }

  async function handleEnd() {
    if (!endKm) { toast('Informe o KM final', 'error'); return; }
    setLoading(true);
    try {
      const now = new Date();
      const end_time = now.toTimeString().split(':').slice(0, 2).join(':');
      const { data } = await api.patch(`/journeys/${journey!.id}/end/`, {
        end_time,
        end_km: parseInt(endKm),
        total_revenue: parseFloat(totalRevenue) || 0,
        cash_amount: parseFloat(cashAmount) || 0,
        cash_on_hand: parseFloat(cashOnHand) || 0,
      });
      setResult(data);
      setState('done');
    } catch { toast('Erro ao encerrar jornada', 'error'); }
    setLoading(false);
  }

  function resetAll() {
    setState('idle');
    setJourney(null);
    setElapsed(0);
    setPausedTotal(0);
    setResult(null);
    setEndKm('');
    setTotalRevenue('');
    setCashAmount('');
    setCashOnHand('');
  }

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  if (state === 'done' && result) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-zinc-100">Resumo do Dia</h1>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ResumoBox icon={Gauge} label="KM Rodados" value={`${result.total_km ?? 0} km`} />
            <ResumoBox icon={DollarSign} label="Receita Total" value={fmt(Number(result.total_revenue ?? 0))} />
            <ResumoBox icon={Wallet} label="Dinheiro" value={fmt(Number(result.cash_amount ?? 0))} />
            <ResumoBox icon={PiggyBank} label="Caixa em Dinheiro" value={fmt(Number(result.cash_on_hand ?? 0))} />
            <ResumoBox icon={DollarSign} label="Receita/km" value={fmt(Number(result.revenue_per_km ?? 0))} />
            <ResumoBox icon={DollarSign} label="Receita/hora" value={fmt(Number(result.revenue_per_hour ?? 0))} />
          </div>
          <button onClick={resetAll} className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Novo Dia
          </button>
        </div>
      </div>
    );
  }

  if (state === 'ending') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-zinc-100">Encerrar Jornada</h1>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
            <div className="text-3xl font-mono text-amber-400">{displayTime()}</div>
            <div className="text-xs text-zinc-500">Tempo trabalhado</div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 flex items-center gap-2"><Gauge size={14} /> KM Final</label>
              <input type="number" value={endKm} onChange={e => setEndKm(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" placeholder="Ex: 52300" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 flex items-center gap-2"><DollarSign size={14} /> Total que fiz no dia (R$)</label>
              <input type="number" step="0.01" value={totalRevenue} onChange={e => setTotalRevenue(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" placeholder="0,00" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 flex items-center gap-2"><Wallet size={14} /> Recebi em dinheiro (R$)</label>
              <input type="number" step="0.01" value={cashAmount} onChange={e => setCashAmount(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" placeholder="0,00" />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 flex items-center gap-2"><PiggyBank size={14} /> Caixa em dinheiro (R$)</label>
              <input type="number" step="0.01" value={cashOnHand} onChange={e => setCashOnHand(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" placeholder="0,00" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleEnd} disabled={loading} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50">
              {loading ? 'Finalizando...' : 'Finalizar Dia'}
            </button>
            <button onClick={() => setState('active')} className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all cursor-pointer text-sm">Voltar</button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'active' || state === 'paused') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center space-y-6">
          <h1 className="text-2xl font-bold text-zinc-100">Jornada em Andamento</h1>
          <div className={`text-6xl font-bold font-mono ${state === 'paused' ? 'text-zinc-500' : 'text-amber-400'}`}>
            {displayTime()}
          </div>
          {state === 'paused' && <p className="text-zinc-500 text-sm">PAUSADO</p>}
          <div className="grid grid-cols-2 gap-4 text-left max-w-xs mx-auto">
            <div><p className="text-xs text-zinc-500">Data</p><p className="text-zinc-100">{new Date(journey!.date).toLocaleDateString('pt-BR')}</p></div>
            <div><p className="text-xs text-zinc-500">Inicio</p><p className="text-zinc-100">{journey!.start_time}</p></div>
          </div>
          <div className="flex gap-3 justify-center">
            {state === 'active' ? (
              <button onClick={handlePause} className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer">
                <Pause size={18} /> Pausar
              </button>
            ) : (
              <button onClick={handleResume} className="flex items-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-black font-semibold rounded-lg transition-all cursor-pointer">
                <Play size={18} /> Retomar
              </button>
            )}
            <button onClick={() => setState('ending')} className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all cursor-pointer">
              <Flag size={18} /> Encerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <h1 className="text-2xl font-bold text-zinc-100">Iniciar Jornada</h1>
      <p className="text-sm text-zinc-500">Clique no botão para iniciar sua jornada de trabalho</p>
      <button onClick={handleStart} disabled={loading} className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold text-lg rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3">
        <Play size={24} /> {loading ? 'Iniciando...' : 'Iniciar Dia'}
      </button>
    </div>
  );
}

function ResumoBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-zinc-500" />
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
      <p className="text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
