import React from 'react';
import { User, Layers, Building2, MapPin, Package, FileText, CheckCircle2, Plane } from 'lucide-react';
import { BriefingData } from '../types/logistics';
import { formatCurrencyBRL } from '../services/cepService';

interface ScopeSummaryHeaderProps {
  briefing: BriefingData;
  currentStepIndex: number;
}

export const SERVICE_TITLES_MAP: Record<string, string> = {
  frete_rodoviario: 'FRETE RODOVIÁRIO',
  frete_maritimo: 'FRETE MARÍTIMO',
  frete_aereo: 'FRETE AÉREO',
  armazenagem: 'ARMAZENAGEM',
  cabotagem: 'CABOTAGEM',
  fitting: 'FITTING',
  multiplos_servicos: 'MÚLTIPLOS SERVIÇOS',
};

export const ScopeSummaryHeader: React.FC<ScopeSummaryHeaderProps> = ({
  briefing,
  currentStepIndex,
}) => {
  const hasServices = briefing.servicosSelecionados.length > 0;
  const hasClient = Boolean(briefing.clienteRazaoSocial.trim());
  const hasRoute = Boolean(
    briefing.dadosTransporte?.coleta.cidade && briefing.dadosTransporte?.entrega.cidade
  );
  const hasAirRoute = Boolean(
    briefing.dadosFreteAereo?.aeroportoOrigem && briefing.dadosFreteAereo?.aeroportoDestino
  );
  const hasCargo = Boolean(
    briefing.dadosTransporte?.pesoBrutoKg && briefing.dadosTransporte.pesoBrutoKg > 0
  );

  return (
    <div className="w-full bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Título do Escopo & Código */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
              ESCOPO DO BRIEFING
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {briefing.codigo}
            </span>
          </div>

          {/* Itens progressivos do Escopo */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs">
            {/* 1. Vendedor */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-400 text-[11px]">VENDEDOR:</span>
              <strong className="text-white uppercase font-bold text-[11px] truncate max-w-[140px]">
                {briefing.vendedorNome || 'NÃO DEFINIDO'}
              </strong>
            </div>

            {/* 2. Serviços */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              hasServices
                ? 'bg-blue-950/40 border-blue-800/80 text-blue-200'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-500'
            }`}>
              <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-400 text-[11px]">SERVIÇO(S):</span>
              <div className="flex items-center gap-1">
                {hasServices ? (
                  briefing.servicosSelecionados.map((s) => (
                    <span
                      key={s}
                      className="font-bold text-[10px] uppercase bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30"
                    >
                      {SERVICE_TITLES_MAP[s] || s.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="italic text-[11px] text-slate-500">Pendente</span>
                )}
              </div>
            </div>

            {/* 3. Cliente */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              hasClient
                ? 'bg-slate-800/90 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-500'
            }`}>
              <Building2 className={`w-3.5 h-3.5 shrink-0 ${hasClient ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-slate-400 text-[11px]">CLIENTE:</span>
              <strong className={`uppercase text-[11px] truncate max-w-[160px] ${hasClient ? 'text-white' : 'text-slate-500 font-normal italic'}`}>
                {hasClient ? briefing.clienteRazaoSocial : 'Pendente'}
              </strong>
            </div>

            {/* 4. Rota Terrestre (se preenchida) */}
            {hasRoute && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-200 animate-in fade-in">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400 text-[11px]">ROTA:</span>
                <span className="font-bold text-[11px] text-amber-300">
                  {briefing.dadosTransporte?.coleta.cidade}/{briefing.dadosTransporte?.coleta.uf} ➔ {briefing.dadosTransporte?.entrega.cidade}/{briefing.dadosTransporte?.entrega.uf}
                </span>
              </div>
            )}

            {/* 4.1 Rota Aérea (se preenchida) */}
            {hasAirRoute && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-200 animate-in fade-in">
                <Plane className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-slate-400 text-[11px]">ROTA AÉREA:</span>
                <span className="font-bold text-[11px] text-sky-300">
                  {briefing.dadosFreteAereo?.aeroportoOrigem.split('—')[0].trim()} ✈ {briefing.dadosFreteAereo?.aeroportoDestino.split('—')[0].trim()}
                </span>
              </div>
            )}

            {/* 5. Carga (se preenchida) */}
            {hasCargo && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-200 animate-in fade-in">
                <Package className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-bold text-[11px] text-cyan-300">
                  {briefing.dadosTransporte?.pesoBrutoKg.toLocaleString('pt-BR')} kg
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
