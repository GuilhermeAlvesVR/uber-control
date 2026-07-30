import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { Fuel, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { Fueling as FuelingType } from '../types';

export default function Fueling() {
  const { toast } = useToast();
  const [list, setList] = useState<FuelingType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], station: '', amount: '', liters: '', price_per_liter: '', km: '' });

  async function load() {
    try {
      const r = await api.get('/fueling/');
      setList(r.data.results ?? r.data);
    } catch { toast('Erro ao carregar abastecimentos', 'error'); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/fueling/', { ...form, amount: parseFloat(form.amount), liters: parseFloat(form.liters), price_per_liter: parseFloat(form.price_per_liter), km: parseInt(form.km) });
      toast('Abastecimento registrado com sucesso');
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], station: '', amount: '', liters: '', price_per_liter: '', km: '' });
      load();
    } catch { toast('Erro ao registrar abastecimento', 'error'); }
  }
  async function handleDelete(id: number) {
    try {
      await api.delete(`/fueling/${id}/`);
      toast('Abastecimento excluido');
      load();
    } catch { toast('Erro ao excluir', 'error'); }
  }

  function calcConsumption() {
    const litros = parseFloat(form.liters);
    const km = parseInt(form.km);
    if (litros > 0 && km > 0) return (km / litros).toFixed(2);
    return '-';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Abastecimentos</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer text-sm"><Plus size={16} /> Novo</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Data</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Posto</label><input type="text" value={form.station} onChange={e => setForm({ ...form, station: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor (R$)</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Litros</label><input type="number" step="0.01" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor/Litro</label><input type="number" step="0.01" value={form.price_per_liter} onChange={e => setForm({ ...form, price_per_liter: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">KM</label><input type="number" value={form.km} onChange={e => setForm({ ...form, km: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100" /></div>
          </div>
          <div className="text-sm text-zinc-400">Consumo medio: <span className="text-amber-400 font-medium">{calcConsumption()} km/L</span></div>
          <div className="flex gap-3"><button type="submit" className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all cursor-pointer">Cancelar</button></div>
        </form>
      )}

      <div className="bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="divide-y divide-zinc-800">
          {(list || []).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><Fuel size={16} className="text-amber-400" /></div>
                <div><p className="text-sm text-zinc-100">{item.station}</p><p className="text-xs text-zinc-500">{item.liters}L x R${Number(item.price_per_liter).toFixed(2)}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-100">R${Number(item.amount).toFixed(2)}</p>
                  <p className="text-xs text-zinc-500">{item.km}km · {Number(item.km_per_liter || 0).toFixed(1)}km/L</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded cursor-pointer" title="Excluir"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-zinc-500 text-sm p-4 text-center">Nenhum abastecimento registrado</p>}
        </div>
      </div>
    </div>
  );
}