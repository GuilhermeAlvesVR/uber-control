import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Navigation, Wallet, Fuel, Wrench,
  Receipt, Target, FileText, Car, Settings, ChevronLeft, ChevronRight
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

  return (
    <aside className={`fixed left-0 top-0 h-full bg-zinc-900 border-r border-zinc-800 transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center gap-3 h-16 px-4 border-b border-zinc-800">
        {!collapsed && <span className="text-amber-400 font-bold text-lg tracking-tight">Controle Uber</span>}
        <button onClick={() => setCollapsed(!collapsed)} className={`${collapsed ? 'mx-auto' : 'ml-auto'} text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer`}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {menu.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                isActive ? 'bg-amber-400/10 text-amber-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`
            }
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}