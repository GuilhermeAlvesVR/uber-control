import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Navigation, Wallet, Fuel, Wrench,
  Receipt, Target, FileText, Car, Settings, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

const menu = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/jornada', icon: Navigation, label: 'Jornada' },
  { to: '/caixa', icon: Wallet, label: 'Caixa' },
  { to: '/abastecimentos', icon: Fuel, label: 'Abastecimentos' },
  { to: '/manutencoes', icon: Wrench, label: 'Manutencoes' },
  { to: '/despesas', icon: Receipt, label: 'Despesas' },
  { to: '/metas', icon: Target, label: 'Metas' },
  { to: '/relatorios', icon: FileText, label: 'Relatorios' },
  { to: '/veiculo', icon: Car, label: 'Meu Veiculo' },
  { to: '/configuracoes', icon: Settings, label: 'Configuracoes' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 h-12 md:h-16 px-3 md:px-4 border-b border-zinc-800">
        <button onClick={() => { setMobileOpen(false); setCollapsed(!collapsed); }} className="hidden md:block text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <span className="text-amber-400 font-bold text-base md:text-lg tracking-tight truncate">Controle Uber</span>
        <button onClick={() => setMobileOpen(false)} className="md:hidden ml-auto text-zinc-400 hover:text-zinc-100 cursor-pointer">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 md:py-4 space-y-1 px-2">
        {menu.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 md:py-2.5 rounded-lg transition-all duration-200 text-sm ${
                isActive ? 'bg-amber-400/10 text-amber-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-zinc-900/90 rounded-lg text-zinc-400 cursor-pointer"
      >
        <Menu size={22} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed left-0 top-0 h-full bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col transition-all duration-300
        md:flex ${collapsed ? 'md:w-16' : 'md:w-60'}
        ${mobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex flex-col h-full">
          {sidebarContent}
        </div>
        <div className="flex md:hidden flex-col h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
