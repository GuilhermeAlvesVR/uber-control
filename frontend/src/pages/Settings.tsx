import { useState, useEffect } from 'react';
import { DollarSign, Target, Layers } from 'lucide-react';
import { useToast } from '../components/Toast';
import api from '../services/api';

export default function Settings() {
  const { toast } = useToast();
  const [gasPrice, setGasPrice] = useState('5.89');
  const [dailyGoal, setDailyGoal] = useState('200');
  const [monthlyGoal, setMonthlyGoal] = useState('6000');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/settings/').then(r => {
      setGasPrice(r.data.gas_price?.toString() || '5.89');
      setDailyGoal(r.data.daily_goal?.toString() || '200');
      setMonthlyGoal(r.data.monthly_goal?.toString() || '6000');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    try {
      await api.put('/auth/settings/', {
        gas_price: parseFloat(gasPrice),
        daily_goal: parseFloat(dailyGoal),
        monthly_goal: parseFloat(monthlyGoal),
      });
      toast('Configuracoes salvas!');
    } catch { toast('Erro ao salvar configuracoes', 'error'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" /></div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Configuracoes</h1>

      <div className="space-y-4">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"><DollarSign size={20} className="text-zinc-950" /></div>
            <div><p className="text-sm font-medium text-zinc-100">Preco da Gasolina</p><p className="text-xs text-zinc-500">Valor medio por litro</p></div></div>
          <div className="relative"><span className="absolute left-4 top-3 text-zinc-500">R$</span>
            <input type="number" step="0.01" value={gasPrice} onChange={e => setGasPrice(e.target.value)} className="input !pl-10" /></div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"><Target size={20} className="text-zinc-950" /></div>
            <div><p className="text-sm font-medium text-zinc-100">Metas</p><p className="text-xs text-zinc-500">Defina seus objetivos</p></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Meta Diaria (R$)</label><input type="number" value={dailyGoal} onChange={e => setDailyGoal(e.target.value)} className="input" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Meta Mensal (R$)</label><input type="number" value={monthlyGoal} onChange={e => setMonthlyGoal(e.target.value)} className="input" /></div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg"><Layers size={20} className="text-zinc-950" /></div>
            <div><p className="text-sm font-medium text-zinc-100">Categorias</p><p className="text-xs text-zinc-500">Gerenciar categorias de despesas</p></div></div>
          <div className="flex flex-wrap gap-2">
            {['Combustivel','Alimentacao','Lavagem','Manutencao','Seguro','Pedagio','Uber','Particular','Outros'].map(c => (
              <span key={c} className="chip">{c}</span>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary w-full">
        Salvar Configuracoes
      </button>
    </div>
  );
}