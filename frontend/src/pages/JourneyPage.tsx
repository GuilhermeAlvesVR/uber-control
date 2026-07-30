import { useState, useEffect, FormEvent, useRef } from 'react';
import api from '../services/api';
import { Play, Pause, Flag, RotateCcw } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { Journey } from '../types';

export default function JourneyPage() {
  const [state, setState] = useState<'idle' | 'active' | 'paused' | 'ending' | 'done'>('idle');
  const [journey, setJourney] = useState<Journey | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [pausedTotal, setPausedTotal] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);
  const pauseStartRef = useRef<number | null>(null);

  const [startForm, setStartForm] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    start_km: '',
    fuel_level_start: '',
  });

  const [endForm, setEndForm] = useState({
    end_time: '', end_km: '', uber_amount: '', cash_amount: '',
    pix_amount: '', card_amount: '', tips: '', tolls_received: '', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [result, setResult] = useState<Journey | null>(null);

  useEffect(() => {
    api.get('/journeys/active/').then(r => {
      if (r.data) {
        setJourney(r.data);
        if (r.data.is_paused) {
          setState('paused');
        } else {
          setState('active');
        }
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

  async function handleStart(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/journeys/start/', {
        date: startForm.date,
        start_time: startForm.start_time,
        start_km: parseInt(startForm.start_km),
        fuel_level_start: startForm.fuel_level_start || null,
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

  async function handleEnd(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.patch(`/journeys/${journey!.id}/end/`, {
        end_time: endForm.end_time,
        end_km: parseInt(endForm.end_km),
        uber_amount: parseFloat(endForm.uber_amount) || 0,
        cash_amount: parseFloat(endForm.cash_amount) || 0,
        pix_amount: parseFloat(endForm.pix_amount) || 0,
        card_amount: parseFloat(endForm.card_amount) || 0,
        tips: parseFloat(endForm.tips) || 0,
        tolls_received: parseFloat(endForm.tolls_received) || 0,
        notes: endForm.notes || '',
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
    setStartForm({ ...startForm, start_time: '', start_km: '', fuel_level_start: '' });
    setEndForm({ end_time: '', end_km: '', uber_amount: '', cash_amount: '', pix_amount: '', card_amount: '', tips: '', tolls_received: '', notes: '' });
  }

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  if (state === 'done' && result) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-zinc-100">Resumo do Dia</h1>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ResumoBox label="KM Rodados" value={`${result.total_km ?? 0} km`} />
            <ResumoBox label="Receita Total" value={fmt(Number(result.total_revenue ?? 0))} />
            <ResumoBox label="Receita/km" value={fmt(Number(result.revenue_per_km ?? 0))} />
            <ResumoBox label="Receita/hora" value={fmt(Number(result.revenue_per_hour ?? 0))} />
            <ResumoBox label="Tempo" value={`${result.total_hours ?? 0}h`} />
            <ResumoBox label="Dinheiro" value={fmt(Number(result.cash_amount ?? 0))} />
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
        <form onSubmit={handleEnd} className="space-y-4 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Hora Final</label><input type="time" value={endForm.end_time} onChange={e => setEndForm({...endForm, end_time: e.target.value})} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">KM Final</label><input type="number" value={endForm.end_km} onChange={e => setEndForm({...endForm, end_km: e.target.value})} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <Campo label="Uber" val={endForm.uber_amount} set={v => setEndForm({...endForm, uber_amount: v})} />
            <Campo label="Dinheiro" val={endForm.cash_amount} set={v => setEndForm({...endForm, cash_amount: v})} />
            <Campo label="Pix" val={endForm.pix_amount} set={v => setEndForm({...endForm, pix_amount: v})} />
            <Campo label="Cartao" val={endForm.card_amount} set={v => setEndForm({...endForm, card_amount: v})} />
            <Campo label="Gorjetas" val={endForm.tips} set={v => setEndForm({...endForm, tips: v})} />
            <Campo label="Pedagios" val={endForm.tolls_received} set={v => setEndForm({...endForm, tolls_received: v})} />
          </div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Observacoes</label><textarea value={endForm.notes} onChange={e => setEndForm({...endForm, notes: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" rows={3} /></div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all cursor-pointer">
            {loading ? 'Finalizando...' : 'Finalizar Dia'}
          </button>
          <button type="button" onClick={() => setState('active')} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all cursor-pointer text-sm">
            Voltar
          </button>
        </form>
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
            <div><p className="text-xs text-zinc-500">KM Inicial</p><p className="text-zinc-100">{journey!.start_km} km</p></div>
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
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Iniciar Jornada</h1>
      <form onSubmit={handleStart} className="space-y-4 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Data</label>
          <input type="date" value={startForm.date} onChange={e => setStartForm({...startForm, date: e.target.value})} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Hora de Inicio</label>
          <input type="time" value={startForm.start_time} onChange={e => setStartForm({...startForm, start_time: e.target.value})} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">KM Inicial</label>
          <input type="number" value={startForm.start_km} onChange={e => setStartForm({...startForm, start_km: e.target.value})} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" placeholder="Ex: 50000" />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Nivel de Combustivel <span className="text-zinc-600">(opcional)</span></label>
          <select value={startForm.fuel_level_start} onChange={e => setStartForm({...startForm, fuel_level_start: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100">
            <option value="">Selecione</option>
            <option value="1/4">1/4</option>
            <option value="1/2">1/2</option>
            <option value="3/4">3/4</option>
            <option value="Completo">Completo</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2">
          <Play size={18} /> {loading ? 'Iniciando...' : 'Iniciar Dia'}
        </button>
      </form>
    </div>
  );
}

function Campo({ label, val, set }: { label: string; val: string; set: (v: string) => void }) {
  return <div><label className="text-sm text-zinc-400 mb-1 block">{label}</label><input type="number" step="0.01" value={val} onChange={e => set(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" placeholder="R$ 0,00" /></div>;
}

function ResumoBox({ label, value }: { label: string; value: string }) {
  return <div className="bg-zinc-800/50 rounded-lg p-4"><p className="text-xs text-zinc-500 mb-1">{label}</p><p className="text-lg font-semibold text-zinc-100">{value}</p></div>;
}