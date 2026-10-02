import React from 'react';
import { Anchor, Ship, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { CabotagemData } from '../../types/logistics';

interface CabotagemFormProps {
  data: CabotagemData;
  onChange: (data: CabotagemData) => void;
  onNext: () => void;
  onBack: () => void;
}

const BRAZIL_PORTS = [
  'Porto de Santos (SP)',
  'Porto de Paranaguá (PR)',
  'Porto de Itajaí / Navegantes (SC)',
  'Porto de Rio Grande (RS)',
  'Porto do Rio de Janeiro (RJ)',
  'Porto de Vitória (ES)',
  'Porto de Salvador (BA)',
  'Porto de Suape (PE)',
  'Porto de Pecém (CE)',
  'Porto de Vila do Conde (PA)',
  'Porto de Manaus (AM)',
];

export const CabotagemForm: React.FC<CabotagemFormProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              Módulo de Cabotagem (Marítimo Nacional)
            </span>
            <h2 className="text-2xl font-bold mt-2">Navegação Costeira & Portos</h2>
            <p className="text-cyan-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Defina os portos de embarque e desembarque, modalidade da perna (porta a porta ou porto a porto), frotas e prazos de demurrage.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <Anchor className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* 1. Portos e Modalidade */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 text-xs flex items-center justify-center font-bold">1</span>
          Rota Marítima & Escopo da Operação
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Porto de Origem (Embarque) *
            </label>
            <select
              value={data.portoOrigem}
              onChange={(e) => onChange({ ...data, portoOrigem: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {BRAZIL_PORTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Porto de Destino (Desembarque) *
            </label>
            <select
              value={data.portoDestino}
              onChange={(e) => onChange({ ...data, portoDestino: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {BRAZIL_PORTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Modalidade de Contratação */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Modalidade de Transporte Contratada
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'porta_a_porta_integrado', title: 'Porta a Porta (Completo)', desc: 'Coleta rodo + Marítimo + Entrega rodo no destino' },
              { id: 'porto_a_porto', title: 'Porto a Porto (Pier to Pier)', desc: 'Cliente entrega e retira o box no terminal' },
              { id: 'porta_a_porto', title: 'Porta a Porto', desc: 'Coleta na fábrica até o porto de destino' },
              { id: 'porto_a_porta', title: 'Porto a Porta', desc: 'Do porto de embarque até a porta do cliente final' },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => onChange({ ...data, modalidade: m.id as any })}
                className={`p-4 rounded-2xl border cursor-pointer transition select-none ${
                  data.modalidade === m.id
                    ? 'border-cyan-600 bg-cyan-50/60 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200 shadow-2xs ring-1 ring-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm">{m.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Equipamentos e Carga */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 text-xs flex items-center justify-center font-bold">2</span>
          Equipamentos & Volume Marítimo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Equipamento
            </label>
            <select
              value={data.tipoContainer}
              onChange={(e) => onChange({ ...data, tipoContainer: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="40_hc">40' High Cube (HC)</option>
              <option value="20_dry">20' Dry Standard</option>
              <option value="40_dry">40' Dry Standard</option>
              <option value="40_reefer">40' Reefer (Refrigerado)</option>
              <option value="breakbulk">Carga Projeto / Breakbulk</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Qtd Containers / Mês *
            </label>
            <input
              type="number"
              placeholder="Ex: 10"
              value={data.quantidadeContainersMes || ''}
              onChange={(e) => onChange({ ...data, quantidadeContainersMes: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Peso Médio por Box (Ton) *
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 22.5"
              value={data.pesoMedioPorContainerTon || ''}
              onChange={(e) => onChange({ ...data, pesoMedioPorContainerTon: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Free Time / Demurrage */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              Free Time de Demurrage na Origem (Dias livres)
            </label>
            <input
              type="number"
              value={data.freeTimeOrigemDias}
              onChange={(e) => onChange({ ...data, freeTimeOrigemDias: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              Free Time de Demurrage no Destino (Dias livres)
            </label>
            <input
              type="number"
              value={data.freeTimeDestinoDias}
              onChange={(e) => onChange({ ...data, freeTimeDestinoDias: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={data.seguroMaritimoIncluso}
              onChange={(e) => onChange({ ...data, seguroMaritimoIncluso: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-600"
            />
            <span>Cotar com Seguro Marítimo RCTR-C / Adicional de Avaria Grossa Incluso</span>
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
          className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm shadow-md shadow-cyan-500/20 transition cursor-pointer"
        >
          Continuar para Próxima Etapa
        </button>
      </div>
    </div>
  );
};
