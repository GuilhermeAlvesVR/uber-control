import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import api from '../services/api';
import { Car, Upload, X } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { Vehicle as VehicleType } from '../types';

function readAndResize(file: File, maxW = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Vehicle() {
  const { toast } = useToast();
  const [form, setForm] = useState({ model: '', year: '', plate: '', photo: '', avg_consumption: '', next_oil_change_km: '', next_revision_km: '' });
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/vehicle/').then(r => {
      const v: VehicleType = r.data;
      setForm({
        model: v.model || '',
        year: v.year?.toString() || '',
        plate: v.plate || '',
        photo: v.photo || '',
        avg_consumption: v.avg_consumption?.toString() || '',
        next_oil_change_km: v.next_oil_change_km?.toString() || '',
        next_revision_km: v.next_revision_km?.toString() || '',
      });
    }).catch(() => toast('Erro ao carregar veiculo', 'error')).finally(() => setLoading(false));
  }, []);

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Envie uma imagem', 'error'); return; }
    try {
      const dataUrl = await readAndResize(file);
      setForm(f => ({ ...f, photo: dataUrl }));
      toast('Foto carregada - clique em Salvar para aplicar');
    } catch { toast('Erro ao processar imagem', 'error'); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.put('/vehicle/', {
        model: form.model,
        year: parseInt(form.year),
        plate: form.plate,
        photo: form.photo || null,
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
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Foto do carro (aparece no PDF do orcamento)</label>
          {form.photo ? (
            <div className="relative rounded-xl overflow-hidden border border-zinc-700/60">
              <img src={form.photo} alt="Carro" className="w-full h-40 object-cover" />
              <button type="button" onClick={() => setForm(f => ({ ...f, photo: '' }))} className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-900/80 text-zinc-300 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-32 rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors cursor-pointer">
              <Upload size={20} />
              <span className="text-sm">Enviar foto do carro</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
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