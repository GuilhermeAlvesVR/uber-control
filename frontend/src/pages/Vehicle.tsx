import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { Car } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { Vehicle as VehicleType } from '../types';

export default function Vehicle() {
  const { toast } = useToast();
  const [form, setForm] = useState({ model: '', year: '', plate: '', avg_consumption: '', next_oil_change_km: '', next_revision_km: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vehicle/').then(r => {
      const v: VehicleType = r.data;
      setForm({
        model: v.model || '',
        year: v.year?.toString() || '',
        plate: v.plate || '',
        avg_consumption: v.avg_consumption?.toString() || '',
        next_oil_change_km: v.next_oil_change_km?.toString() || '',
        next_revision_km: v.next_revision_km?.toString() || '',
      });
    }).catch(() => toast('Erro ao carregar veiculo', 'error')).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.put('/vehicle/', {
        model: form.model,
        year: parseInt(form.year),
        plate: form.plate,
        avg_consumption: parseFloat(form.avg_consumption),
        next_oil_change_km: form.next_oil_change_km ? parseInt(form.next_oil_change_km) : null,
        next_revision_km: form.next_revision_km ? parseInt(form.next_revision_km) : null,
      });
      toast('Veiculo atualizado!');
    } catch { toast('Erro ao atualizar veiculo', 'error'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" /></div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Meu Veiculo</h1>
      <form onSubmit={handleSubmit} className="space-y-4 card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"><Car size={24} className="text-zinc-950" /></div>
          <div><p className="text-zinc-100 font-medium">Dados do Veiculo</p><p className="text-xs text-zinc-500">Informacoes do carro</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-zinc-400 mb-1 block">Modelo</label><input type="text" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required className="input" placeholder="Ex: Onix" /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Ano</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required className="input" /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Placa</label><input type="text" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} required className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 uppercase" placeholder="ABC1234" /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Consumo Medio (km/L)</label><input type="number" step="0.1" value={form.avg_consumption} onChange={e => setForm({ ...form, avg_consumption: e.target.value })} required className="input" /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Prox. Troca Oleo (km)</label><input type="number" value={form.next_oil_change_km} onChange={e => setForm({ ...form, next_oil_change_km: e.target.value })} className="input" /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Prox. Revisao (km)</label><input type="number" value={form.next_revision_km} onChange={e => setForm({ ...form, next_revision_km: e.target.value })} className="input" /></div>
        </div>
        <button type="submit" className="btn-primary w-full">Salvar</button>
      </form>
    </div>
  );
}