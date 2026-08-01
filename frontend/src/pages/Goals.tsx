import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { Plus, Crosshair } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Goals() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'daily', target_amount: '' });

  async function load() {
    try {
      const [g, d] = await Promise.all([
        api.get('/finances/goals/'),
        api.get('/dashboard/'),
      ]);
      setGoals(g.data.results ?? g.data);
      setDashboard(d.data);
    } catch { toast('Erro ao carregar metas', 'error'); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/finances/goals/', { type: form.type, target_amount: parseFloat(form.target_amount) });
      toast('Meta criada com sucesso');
      setShowForm(false);
      setForm({ type: 'daily', target_amount: '' });
      load();
    } catch { toast('Erro ao criar meta', 'error'); }
  }

  const labels: Record<string, string> = { daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensal' };

  function getProgress(type: string) {
    if (!dashboard) return 0;
    const revenue = type === 'daily' ? dashboard.today_revenue : type === 'weekly' ? dashboard.week_revenue : dashboard.month_revenue;
    const goal = goals.find(g => g.type === type);
    if (!goal || !goal.target_amount) return 0;
    return Math.min((revenue / goal.target_amount) * 100, 100);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Metas</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer text-sm"><Plus size={16} /> Nova Meta</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Tipo</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100">
                <option value="daily">Diaria</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option>
              </select></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor Meta (R$)</label><input type="number" step="0.01" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
          </div>
          <div className="flex gap-3"><button type="submit" className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all cursor-pointer">Cancelar</button></div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Array.isArray(goals) ? goals : []).map((goal: any) => {
          const pct = getProgress(goal.type);
          return (
            <div key={goal.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center"><Crosshair size={20} className="text-amber-400" /></div>
                <div><p className="text-sm font-medium text-zinc-100">Meta {labels[goal.type]}</p><p className="text-xs text-zinc-500">R$ {parseFloat(goal.target_amount).toFixed(2)}</p></div>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3">
                <div className="bg-amber-400 h-3 rounded-full transition-all duration-500" style={{ width: pct + '%' }} />
              </div>
              <p className="text-xs text-zinc-500 mt-2">{pct.toFixed(0)}% concluido</p>
            </div>
          );
        })}
        {(!Array.isArray(goals) || goals.length === 0) && <p className="text-zinc-500 text-sm col-span-3 text-center py-8">Nenhuma meta definida</p>}
      </div>
    </div>
  );
}