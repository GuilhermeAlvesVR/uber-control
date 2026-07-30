import { useState, useEffect } from 'react';
import api from '../services/api';
import { Download, Calendar, FileText } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { ReportData } from '../types';

export default function Reports() {
  const { toast } = useToast();
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [end, setEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    api.get('/reports/', { params: { start, end } }).then(r => setData(r.data)).catch(() => toast('Erro ao carregar relatorio', 'error'));
  }, [start, end]);

  function exportCSV() {
    if (!data) return;
    const headers = 'Metrica,Valor\n';
    const rows = ([
      ['Receita Total', data.total_revenue],
      ['Despesas', data.total_expenses],
      ['Lucro Liquido', data.net_profit],
      ['KM Rodados', data.total_km],
      ['Dias Trabalhados', data.days_worked],
      ['Media por Dia', data.avg_per_day],
      ['Media por Hora', data.avg_per_hour],
      ['Media por KM', data.avg_per_km],
    ] as [string, number][]).map(r => r[0] + ',R$' + r[1].toFixed(2)).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_' + start + '_' + end + '.csv';
    a.click();
  }

  function exportPDF() {
    window.open(`/api/reports/pdf/?start=${start}&end=${end}`, '_blank');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Relatorios</h1>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-all cursor-pointer text-sm"><FileText size={16} /> Exportar PDF</button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all cursor-pointer text-sm"><Download size={16} /> Exportar CSV</button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div className="flex items-center gap-2"><Calendar size={16} className="text-zinc-400" />
          <input type="date" value={start} onChange={e => setStart(e.target.value)} className="bg-zinc-800 px-3 py-1.5 rounded-lg text-zinc-100 text-sm border border-zinc-700" /></div>
        <span className="text-zinc-500">ate</span>
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="bg-zinc-800 px-3 py-1.5 rounded-lg text-zinc-100 text-sm border border-zinc-700" />
      </div>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReportCard label="Receita Total" value={data.total_revenue} color="text-emerald-400" />
          <ReportCard label="Despesas" value={data.total_expenses} color="text-red-400" />
          <ReportCard label="Lucro Liquido" value={data.net_profit} color="text-amber-400" />
          <ReportCard label="KM Rodados" value={data.total_km} color="text-blue-400" suffix=" km" />
          <ReportCard label="Dias Trabalhados" value={data.days_worked} color="text-violet-400" suffix=" dias" />
          <ReportCard label="Media por Dia" value={data.avg_per_day} color="text-zinc-100" />
          <ReportCard label="Media por Hora" value={data.avg_per_hour} color="text-zinc-100" />
          <ReportCard label="Media por KM" value={data.avg_per_km} color="text-zinc-100" />
        </div>
      )}
    </div>
  );
}

function ReportCard({ label, value, color, suffix = '' }: { label: string; value: number; color: string; suffix?: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={'text-lg font-semibold ' + color}>R$ {value.toFixed(2)}{suffix}</p>
    </div>
  );
}