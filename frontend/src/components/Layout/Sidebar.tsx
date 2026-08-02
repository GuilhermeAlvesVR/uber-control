import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Navigation, Wallet, Fuel, Wrench,
  Receipt, Target, FileText, Car, Settings, ChevronLeft, ChevronRight, Menu, X, Gauge, ClipboardList
} from 'lucide-react';

const menu = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/jornada', icon: Navigation, label: 'Jornada' },
  { to: '/caixa', icon: Wallet, label: 'Caixa' },
  { to: '/abastecimentos', icon: Fuel, label: 'Abastecimentos' },
  { to: '/manutencoes', icon: Wrench, label: 'Manutencoes' },
  { to: '/despesas', icon: Receipt, label: 'Despesas' },
  { to: '/metas', icon: Target, label: 'Metas' },
  { to: '/orcamentos', icon: ClipboardList, label: 'Orcamentos' },
  { to: '/relatorios', icon: FileText, label: 'Relatorios' },
  { to: '/veiculo', icon: Car, label: 'Meu Veiculo' },
  { to: '/configuracoes', icon: Settings, label: 'Configuracoes' },
];

export default function Sidebar({ collapsed, onToggleCollapsed }: { collapsed: boolean; onToggleCollapsed: (v: boolean) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className={`flex items-center gap-3 h-16 px-4 border-b border-white/5 ${collapsed ? 'justify-center md:px-2' : ''}`}>
        <button onClick={() => { setMobileOpen(false); onToggleCollapsed(!collapsed); }} className="hidden md:block text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer shrink-0">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'md:hidden' : ''}`}>
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_4px_16px_-2px_rgba(245,158,11,0.6)]">
            <Gauge size={20} className="text-zinc-950" />
          </div>
          <span className="text-amber-400 font-bold text-base tracking-tight truncate">Controle Uber</span>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden ml-auto text-zinc-400 hover:text-zinc-100 cursor-pointer">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 md:py-4 space-y-1 px-2">
        {menu.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.6)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              } ${collapsed ? 'md:justify-center md:px-0' : ''}`
            }
          >
            <Icon size={19} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-white/5">
        <div className="chip w-full justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-zinc-900/90 backdrop-blur rounded-xl text-zinc-400 border border-white/5 cursor-pointer"
      >
        <Menu size={22} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed left-0 top-0 h-full bg-zinc-900/90 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col transition-all duration-300
        md:top-4 md:bottom-4 md:h-auto md:ml-4 md:rounded-2xl md:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.8)]
        ${collapsed ? 'md:w-16' : 'md:w-60'}
        ${mobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>
    </>
  );
}
