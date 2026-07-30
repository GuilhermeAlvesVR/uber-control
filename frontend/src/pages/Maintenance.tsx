import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { Maintenance as MaintenanceType } from '../types';

export default function Maintenance() {
  const { toast } = useToast();
  const [list, setList] = useState<MaintenanceType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], service: '', amount: '', km: '', workshop: '', notes: '' });

  async function load() {
    try {
      const r = await api.get('/maintenance/');
      setList(r.data.results ?? r.data);
    } catch { toast('Erro ao carregar manutencoes', 'error'); }
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
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer text-sm"><Plus size={16} /> Nova</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Data</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Servico</label><input type="text" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" placeholder="Troca de oleo" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor (R$)</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">KM</label><input type="number" value={form.km} onChange={e => setForm({ ...form, km: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Oficina</label><input type="text" value={form.workshop} onChange={e => setForm({ ...form, workshop: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
          </div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Observacoes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" rows={3} /></div>
          <div className="flex gap-3"><button type="submit" className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all cursor-pointer">Cancelar</button></div>
        </form>
      )}

      <div className="bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="divide-y divide-zinc-800">
          {(list || []).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors group">
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
          {list.length === 0 && <p className="text-zinc-500 text-sm p-4 text-center">Nenhuma manutencao registrada</p>}
        </div>
      </div>
    </div>
  );
}