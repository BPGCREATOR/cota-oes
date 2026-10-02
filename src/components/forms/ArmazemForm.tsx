import React from 'react';
import { Warehouse, CheckSquare, Layers, Calendar, BarChart3 } from 'lucide-react';
import { ArmazemData } from '../../types/logistics';

interface ArmazemFormProps {
  data: ArmazemData;
  onChange: (data: ArmazemData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ArmazemForm: React.FC<ArmazemFormProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const toggleServico = (key: keyof ArmazemData['servicosAdicionais']) => {
    onChange({
      ...data,
      servicosAdicionais: {
        ...data.servicosAdicionais,
        [key]: !data.servicosAdicionais[key],
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              Módulo de Armazenagem & Hub Logístico
            </span>
            <h2 className="text-2xl font-bold mt-2">Parâmetros de Armazém Geral & Fulfillment</h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Defina o modelo tributário/operacional, volume de posições, tipo de paletização e serviços de valor agregado requeridos.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <Warehouse className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* 1. Modalidade e Localização de Preferência */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center font-bold">1</span>
          Tipo de Armazenagem & Região Alvo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'geral', title: 'Armazém Geral (Carga Seca)', desc: 'Armazenagem padrão para produtos industrializados' },
            { id: 'filial_fiscal', title: 'Filial Fiscal / Operador Logístico', desc: 'Abertura de inscrição estadual para incentivo fiscal' },
            { id: 'alfandegado_clia', title: 'Porto Seco / CLIA Alfandegado', desc: 'DAP / DTA suspensão de tributos e desembaraço' },
            { id: 'cross_docking', title: 'Cross-Docking Rápido', desc: 'Transbordo sem estocagem prolongada (giro até 48h)' },
            { id: 'climatizado', title: 'Armazém Climatizado / Anvisa', desc: 'Alimentos, cosméticos, fármacos e química fina' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => onChange({ ...data, tipoArmazenagem: item.id as any })}
              className={`p-4 rounded-2xl border cursor-pointer transition select-none ${
                data.tipoArmazenagem === item.id
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs ring-1 ring-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-sm">{item.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Cidade / Microrregião de Preferência
            </label>
            <input
              type="text"
              placeholder="Ex: Cajamar, Betim, Itajaí, Duque de Caxias..."
              value={data.cidadePreferencia}
              onChange={(e) => onChange({ ...data, cidadePreferencia: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Estado (UF)
            </label>
            <input
              type="text"
              maxLength={2}
              placeholder="SP, MG, SC, RJ..."
              value={data.ufPreferencia}
              onChange={(e) => onChange({ ...data, ufPreferencia: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 2. Capacidade e Métricas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center font-bold">2</span>
          Métricas de Armazenagem & Paletes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Métrica Base Contratada
            </label>
            <select
              value={data.metricaPrincipal}
              onChange={(e) => onChange({ ...data, metricaPrincipal: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="posicoes_palete">Posições-Palete (Estrutura Porta-Paletes)</option>
              <option value="area_m2">Área Dedicada em M²</option>
              <option value="volume_m3">Volume em M³</option>
              <option value="toneladas">Toneladas (Carga Pesada)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Quantidade Necessária ({data.metricaPrincipal.replace('_', ' ')}) *
            </label>
            <input
              type="number"
              placeholder="Ex: 500"
              value={data.quantidadeMetrica || ''}
              onChange={(e) => onChange({ ...data, quantidadeMetrica: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Padrão do Palete / Unitização
            </label>
            <select
              value={data.tipoPalete}
              onChange={(e) => onChange({ ...data, tipoPalete: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="pbr">Palete PBR (1,00m x 1,20m)</option>
              <option value="euro">Palete Euro (0,80m x 1,20m)</option>
              <option value="descartavel">Palete Descartável / One-Way</option>
              <option value="carga_batida">Carga Batida / Sem Paletização</option>
            </select>
          </div>
        </div>

        {/* Giro Estimado */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recebimento / Inbound Previsto (Mês)
            </label>
            <input
              type="number"
              placeholder="Ex: 200 paletes/mês"
              value={data.recebimentoPrevistoMes || ''}
              onChange={(e) => onChange({ ...data, recebimentoPrevistoMes: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Expedição / Outbound Previsto (Mês)
            </label>
            <input
              type="number"
              placeholder="Ex: 180 paletes/mês"
              value={data.expedicaoPrevistaMes || ''}
              onChange={(e) => onChange({ ...data, expedicaoPrevistaMes: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tempo Médio de Giro (Dias)
            </label>
            <input
              type="number"
              placeholder="Ex: 30 dias"
              value={data.diasGiroEstoque || ''}
              onChange={(e) => onChange({ ...data, diasGiroEstoque: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 3. Serviços Adicionais (Checklist de Valor Agregado) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center font-bold">3</span>
          Serviços de Valor Agregado (VAS)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'pickingFracionado', label: 'Picking & Separação por Unidade / Caixa' },
            { key: 'kittingMontagem', label: 'Montagem de Kits (Kitting & Bundling)' },
            { key: 'etiquetagemInmetro', label: 'Etiquetagem, Selagem Fiscal ou Inmetro' },
            { key: 'reembalagemStrech', label: 'Aplicação de Filme Stretch / Reembalagem' },
            { key: 'integracaoWmsApi', label: 'Integração WMS com ERP via API / EDI' },
            { key: 'inventarioRotativo', label: 'Inventário Cíclico com Rastreabilidade de Lote' },
          ].map((serv) => (
            <div
              key={serv.key}
              onClick={() => toggleServico(serv.key as any)}
              className={`p-3 rounded-2xl border cursor-pointer transition select-none flex items-center gap-3 ${
                data.servicosAdicionais[serv.key as keyof typeof data.servicosAdicionais]
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  data.servicosAdicionais[serv.key as keyof typeof data.servicosAdicionais]
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                {data.servicosAdicionais[serv.key as keyof typeof data.servicosAdicionais] && (
                  <CheckSquare className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-xs font-semibold">{serv.label}</span>
            </div>
          ))}
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
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 transition cursor-pointer"
        >
          Continuar para Próxima Etapa
        </button>
      </div>
    </div>
  );
};
