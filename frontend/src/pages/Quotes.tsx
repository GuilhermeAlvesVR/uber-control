import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { Plus, MapPin, Route, Download, Trash2, ClipboardList, Banknote, CreditCard, X, Loader2, Clock, Eye, ExternalLink } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Skeleton, EmptyState, PageHeader } from '../components/ui';
import type { PrivateQuote } from '../types';

const fmt = (v: number | string | null | undefined) => 'R$ ' + (Number(v) || 0).toFixed(2).replace('.', ',');

export default function Quotes() {
  const { toast } = useToast();
  const [list, setList] = useState<PrivateQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [preview, setPreview] = useState<{ distance_km: number; duration_min: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');
  const [form, setForm] = useState({
    client_name: '', origin: '', destination: '', distance_km: '',
    price_cash_pix: '', price_card: '', notes: '',
  });

  async function load() {
    try {
      const r = await api.get('/quotes/');
      setList(r.data.results ?? r.data);
    } catch { toast('Erro ao carregar orcamentos', 'error'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function calculateRoute() {
    if (!form.origin || !form.destination) return;
    setCalculating(true);
    try {
      const r = await api.post('/quotes/calculate/', {
        origin: form.origin,
        destination: form.destination,
      });
      const km = Number(r.data.distance_km) || 0;
      setPreview({ distance_km: km, duration_min: r.data.duration_min || 0 });
      setForm(f => ({ ...f, distance_km: km ? String(km) : f.distance_km }));
      toast(`Rota: ${km.toFixed(1).replace('.', ',')} km`);
    } catch {
      setPreview(null);
      toast('Nao foi possivel calcular a rota. Verifique os enderecos.', 'error');
    }
    setCalculating(false);
  }

  async function downloadPdf(id: number, clientName?: string) {
    try {
      const r = await api.get(`/quotes/${id}/pdf/`, { responseType: 'blob' });
      downloadBlob(new Blob([r.data]), clientName);
    } catch { toast('Erro ao baixar o PDF', 'error'); }
  }

  async function viewPdf(id: number, clientName?: string) {
    try {
      const r = await api.get(`/quotes/${id}/pdf/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      setPreviewUrl(url);
      setPreviewName(clientName || '');
    } catch { toast('Erro ao abrir o PDF', 'error'); }
  }

  function downloadBlob(blob: Blob, clientName?: string) {
    const url = window.URL.createObjectURL(blob);
    const safeName = (clientName || 'orcamento').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'orcamento';
    const a = document.createElement('a');
    a.href = url;
    a.download = `orcamento_${safeName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  function downloadPdfFromUrl(url: string, clientName?: string) {
    const a = document.createElement('a');
    const safeName = (clientName || 'orcamento').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'orcamento';
    a.href = url;
    a.download = `orcamento_${safeName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function closePreview() {
    if (previewUrl) window.URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewName('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.client_name || !form.origin || !form.destination || !form.price_cash_pix || !form.price_card) {
      toast('Preencha os campos obrigatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await api.post('/quotes/', {
        client_name: form.client_name,
        origin: form.origin,
        destination: form.destination,
        distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
        price_cash_pix: parseFloat(form.price_cash_pix),
        price_card: parseFloat(form.price_card),
        notes: form.notes || null,
      });
      toast('Orcamento gerado com sucesso');
      setShowForm(false);
      setForm({ client_name: '', origin: '', destination: '', distance_km: '', price_cash_pix: '', price_card: '', notes: '' });
      setPreview(null);
      load();
      viewPdf(r.data.id, r.data.client_name);
    } catch {
      toast('Erro ao gerar orcamento. Verifique os enderecos.', 'error');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Excluir este orcamento?')) return;
    try {
      await api.delete(`/quotes/${id}/`);
      toast('Orcamento excluido');
      load();
    } catch { toast('Erro ao excluir', 'error'); }
  }

  const inputCls = 'input';

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Orcamentos de Corridas Particulares"
        subtitle="Crie orcamentos com mapa e valores para seus clientes"
        right={!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Novo Orcamento</button>
        )}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-100">Novo Orcamento</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-200 cursor-pointer"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Endereco de saida *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3 text-zinc-500" />
                <input type="text" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} onBlur={calculateRoute} required className={inputCls + ' !pl-9'} placeholder="Ex: Av Paulista, 1000 - Sao Paulo" />
              </div></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Endereco de destino *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3 text-zinc-500" />
                <input type="text" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} onBlur={calculateRoute} required className={inputCls + ' !pl-9'} placeholder="Ex: Aeroporto de Congonhas" />
              </div></div>
          </div>

          {calculating && (
            <div className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 size={15} className="animate-spin text-amber-400" /> Calculando rota...</div>
          )}
          {preview && !calculating && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="chip !border-amber-400/40 !text-amber-300"><Route size={13} /> {preview.distance_km.toFixed(1).replace('.', ',')} km</span>
              <span className="chip"><Clock size={13} /> ~{preview.duration_min} min</span>
              <span className="text-xs text-zinc-500">Edite a distancia abaixo se precisar</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Nome do cliente *</label>
              <input type="text" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} required className={inputCls} placeholder="Ex: Maria" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Distancia (km)</label>
              <input type="number" step="0.1" value={form.distance_km} onChange={e => setForm({ ...form, distance_km: e.target.value })} className={inputCls} placeholder="Calculada pela rota" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor em Dinheiro / Pix (R$) *</label>
              <div className="relative">
                <Banknote size={16} className="absolute left-3.5 top-3 text-zinc-500" />
                <input type="number" step="0.01" value={form.price_cash_pix} onChange={e => setForm({ ...form, price_cash_pix: e.target.value })} required className={inputCls + ' !pl-9'} placeholder="Ex: 120" />
              </div></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor no Cartao (R$) *</label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3.5 top-3 text-zinc-500" />
                <input type="number" step="0.01" value={form.price_card} onChange={e => setForm({ ...form, price_card: e.target.value })} required className={inputCls + ' !pl-9'} placeholder="Ex: 140" />
              </div></div>
          </div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Observacoes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls} rows={2} placeholder="Ex: incluir 1 mala, taxa extra..." /></div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Gerando...' : 'Gerar Orcamento'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="p-4 border-b border-white/5"><h2 className="text-sm font-medium text-zinc-100">Historico de Orcamentos</h2></div>
        <div className="divide-y divide-zinc-800/60">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-28" /></div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : list.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Nenhum orcamento gerado ainda" action={<button onClick={() => setShowForm(true)} className="btn-primary">Criar primeiro orcamento</button>} />
          ) : list.map((q) => (
            <div key={q.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <ClipboardList size={18} className="text-zinc-950" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-zinc-100 font-medium truncate">{q.client_name}</p>
                  <p className="text-xs text-zinc-500 truncate flex items-center gap-1"><MapPin size={11} className="shrink-0" /> {q.origin} → {q.destination}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Route size={11} /> {q.distance_km ? q.distance_km + ' km' : '—'}</span>
                    <span className="text-emerald-400">{fmt(q.price_cash_pix)} pix</span>
                    <span className="text-blue-400">{fmt(q.price_card)} cartao</span>
                    <span className="text-zinc-600">{new Date(q.created_at).toLocaleDateString('pt-BR')}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => viewPdf(q.id, q.client_name)} className="btn-ghost !px-3 !py-2" title="Ver PDF"><Eye size={15} /></button>
                <button onClick={() => downloadPdf(q.id, q.client_name)} className="btn-ghost !px-3 !py-2" title="Baixar PDF"><Download size={15} /></button>
                <button onClick={() => handleDelete(q.id)} className="btn-danger !px-3 !py-2" title="Excluir"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl h-[85vh] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 gap-2">
              <h3 className="text-sm font-medium text-zinc-100 truncate">Orcamento{previewName ? ` - ${previewName}` : ''}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => downloadPdfFromUrl(previewUrl, previewName)} className="btn-ghost !px-3 !py-2" title="Baixar PDF"><Download size={15} /></button>
                <button onClick={() => window.open(previewUrl, '_blank')} className="btn-ghost !px-3 !py-2" title="Abrir em nova aba"><ExternalLink size={15} /></button>
                <button onClick={closePreview} className="btn-ghost !px-3 !py-2" title="Fechar"><X size={18} /></button>
              </div>
            </div>
            <iframe src={previewUrl} title="Visualizar orcamento" className="w-full flex-1 bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}
