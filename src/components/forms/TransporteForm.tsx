import React from 'react';
import { Truck, ShieldAlert, Thermometer, Maximize2, Shield, Box } from 'lucide-react';
import { TransporteData, CepAddress } from '../../types/logistics';
import { CepField } from '../CepField';

interface TransporteFormProps {
  data: TransporteData;
  onChange: (data: TransporteData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TransporteForm: React.FC<TransporteFormProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const updateColeta = (coleta: CepAddress) => {
    onChange({ ...data, coleta });
  };

  const updateEntrega = (entrega: CepAddress) => {
    onChange({ ...data, entrega });
  };

  const updateOvaDesova = (ovaDesova: any) => {
    onChange({ ...data, ovaDesova });
  };

  const isFormValid = () => {
    return (
      Boolean(data.coleta.cep) &&
      Boolean(data.coleta.cidade) &&
      Boolean(data.entrega.cep) &&
      Boolean(data.entrega.cidade) &&
      Boolean(data.descricaoMercadoria) &&
      data.pesoBrutoKg > 0
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho da Categoria */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              Módulo de Transporte Rodoviário
            </span>
            <h2 className="text-2xl font-bold mt-2">Parâmetros Operacionais de Transporte</h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Preencha a rota com busca inteligente de CEP, selecione o modal e informe as restrições de gerenciamento de risco e carga.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <Truck className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* 1. Modalidade e Tipo de Veículo */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center font-bold">1</span>
          Tipo de Operação & Veículo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'lotacao_ftl', title: 'Lotação Completa (FTL)', desc: 'Veículo exclusivo para o frete' },
            { id: 'fracionado_ltl', title: 'Carga Fracionada (LTL)', desc: 'Compartilhado por cubagem/peso' },
            { id: 'puxada_container', title: 'Puxada de Container', desc: 'Porto / Terminal retroportuário' },
            { id: 'dedicado', title: 'Operação Dedicada', desc: 'Frota fixa e contrato contínuo' },
          ].map((op) => (
            <div
              key={op.id}
              onClick={() => onChange({ ...data, tipoOperacao: op.id as any })}
              className={`p-4 rounded-2xl border cursor-pointer transition select-none ${
                data.tipoOperacao === op.id
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-2xs ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-sm">{op.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{op.desc}</div>
            </div>
          ))}
        </div>

        {/* Condicional se for Puxada de Container */}
        {data.tipoOperacao === 'puxada_container' && (
          <div className="p-5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-semibold text-sm">
              <Box className="w-4 h-4" />
              Especificações do Container
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tamanho & Tipo do Equipamento
                </label>
                <select
                  value={data.containerTamanho || '40_hc'}
                  onChange={(e) => onChange({ ...data, containerTamanho: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="20_dry">20' Dry Standard</option>
                  <option value="40_dry">40' Dry Standard</option>
                  <option value="40_hc">40' High Cube (HC)</option>
                  <option value="40_reefer">40' Reefer (Refrigerado)</option>
                  <option value="especial">Especial (Open Top / Flat Rack)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Terminal de Retirada do Vazio
                </label>
                <input
                  type="text"
                  placeholder="Ex: Terminal BTP / Santos Brasil"
                  value={data.terminalRetiradaVazio || ''}
                  onChange={(e) => onChange({ ...data, terminalRetiradaVazio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Terminal de Devolução do Vazio / Cheio
                </label>
                <input
                  type="text"
                  placeholder="Ex: Depot Ecoporto / DP World"
                  value={data.terminalDevolucaoVazio || ''}
                  onChange={(e) => onChange({ ...data, terminalDevolucaoVazio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Veículo e Carroceria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Veículo Indicado
            </label>
            <select
              value={data.tipoVeiculo}
              onChange={(e) => onChange({ ...data, tipoVeiculo: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="carreta_ls">Carreta LS (3 eixos - até 27 Ton)</option>
              <option value="vanderleia">Vanderléia (3 eixos distanciados - até 30 Ton)</option>
              <option value="bitrem">Bitrem / Bitrenzão (7 eixos - até 38 Ton)</option>
              <option value="rodotrem">Rodotrem (9 eixos - até 50 Ton)</option>
              <option value="truck">Truck 6x2 (até 14 Ton)</option>
              <option value="tooco">Toco 4x2 (até 6 Ton)</option>
              <option value="vuc">VUC - Veículo Urbano de Carga (até 3.5 Ton)</option>
              <option value="utilitario">Utilitário / Fiorino / Van</option>
              <option value="prancha_rebaixada">Prancha Rebaixada (Carga Indivisível)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Carroceria Requerida
            </label>
            <select
              value={data.tipoCarroceria}
              onChange={(e) => onChange({ ...data, tipoCarroceria: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="sider_cortina">Sider (Cortina Lateral para Empilhadeira)</option>
              <option value="bau_fechado">Baú Fechado (Carga Seca)</option>
              <option value="grade_baixa">Grade Baixa (Carga Solta / Chapas / Bags)</option>
              <option value="graneleiro">Graneleiro (Grãos / Big Bags)</option>
              <option value="porta_container">Porta-Container (Bug / Chassi com Locks)</option>
              <option value="refrigerado">Refrigerado / Frigorífico (Controle Térmico)</option>
              <option value="prancha">Prancha Especial</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Endereços com CEP Automático (Coleta e Entrega) */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center font-bold">2</span>
          Rota Logística (Coleta, Entrega e Ova/Desova)
        </h3>

        {/* Ponto de Coleta */}
        <CepField
          label="Ponto de Coleta (Origem)"
          helperText="Informe o CEP da indústria, CD ou armazém de origem para preenchimento imediato"
          value={data.coleta}
          onChange={updateColeta}
          required={true}
        />

        {/* Ponto de Entrega */}
        <CepField
          label="Ponto de Entrega (Destino)"
          helperText="Informe o CEP do cliente final, obra ou centro de distribuição de destino"
          value={data.entrega}
          onChange={updateEntrega}
          required={true}
        />

        {/* Condicional Ova / Desova */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.temOvaDesova}
                onChange={(e) =>
                  onChange({
                    ...data,
                    temOvaDesova: e.target.checked,
                    ovaDesova: e.target.checked
                      ? data.ovaDesova || {
                          cep: '',
                          logradouro: '',
                          bairro: '',
                          cidade: '',
                          uf: '',
                          tipoManuseio: 'desova',
                          equipamentoNecessario: 'empilhadeira_padrao',
                        }
                      : undefined,
                  })
                }
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  Operação inclui Ova ou Desova de Contêiner / Vagão?
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Marque se houver necessidade de estufagem ou desestufagem em terminal ou armazém específico.
                </p>
              </div>
            </label>
          </div>

          {data.temOvaDesova && data.ovaDesova && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Operação no Ponto
                  </label>
                  <select
                    value={data.ovaDesova.tipoManuseio}
                    onChange={(e) =>
                      updateOvaDesova({ ...data.ovaDesova, tipoManuseio: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="desova">Desova (Esvaziamento do container)</option>
                    <option value="ova">Ova / Estufagem (Carregamento do container)</option>
                    <option value="ambos">Ova e Desova (Ciclo completo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Maquinário Requerido
                  </label>
                  <select
                    value={data.ovaDesova.equipamentoNecessario}
                    onChange={(e) =>
                      updateOvaDesova({ ...data.ovaDesova, equipamentoNecessario: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="empilhadeira_padrao">Empilhadeira Padrão (2.5t - 4t)</option>
                    <option value="reach_stacker">Reach Stacker (Pátio de Containers)</option>
                    <option value="guindaste">Guindaste / Munck para Carga Pesada</option>
                    <option value="manual">Manual com Ajudantes Especializados</option>
                  </select>
                </div>
              </div>

              <CepField
                label="Local da Ova / Desova"
                helperText="Endereço exato onde o container será ovado ou desovado"
                value={data.ovaDesova}
                onChange={(addr) =>
                  updateOvaDesova({
                    ...data.ovaDesova,
                    ...addr,
                  })
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Características da Carga */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center font-bold">3</span>
          Especificações da Mercadoria & Carga
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descrição da Mercadoria / Produto *
            </label>
            <input
              type="text"
              placeholder="Ex: Peças automotivas, Bobinas de aço, Polietileno..."
              value={data.descricaoMercadoria || ''}
              onChange={(e) => onChange({ ...data, descricaoMercadoria: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Peso Bruto Total (kg) *
            </label>
            <input
              type="number"
              placeholder="Ex: 24000"
              value={data.pesoBrutoKg || ''}
              onChange={(e) => onChange({ ...data, pesoBrutoKg: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Valor da Nota Fiscal (R$) *
            </label>
            <input
              type="number"
              placeholder="Ex: 180000"
              value={data.valorNotaFiscal || ''}
              onChange={(e) => onChange({ ...data, valorNotaFiscal: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Volume Cubado Estimado (m³) (opcional)
            </label>
            <input
              type="number"
              placeholder="Ex: 65"
              value={data.cubagemM3 || ''}
              onChange={(e) => onChange({ ...data, cubagemM3: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Quantidade de Volumes / Paletes (opcional)
            </label>
            <input
              type="number"
              placeholder="Ex: 26 paletes"
              value={data.quantidadeVolumes || ''}
              onChange={(e) => onChange({ ...data, quantidadeVolumes: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Condicionais Especiais (Perigosa, Refrigerada, Excesso de Dimensões) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tratamentos Especiais da Carga
          </h4>

          {/* Carga Perigosa */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.isCargaPerigosa}
                onChange={(e) =>
                  onChange({
                    ...data,
                    isCargaPerigosa: e.target.checked,
                    cargaPerigosaInfo: e.target.checked
                      ? data.cargaPerigosaInfo || { classeImo: '', numeroOnu: '', grupoEmbalagem: '' }
                      : undefined,
                  })
                }
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                  Carga Perigosa (Regulamentada pela ANTT / IMO)
                </span>
              </div>
            </label>

            {data.isCargaPerigosa && data.cargaPerigosaInfo && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Número ONU *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: ONU 1203"
                    value={data.cargaPerigosaInfo.numeroOnu}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        cargaPerigosaInfo: { ...data.cargaPerigosaInfo!, numeroOnu: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Classe de Risco IMO *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Classe 3 - Líquidos Inflamáveis"
                    value={data.cargaPerigosaInfo.classeImo}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        cargaPerigosaInfo: { ...data.cargaPerigosaInfo!, classeImo: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Grupo de Embalagem
                  </label>
                  <select
                    value={data.cargaPerigosaInfo.grupoEmbalagem}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        cargaPerigosaInfo: { ...data.cargaPerigosaInfo!, grupoEmbalagem: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900"
                  >
                    <option value="">Selecione...</option>
                    <option value="I">Grupo I (Alto Risco)</option>
                    <option value="II">Grupo II (Médio Risco)</option>
                    <option value="III">Grupo III (Baixo Risco)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Carga Refrigerada */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.isCargaRefrigerada}
                onChange={(e) =>
                  onChange({
                    ...data,
                    isCargaRefrigerada: e.target.checked,
                    cargaRefrigeradaInfo: e.target.checked
                      ? data.cargaRefrigeradaInfo || { temperaturaMinC: 2, temperaturaMaxC: 8, exigeTermografo: true }
                      : undefined,
                  })
                }
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
              />
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-500" />
                <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                  Carga Refrigerada / Congelada (Controle de Temperatura)
                </span>
              </div>
            </label>

            {data.isCargaRefrigerada && data.cargaRefrigeradaInfo && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Temperatura Mínima (°C)
                  </label>
                  <input
                    type="number"
                    value={data.cargaRefrigeradaInfo.temperaturaMinC}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        cargaRefrigeradaInfo: {
                          ...data.cargaRefrigeradaInfo!,
                          temperaturaMinC: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-cyan-300 dark:border-cyan-900 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Temperatura Máxima (°C)
                  </label>
                  <input
                    type="number"
                    value={data.cargaRefrigeradaInfo.temperaturaMaxC}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        cargaRefrigeradaInfo: {
                          ...data.cargaRefrigeradaInfo!,
                          temperaturaMaxC: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-cyan-300 dark:border-cyan-900 bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={data.cargaRefrigeradaInfo.exigeTermografo}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          cargaRefrigeradaInfo: {
                            ...data.cargaRefrigeradaInfo!,
                            exigeTermografo: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600"
                    />
                    <span>Exige Termógrafo com relatório</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Carga com Excesso */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.isCargaComExcesso}
                onChange={(e) =>
                  onChange({
                    ...data,
                    isCargaComExcesso: e.target.checked,
                    cargaExcessoInfo: e.target.checked
                      ? data.cargaExcessoInfo || { comprimentoMetros: 14, larguraMetros: 2.6, alturaMetros: 3.2 }
                      : undefined,
                  })
                }
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                  Carga com Excesso de Dimensões (Exige AET - Autorização Especial)
                </span>
              </div>
            </label>

            {data.isCargaComExcesso && data.cargaExcessoInfo && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Comprimento (metros)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.cargaExcessoInfo.comprimentoMetros}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        cargaExcessoInfo: {
                          ...data.cargaExcessoInfo!,
                          comprimentoMetros: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-900 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Largura (metros)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.cargaExcessoInfo.larguraMetros}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        cargaExcessoInfo: {
                          ...data.cargaExcessoInfo!,
                          larguraMetros: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-900 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Altura (metros)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.cargaExcessoInfo.alturaMetros}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        cargaExcessoInfo: {
                          ...data.cargaExcessoInfo!,
                          alturaMetros: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-900 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gerenciamento de Risco e Segurança */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Exigências da Gerenciadora de Risco (PGR)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: 'rastreadorDuplo', label: 'Rastreador Duplo / Satelital' },
              { key: 'travaQuintaRoda', label: 'Trava Eletrônica de 5ª Roda' },
              { key: 'sensorDesengate', label: 'Sensor de Desengate de Carreta' },
              { key: 'escoltaArmada', label: 'Escolta Armada Obrigatória' },
            ].map((sec) => (
              <label
                key={sec.key}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={Boolean((data.exigenciaSeguranca as any)?.[sec.key])}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      exigenciaSeguranca: {
                        ...data.exigenciaSeguranca,
                        [sec.key]: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>{sec.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navegação entre Etapas */}
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
          disabled={!isFormValid()}
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer disabled:cursor-not-allowed"
        >
          Continuar para Próxima Etapa
        </button>
      </div>
    </div>
  );
};
