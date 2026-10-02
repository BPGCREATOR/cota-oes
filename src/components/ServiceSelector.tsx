import React from 'react';
import { Check, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ServiceCategory } from '../types/logistics';

export interface ServiceCatalogItem {
  id: ServiceCategory;
  name: string; // Em MAIÚSCULAS
  description: string;
}

export const OFFICIAL_SERVICES: ServiceCatalogItem[] = [
  {
    id: 'multiplos_servicos',
    name: 'MÚLTIPLOS SERVIÇOS',
    description: 'COMBINAÇÃO INTEGRADA DE MÚLTIPLOS MODAIS E SERVIÇOS NA MESMA COTAÇÃO.',
  },
  {
    id: 'frete_aereo',
    name: 'FRETE AÉREO',
    description: 'ENVIOS URGENTES COM PRAZOS REDUZIDOS E CONEXÕES NACIONAIS / INTERNACIONAIS.',
  },
  {
    id: 'frete_rodoviario',
    name: 'FRETE RODOVIÁRIO',
    description: 'TRANSPORTE DE CARGA SOLTA OU CONTAINER.',
  },
  {
    id: 'frete_maritimo',
    name: 'FRETE MARÍTIMO',
    description: 'EXPORTAÇÃO OU IMPORTAÇÃO.',
  },
  {
    id: 'cabotagem',
    name: 'CABOTAGEM',
    description: 'NAVEGAÇÃO PELA COSTA BRASILEIRA PORTO-A-PORTO OU PORTA-A-PORTA.',
  },
  {
    id: 'armazenagem',
    name: 'ARMAZENAGEM',
    description: 'CARGA SOLTA, CONTAINER, CROSS DOCKING E PRE STACKING.',
  },
  {
    id: 'fitting',
    name: 'FITTING',
    description: 'VENDA E MONTAGEM DE FLEXITANKS.',
  },
];

interface ServiceSelectorProps {
  vendedorNome: string;
  codigoBriefing: string;
  selected: ServiceCategory[];
  onToggle: (serviceId: ServiceCategory) => void;
  onSelectSingle: (serviceId: ServiceCategory) => void;
  onProceed: () => void;
  onBack: () => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selected,
  onToggle,
  onSelectSingle,
  onProceed,
  onBack,
}) => {
  const isMultiMode = selected.includes('multiplos_servicos') || selected.length > 1;

  const handleItemClick = (id: ServiceCategory) => {
    if (id === 'multiplos_servicos') {
      if (selected.includes('multiplos_servicos')) {
        // Se desmarcar, volta para rodoviário padrão
        onSelectSingle('frete_rodoviario');
      } else {
        // Ativa múltiplos serviços
        onSelectSingle('multiplos_servicos');
      }
      return;
    }

    if (isMultiMode) {
      onToggle(id);
    } else {
      // Seleção direta simples
      onSelectSingle(id);
    }
  };

  const isValid = selected.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho Minimalista */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
          SELECIONE O SERVIÇO PARA COTAÇÃO
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
          ESCOLHA UMA DAS MODALIDADES ABAIXO PARA PROSSEGUIR COM A COLETA DE REQUISITOS
        </p>
      </div>

      {/* Lista Limpa dos Serviços em MAIÚSCULAS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        {OFFICIAL_SERVICES.map((serv) => {
          const isSelected = selected.includes(serv.id);

          return (
            <div
              key={serv.id}
              onClick={() => handleItemClick(serv.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex items-center justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-1 ring-blue-500/30 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs sm:text-sm tracking-wide text-slate-900 dark:text-white uppercase">
                    {serv.name}
                  </span>
                  {serv.id === 'multiplos_servicos' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 uppercase">
                      COMBINADO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">
                  {serv.description}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          );
        })}

        {/* Feedback caso selecione Múltiplos Serviços */}
        {selected.includes('multiplos_servicos') && (
          <div className="mt-3 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 uppercase">
            <strong>MODO MÚLTIPLOS SERVIÇOS ATIVO:</strong> VOCÊ PODE CLICAR E MARCAR MAIS DE UM SERVIÇO ACIMA PARA COMPOR A PROPOSTA COMBINADA.
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>VOLTAR AO VENDEDOR</span>
        </button>

        <button
          type="button"
          disabled={!isValid}
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer disabled:cursor-not-allowed uppercase"
        >
          <span>AVANÇAR PARA DADOS DO CLIENTE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
