import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Skeleton, EmptyState } from '../components/ui';
import type { Maintenance as MaintenanceType } from '../types';

export default function Maintenance() {
  const { toast } = useToast();
  const [list, setList] = useState<MaintenanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], service: '', amount: '', km: '', workshop: '', notes: '' });

  async function load() {
    try {
      const r = await api.get('/maintenance/');
      setList(r.data.results ?? r.data);
    } catch { toast('Erro ao carregar manutencoes', 'error'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/maintenance/', { ...form, amount: parseFloat(form.amount), km: parseInt(form.km) });
      toast('Manutencao registrada com sucesso');
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], service: '', amount: '', km: '', workshop: '', notes: '' });
      load();
    } catch { toast('Erro ao registrar manutencao', 'error'); }
  }
  async function handleDelete(id: number) {
    try {
      await api.delete(`/maintenance/${id}/`);
      toast('Manutencao excluida');
      load();
    } catch { toast('Erro ao excluir', 'error'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Manutencoes</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Nova</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Data</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="input" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Servico</label><input type="text" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} required className="input" placeholder="Troca de oleo" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor (R$)</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="input" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">KM</label><input type="number" value={form.km} onChange={e => setForm({ ...form, km: e.target.value })} required className="input" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Oficina</label><input type="text" value={form.workshop} onChange={e => setForm({ ...form, workshop: e.target.value })} required className="input" /></div>
          </div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Observacoes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input" rows={3} /></div>
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
            <EmptyState icon={Wrench} title="Nenhuma manutencao registrada" />
          ) : (list || []).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center"><Wrench size={16} className="text-red-400" /></div>
                <div><p className="text-sm text-zinc-100">{item.service}</p><p className="text-xs text-zinc-500">{item.workshop} · {item.km}km</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-red-400">R${Number(item.amount).toFixed(2)}</p>
                  <p className="text-xs text-zinc-500">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
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