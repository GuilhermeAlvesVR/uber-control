import { useState, useEffect } from 'react';
import { DollarSign, Target, Layers, Phone, ImagePlus, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import api from '../services/api';

export default function Settings() {
  const { toast } = useToast();
  const [gasPrice, setGasPrice] = useState('5.89');
  const [dailyGoal, setDailyGoal] = useState('200');
  const [monthlyGoal, setMonthlyGoal] = useState('6000');
  const [phone, setPhone] = useState('');
  const [quoteArt, setQuoteArt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/settings/').then(r => {
      setGasPrice(r.data.gas_price?.toString() || '5.89');
      setDailyGoal(r.data.daily_goal?.toString() || '200');
      setMonthlyGoal(r.data.monthly_goal?.toString() || '6000');
      setPhone(r.data.phone || '');
      setQuoteArt(r.data.quote_art || '');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSave() {    try {
      await api.put('/auth/settings/', {
        gas_price: parseFloat(gasPrice),
        daily_goal: parseFloat(dailyGoal),
        monthly_goal: parseFloat(monthlyGoal),
        phone: phone || null,
        quote_art: quoteArt || null,
      });
      toast('Configuracoes salvas!');
    } catch { toast('Erro ao salvar configuracoes', 'error'); }
  }

  function handleArtFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setQuoteArt(`data:${file.type};base64,${(result.split(',')[1] || '')}`);
      toast('Arte carregada. Clique em Salvar para aplicar.');
    };
    reader.readAsDataURL(file);
  }

  const isArtImage = /^data:image\/(png|jpe?g)/.test(quoteArt);

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
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg"><Phone size={20} className="text-zinc-950" /></div>
            <div><p className="text-sm font-medium text-zinc-100">Telefone para contato</p><p className="text-xs text-zinc-500">Aparece no cabecalho do PDF de orcamentos</p></div></div>
          <div className="relative"><span className="absolute left-4 top-3 text-zinc-500"><Phone size={15} /></span>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input !pl-10" placeholder="(11) 99999-9999" /></div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg"><ImagePlus size={20} className="text-zinc-950" /></div>
            <div><p className="text-sm font-medium text-zinc-100">Arte de Fundo do Orcamento</p><p className="text-xs text-zinc-500">PDF A4 ou imagem PNG/JPG impressos como fundo, com nome/telefone/rotas/valores por cima</p></div></div>

          {isArtImage ? (
            <div className="relative overflow-hidden rounded-xl border border-zinc-700">
              <img src={quoteArt} alt="Arte de fundo" className="w-full max-h-56 object-cover" />
              <button type="button" onClick={() => { setQuoteArt(''); toast('Arte removida. Salve para confirmar.'); }}
                className="absolute top-2 right-2 p-2 rounded-lg bg-zinc-900/80 text-zinc-300 hover:text-red-400" title="Remover arte">
                <Trash2 size={16} /></button>
            </div>
          ) : quoteArt ? (
            <p className="text-sm text-zinc-400">PDF de arte carregado. Salve para aplicar ao orcamento.</p>
          ) : null}

          <label className="block cursor-pointer">
            <span className="btn-primary w-full inline-flex items-center justify-center gap-2">
              <ImagePlus size={16} /> {quoteArt ? 'Trocar Arte' : 'Enviar Arte (PDF ou imagem)'}
            </span>
            <input type="file" accept=".pdf,image/png,image/jpeg" onChange={handleArtFile} className="hidden" />
          </label>
          {quoteArt && <button type="button" onClick={() => { setQuoteArt(''); }} className="w-full text-sm text-zinc-400 hover:text-red-400">Remover arte</button>}
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