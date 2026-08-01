import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { Plus, ArrowDownRight, Trash2, Receipt } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Skeleton, EmptyState } from '../components/ui';
import type { Expense } from '../types';

const categories = ['combustivel', 'alimentacao', 'lavagem', 'manutencao', 'seguro', 'pedagio', 'uber', 'particular', 'outros'];
const catLabels: Record<string, string> = { combustivel: 'Combustivel', alimentacao: 'Alimentacao', lavagem: 'Lavagem', manutencao: 'Manutencao', seguro: 'Seguro', pedagio: 'Pedagio', uber: 'Uber', particular: 'Particular', outros: 'Outros' };

export default function Expenses() {
  const { toast } = useToast();
  const [list, setList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'outros', amount: '', payment_method: 'dinheiro', description: '' });

  async function load() {
    try {
      const r = await api.get('/finances/expenses/');
      setList(r.data.results ?? r.data);
    } catch { toast('Erro ao carregar despesas', 'error'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/finances/expenses/', { ...form, amount: parseFloat(form.amount) });
      toast('Despesa registrada com sucesso');
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], category: 'outros', amount: '', payment_method: 'dinheiro', description: '' });
      load();
    } catch { toast('Erro ao registrar despesa', 'error'); }
  }
  async function handleDelete(id: number) {
    try {
      await api.delete(`/finances/expenses/${id}/`);
      toast('Despesa excluida');
      load();
    } catch { toast('Erro ao excluir', 'error'); }
  }

  const total = list.reduce((acc, item) => acc + Number(item.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Despesas</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Nova</button>
      </div>

      <div className="card card-hover p-5">
        <p className="text-xs text-zinc-500">Total de Despesas</p>
        <p className="text-2xl font-bold text-red-400">R$ {total.toFixed(2)}</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Data</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="input" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
                {categories.map(c => <option key={c} value={c}>{catLabels[c]}</option>)}
              </select></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor (R$)</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="input" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Forma Pagamento</label>
              <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} className="input">
                <option value="dinheiro">Dinheiro</option><option value="pix">Pix</option><option value="cartao">Cartao</option><option value="debito">Debito</option>
              </select></div>
          </div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Descricao</label><input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" /></div>
          <div className="flex gap-3"><button type="submit" className="btn-primary">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button></div>
        </form>
      )}

      <div className="card">
        <div className="divide-y divide-zinc-800/60">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-24" /></div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : (list || []).length === 0 ? (
            <EmptyState icon={Receipt} title="Nenhuma despesa registrada" />
          ) : (list || []).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center"><ArrowDownRight size={16} className="text-red-400" /></div>
                <div><p className="text-sm text-zinc-100">{catLabels[item.category] || item.category}</p><p className="text-xs text-zinc-500">{item.description}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-red-400">-R${Number(item.amount).toFixed(2)}</p>
                  <p className="text-xs text-zinc-500">{item.payment_method} · {new Date(item.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded cursor-pointer" title="Excluir"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}