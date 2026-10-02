import React from 'react';
import { ShieldCheck, Box, FileCheck, MapPin } from 'lucide-react';
import { FittingData, CepAddress } from '../../types/logistics';
import { CepField } from '../CepField';

interface FittingFormProps {
  data: FittingData;
  onChange: (data: FittingData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const FittingForm: React.FC<FittingFormProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              Módulo de Fitting & Peação Técnica
            </span>
            <h2 className="text-2xl font-bold mt-2">Proteção Especial & Adequação de Carga</h2>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Defina os serviços de amarração técnica (lashing), revestimento térmico, bolsas de ar (dunnage), flexitanks e certificados com ART.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* 1. Tipo de Fitting */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs flex items-center justify-center font-bold">1</span>
          Tipo de Fitting Requerido
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'thermal_liner', title: 'Thermal Liner (Isomanta)', desc: 'Revestimento térmico completo para conter variação climática' },
            { id: 'lashing_peacao', title: 'Peação e Travamento (Lashing)', desc: 'Cintas de alta tenacidade, catracas e correntes para maquinário' },
            { id: 'flexitank_liquidos', title: 'Instalação de Flexitank', desc: 'Tanque flexível para transporte de líquidos não perigosos a granel' },
            { id: 'liner_bag_granel', title: 'Liner Bag para Granéis Sólidos', desc: 'Revestimento plástico para grãos, polímeros e pós em container seco' },
            { id: 'dunnage_airbags', title: 'Dunnage Bags (Bolsas Infláveis)', desc: 'Preenchimento de vazios entre paletes para amortecimento marítimo' },
            { id: 'bercos_madeira', title: 'Berços e Calços de Madeira Tratada', desc: 'Fabricação sob medida com carimbo fitossanitário MAPA / HT' },
          ].map((f) => (
            <div
              key={f.id}
              onClick={() => onChange({ ...data, tipoFitting: f.id as any })}
              className={`p-4 rounded-2xl border cursor-pointer transition select-none ${
                data.tipoFitting === f.id
                  ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-2xs ring-1 ring-purple-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs sm:text-sm">{f.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Container Alvo
            </label>
            <select
              value={data.tipoContainer}
              onChange={(e) => onChange({ ...data, tipoContainer: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="20_pes">Contêiner de 20 Pés</option>
              <option value="40_pes">Contêiner de 40 Pés (Standard / HC)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Quantidade de Boxes *
            </label>
            <input
              type="number"
              placeholder="Ex: 5"
              value={data.quantidadeContainers || ''}
              onChange={(e) => onChange({ ...data, quantidadeContainers: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Fornecimento do Material
            </label>
            <select
              value={data.fornecimentoMaterial}
              onChange={(e) => onChange({ ...data, fornecimentoMaterial: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="incluso_pelo_prestador">Material Incluso pelo Prestador</option>
              <option value="fornecido_pelo_cliente">Material Fornecido pelo Cliente (Mão de Obra)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Local e Certificações Técnicas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs flex items-center justify-center font-bold">2</span>
          Local de Execução & Normas de Segurança
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'terminal_portuario', label: 'Terminal Portuário / Retroárea' },
            { id: 'fabrica_cliente', label: 'Planta / Fábrica do Cliente' },
            { id: 'armazem_parceiro', label: 'Armazém Parceiro Credenciado' },
          ].map((loc) => (
            <div
              key={loc.id}
              onClick={() => onChange({ ...data, localExecucao: loc.id as any })}
              className={`p-3 rounded-xl border cursor-pointer text-xs font-semibold text-center select-none ${
                data.localExecucao === loc.id
                  ? 'border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {loc.label}
            </div>
          ))}
        </div>

        {/* Endereço com CEP para execução */}
        <CepField
          label="Endereço de Execução do Fitting"
          helperText="Informe o CEP exato onde a equipe especializada irá aplicar os materiais"
          value={data.enderecoExecucao || { cep: '', logradouro: '', bairro: '', cidade: '', uf: '' }}
          onChange={(addr) => onChange({ ...data, enderecoExecucao: addr })}
          required={false}
        />

        {/* Certificações */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.exigeNr35EspacoConfinado}
              onChange={(e) => onChange({ ...data, exigeNr35EspacoConfinado: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600"
            />
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Exige Equipe com NR-33 (Espaço Confinado) e NR-35 (Altura)
              </span>
              <p className="text-[11px] text-slate-500">Documentação e ASOs rigorosos para acesso ao terminal</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.exigeLaudoArtEngenheiro}
              onChange={(e) => onChange({ ...data, exigeLaudoArtEngenheiro: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600"
            />
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Laudo Técnico de Peação com ART / CREA
              </span>
              <p className="text-[11px] text-slate-500">Certificado emitido e assinado por engenheiro mecânico/naval</p>
            </div>
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
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-500/20 transition cursor-pointer"
        >
          Continuar para Próxima Etapa
        </button>
      </div>
    </div>
  );
};
