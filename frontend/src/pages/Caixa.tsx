import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { Plus, ArrowUpRight, ArrowDownRight, Banknote, Smartphone, Wallet, Home, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { Transaction } from '../types';

const categories = ['combustivel','alimentacao','lavagem','manutencao','seguro','pedagio','uber','particular','sangria','outros'];
const catLabels: Record<string,string> = {combustivel:'Combustivel',alimentacao:'Alimentacao',lavagem:'Lavagem',manutencao:'Manutencao',seguro:'Seguro',pedagio:'Pedagio',uber:'Uber',particular:'Particular',sangria:'Sangria',outros:'Outros'};
const formCategories = categories.filter(c => c !== 'sangria');

export default function Caixa() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState({balance:0,incomes:0,expenses:0,uber_balance:0,cash_balance:0,sangria:0});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({type:'income',category:'outros',amount:'',description:'',date:new Date().toISOString().split('T')[0]});

  useEffect(() => { load(); },[]);
  async function load() {
    try {
      const [t,r] = await Promise.all([api.get('/finances/transactions/'), api.get('/finances/balance/')]);
      setTransactions(t.data.results ?? t.data);
      setBalance(r.data);
    } catch { toast('Erro ao carregar transacoes', 'error'); }
  }
  async function handleSubmit(e:FormEvent) {
    e.preventDefault();
    try {
      await api.post('/finances/transactions/', {...form,amount:parseFloat(form.amount)});
      toast('Transacao registrada com sucesso');
      setShowForm(false);
      setForm({type:'income',category:'outros',amount:'',description:'',date:new Date().toISOString().split('T')[0]});
      load();
    } catch { toast('Erro ao registrar transacao', 'error'); }
  }
  async function handleDelete(id: number) {
    try {
      await api.delete(`/finances/transactions/${id}/`);
      toast('Transacao excluida');
      load();
    } catch { toast('Erro ao excluir', 'error'); }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'><h1 className='text-2xl font-bold text-zinc-100'>Caixa</h1>
        <div className='flex gap-2'>
          <button onClick={() => { setForm({type:'expense',category:'sangria',amount:'',description:'',date:new Date().toISOString().split('T')[0]}); setShowForm(true); }} className='flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-all cursor-pointer text-sm'><Home size={16} /> Sangria</button>
          <button onClick={() => setShowForm(true)} className='flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer text-sm'><Plus size={16} /> Nova</button>
        </div>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        <div className='bg-zinc-900 rounded-xl border border-zinc-800 p-5'><div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center'><Banknote size={20} className='text-emerald-400' /></div></div><p className='text-xs text-zinc-500'>Saldo Total</p><p className='text-2xl font-bold text-zinc-100'>R\$ {balance.balance.toFixed(2)}</p></div>
        <div className='bg-zinc-900 rounded-xl border border-zinc-800 p-5'><div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center'><Smartphone size={20} className='text-blue-400' /></div></div><p className='text-xs text-zinc-500'>Saldo Conta Uber</p><p className='text-2xl font-bold text-blue-400'>R\$ {balance.uber_balance.toFixed(2)}</p></div>
        <div className='bg-zinc-900 rounded-xl border border-zinc-800 p-5'><div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center'><Wallet size={20} className='text-emerald-400' /></div></div><p className='text-xs text-zinc-500'>Saldo em Dinheiro</p><p className='text-2xl font-bold text-emerald-400'>R\$ {balance.cash_balance.toFixed(2)}</p></div>
        <div className='bg-zinc-900 rounded-xl border border-zinc-800 p-5'><div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center'><Home size={20} className='text-amber-400' /></div></div><p className='text-xs text-zinc-500'>Sangria (guardado)</p><p className='text-2xl font-bold text-amber-400'>R\$ {balance.sangria.toFixed(2)}</p></div>
        <div className='bg-zinc-900 rounded-xl border border-zinc-800 p-5'><div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center'><ArrowUpRight size={20} className='text-emerald-400' /></div></div><p className='text-xs text-zinc-500'>Entradas</p><p className='text-2xl font-bold text-emerald-400'>R\$ {balance.incomes.toFixed(2)}</p></div>
        <div className='bg-zinc-900 rounded-xl border border-zinc-800 p-5'><div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center'><ArrowDownRight size={20} className='text-red-400' /></div></div><p className='text-xs text-zinc-500'>Saidas</p><p className='text-2xl font-bold text-red-400'>R\$ {balance.expenses.toFixed(2)}</p></div>
      </div>
      {showForm && <form onSubmit={handleSubmit} className='bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div><label className='text-sm text-zinc-400 mb-1 block'>Tipo</label>
            <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className='w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100'>
              <option value='income'>Entrada</option><option value='expense'>Saida</option>
            </select></div>
          <div><label className='text-sm text-zinc-400 mb-1 block'>Categoria</label>
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className='w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100'>
              {formCategories.map(c=><option key={c} value={c}>{catLabels[c]}</option>)}
            </select></div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div><label className='text-sm text-zinc-400 mb-1 block'>Valor</label><input type='number' step='0.01' value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required className='w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100' /></div>
          <div><label className='text-sm text-zinc-400 mb-1 block'>Data</label><input type='date' value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required className='w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100' /></div>
        </div>
        <div><label className='text-sm text-zinc-400 mb-1 block'>Descricao</label><input type='text' value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className='w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100' /></div>
        <div className='flex gap-3'><button type='submit' className='px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer'>Salvar</button>
          <button type='button' onClick={()=>setShowForm(false)} className='px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all cursor-pointer'>Cancelar</button></div>
      </form>}
      <div className='bg-zinc-900 rounded-xl border border-zinc-800'>
        <div className='p-4 border-b border-zinc-800'><h2 className='text-sm font-medium text-zinc-100'>Historico</h2></div>
        <div className='divide-y divide-zinc-800'>
          {transactions.map((t) => (
            <div key={t.id} className='flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors group'>
              <div className='flex items-center gap-3'>
                <div className={'w-8 h-8 rounded-lg flex items-center justify-center ' + (t.type==='income' ? 'bg-emerald-500/20' : 'bg-red-500/20')}>
                  {t.type==='income' ? <ArrowUpRight size={16} className='text-emerald-400' /> : <ArrowDownRight size={16} className='text-red-400' />}
                </div>
                <div><p className='text-sm text-zinc-100'>{catLabels[t.category]||t.category}</p><p className='text-xs text-zinc-500'>{t.description||''}</p></div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='text-right'><p className={'text-sm font-medium ' + (t.type==='income' ? 'text-emerald-400' : 'text-red-400')}>{t.type==='income' ? '+' : '-'}R\$ {Number(t.amount).toFixed(2)}</p><p className='text-xs text-zinc-500'>{new Date(t.date).toLocaleDateString('pt-BR')}</p></div>
                <button onClick={() => handleDelete(t.id)} className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded cursor-pointer' title='Excluir'><Trash2 size={14} className='text-red-400' /></button>
              </div>
            </div>
          ))}
          {transactions.length===0 && <p className='text-zinc-500 text-sm p-4 text-center'>Nenhuma transacao</p>}
        </div>
      </div>
    </div>
  );
}

