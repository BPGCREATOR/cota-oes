import React from 'react';
import { Truck, Sun, Moon, ShieldCheck, UserCheck, RefreshCw, FileText } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNewBriefing: () => void;
  activeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onNewBriefing,
  activeCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onNewBriefing}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white uppercase">
                COTAÇÕES <span className="text-blue-600">BPG</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block uppercase">
              BRIEFING INTERATIVO & COTAÇÕES LOGÍSTICAS
            </p>
          </div>
        </div>

        {/* Ações e Perfil */}
        <div className="flex items-center gap-3">
          {/* Perfil Comercial Ativo */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs uppercase">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              CO
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-none uppercase">
                CARLOS OLIVEIRA
              </span>
              <span className="text-[10px] text-slate-400 uppercase">VENDEDOR COMERCIAL</span>
            </div>
          </div>

          {/* Toggle Dark Mode */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={darkMode ? 'MODO CLARO' : 'MODO ESCURO'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Botão Novo Briefing */}
          <button
            type="button"
            onClick={onNewBriefing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition cursor-pointer uppercase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">NOVO BRIEFING</span>
          </button>
        </div>
      </div>
    </header>
  );
};
