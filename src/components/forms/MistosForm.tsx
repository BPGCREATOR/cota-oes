import React from 'react';
import { Layers, Clock, ShieldCheck } from 'lucide-react';
import { ServicosMistosData } from '../../types/logistics';

interface MistosFormProps {
  data: ServicosMistosData;
  onChange: (data: ServicosMistosData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MistosForm: React.FC<MistosFormProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const toggleModal = (modal: string) => {
    const exists = data.modaisEnvolvidos.includes(modal);
    const updated = exists
      ? data.modaisEnvolvidos.filter((m) => m !== modal)
      : [...data.modaisEnvolvidos, modal];
    onChange({ ...data, modaisEnvolvidos: updated });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              Módulo de Serviços Mistos & Multimodal
            </span>
            <h2 className="text-2xl font-bold mt-2">Operações Integradas & Transbordos</h2>
            <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Projete soluções combinando múltiplos modais, pontos de consolidação intermediários e prazos de trânsito estritos.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <Layers className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* 1. Modais Envolvidos */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
          Modais & Elos da Cadeia
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Selecione todos os modais que participam desta operação:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              'Rodoviário Lotação',
              'Ferroviário / Vagão',
              'Marítimo / Cabotagem',
              'Aéreo Carga',
              'Armazém de Trânsito',
              'Terminal Portuário',
              'Balsa Fluvial',
              'Duto / Granel',
            ].map((modal) => {
              const active = data.modaisEnvolvidos.includes(modal);
              return (
                <div
                  key={modal}
                  onClick={() => toggleModal(modal)}
                  className={`p-3 rounded-xl border cursor-pointer select-none text-xs font-semibold text-center transition ${
                    active
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {modal}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Descrição Detalhada do Desenho Operacional *
          </label>
          <textarea
            rows={4}
            placeholder="Descreva a dinâmica: Ex: Coleta na fábrica em Campinas/SP via truck, consolidação em armazém em Santos, embarque de cabotagem para Suape e entrega final com vuc em Recife..."
            value={data.descricaoOperacao}
            onChange={(e) => onChange({ ...data, descricaoOperacao: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Ponto Intermediário de Transbordo (se houver)
            </label>
            <input
              type="text"
              placeholder="Ex: Hub Logístico Campinas ou Pátio Ferroviário"
              value={data.pontoTransbordoIntermediario || ''}
              onChange={(e) => onChange({ ...data, pontoTransbordoIntermediario: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Transit Time Máximo Aceitável (Dias)
            </label>
            <input
              type="number"
              value={data.transitTimeMaximoDias || ''}
              onChange={(e) => onChange({ ...data, transitTimeMaximoDias: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={data.exigeFrotaDedicada}
              onChange={(e) => onChange({ ...data, exigeFrotaDedicada: e.target.checked })}
              className="w-4 h-4 rounded text-amber-600"
            />
            <span>Operação exige frota 100% dedicada com motoristas fixos treinados</span>
          </label>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md shadow-amber-500/20 transition cursor-pointer"
        >
          Continuar para Próxima Etapa
        </button>
      </div>
    </div>
  );
};
