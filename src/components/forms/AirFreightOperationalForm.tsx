import React from 'react';
import { Plane, ArrowRight, ArrowLeft, PackageCheck, AlertCircle, ShieldAlert } from 'lucide-react';
import { AirFreightData, BriefingData } from '../../types/logistics';
import { AirportCombobox } from './AirportCombobox';
import { detectFlightScope } from '../../data/airports';
import { AIR_FREIGHT_PACKAGING_OPTIONS } from '../../data/airFreightPackaging';

interface AirFreightOperationalFormProps {
  briefing: BriefingData;
  data: AirFreightData;
  onChange: (updated: AirFreightData) => void;
  onProceed: () => void;
  onBack: () => void;
}

export const AirFreightOperationalForm: React.FC<AirFreightOperationalFormProps> = ({
  briefing,
  data,
  onChange,
  onProceed,
  onBack,
}) => {
  const isDuplicateAirport = Boolean(
    data.aeroportoOrigem &&
    data.aeroportoDestino &&
    data.aeroportoOrigem.trim().toUpperCase() === data.aeroportoDestino.trim().toUpperCase()
  );

  // 8 Validações Obrigatórias Estritas conforme solicitado pelo usuário:
  // 1. ORIGEM
  // 2. DESTINO (e diferente de origem)
  // 3. TIPO DE CARGA
  // 4. TIPO DE EMBALAGEM
  // 5. QUANTIDADE DE VOLUME (> 0)
  // 6. PESO (> 0)
  // 7. VALOR (> 0)
  // 8. MEDIDA TOTAL (preenchida)
  const isOrigemValid = Boolean(data.aeroportoOrigem && data.aeroportoOrigem.trim().length > 0);
  const isDestinoValid = Boolean(data.aeroportoDestino && data.aeroportoDestino.trim().length > 0);
  const isDifferentAirports = isOrigemValid && isDestinoValid && !isDuplicateAirport;
  const isTipoCargaValid = Boolean(data.tipoCarga && data.tipoCarga.trim().length > 0);
  const isTipoEmbalagemValid = Boolean(data.tipoEmbalagem && data.tipoEmbalagem.trim().length > 0);
  const isQtdVolumesValid = Boolean(data.quantidadeVolumes && data.quantidadeVolumes > 0);
  const isPesoValid = Boolean(data.pesoBrutoKg && data.pesoBrutoKg > 0);
  const isValorValid = Boolean(data.valorMercadoria && data.valorMercadoria > 0);
  const isMedidaTotalValid = Boolean(data.medidaTotal && data.medidaTotal.trim().length > 0);

  const isValid =
    isOrigemValid &&
    isDestinoValid &&
    isDifferentAirports &&
    isTipoCargaValid &&
    isTipoEmbalagemValid &&
    isQtdVolumesValid &&
    isPesoValid &&
    isValorValid &&
    isMedidaTotalValid;

  // Lista dos campos pendentes para orientação clara do operador
  const missingFields: string[] = [];
  if (!isOrigemValid) missingFields.push('ORIGEM');
  if (!isDestinoValid) missingFields.push('DESTINO');
  if (isOrigemValid && isDestinoValid && !isDifferentAirports) missingFields.push('ORIGEM E DESTINO DEVEM SER DIFERENTES');
  if (!isTipoCargaValid) missingFields.push('TIPO DE CARGA');
  if (!isTipoEmbalagemValid) missingFields.push('TIPO DE EMBALAGEM');
  if (!isQtdVolumesValid) missingFields.push('QUANTIDADE DE VOLUME');
  if (!isPesoValid) missingFields.push('PESO');
  if (!isValorValid) missingFields.push('VALOR');
  if (!isMedidaTotalValid) missingFields.push('MEDIDA TOTAL');

  // Ajuste inteligente: ao preencher medida unitária (ex: 120 x 80 x 100 CM), sugere medida total calculada em M³
  const handleMedidaUnitariaChange = (val: string) => {
    const updated = { ...data, medidaUnitaria: val };
    const match = val.match(/(\d+(?:[.,]\d+)?)\s*[xX*]\s*(\d+(?:[.,]\d+)?)\s*[xX*]\s*(\d+(?:[.,]\d+)?)/);
    if (match && (!data.medidaTotal || data.medidaTotal.includes('M³'))) {
      const c = parseFloat(match[1].replace(',', '.'));
      const l = parseFloat(match[2].replace(',', '.'));
      const a = parseFloat(match[3].replace(',', '.'));
      if (c > 0 && l > 0 && a > 0) {
        const volUnitM3 = (c * l * a) / 1000000;
        const vols = data.quantidadeVolumes || 1;
        const totalM3 = (volUnitM3 * vols).toFixed(3);
        updated.medidaTotal = `${totalM3} M³`;
      }
    }
    onChange(updated);
  };

  const handleVolumesChange = (vols: number) => {
    const updated = { ...data, quantidadeVolumes: vols };
    if (data.medidaUnitaria) {
      const match = data.medidaUnitaria.match(/(\d+(?:[.,]\d+)?)\s*[xX*]\s*(\d+(?:[.,]\d+)?)\s*[xX*]\s*(\d+(?:[.,]\d+)?)/);
      if (match && (!data.medidaTotal || data.medidaTotal.includes('M³'))) {
        const c = parseFloat(match[1].replace(',', '.'));
        const l = parseFloat(match[2].replace(',', '.'));
        const a = parseFloat(match[3].replace(',', '.'));
        if (c > 0 && l > 0 && a > 0 && vols > 0) {
          const volUnitM3 = (c * l * a) / 1000000;
          const totalM3 = (volUnitM3 * vols).toFixed(3);
          updated.medidaTotal = `${totalM3} M³`;
        }
      }
    }
    onChange(updated);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 uppercase">
      {/* Cabeçalho Unificado Padrão */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 uppercase">
          MODAL AÉREO • COTAÇÃO DE CARGA
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
          DETALHES DO FRETE AÉREO
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 uppercase">
          CLIENTE: <strong className="text-blue-600 uppercase">{briefing.clienteRazaoSocial || 'NÃO INFORMADO'}</strong> • VENDEDOR: <strong className="uppercase">{briefing.vendedorNome}</strong>
        </p>
      </div>

      {/* Card Principal - Layout Unificado */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Bloco 1: Duas Caixas de Validação de Dados de Aeroportos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                  1. ROTA AÉREA (AEROPORTOS COMERCIAIS)
                </h3>
                <p className="text-xs text-slate-500 uppercase">
                  SELEÇÃO DE EMBARQUE E DESEMBARQUE GLOBAL
                </p>
              </div>
            </div>

            {data.aeroportoOrigem && data.aeroportoDestino && (
              <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                {data.aeroportoOrigem.split('—')[0]?.trim()} ➔ {data.aeroportoDestino.split('—')[0]?.trim()}
              </span>
            )}
          </div>

          {/* Grid com as duas caixas de validação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
            {/* Caixa 1: Aeroporto de Origem */}
            <AirportCombobox
              label="ORIGEM (AEROPORTO DE EMBARQUE)"
              value={data.aeroportoOrigem}
              otherAirportValue={data.aeroportoDestino}
              placeholder="BUSQUE OU SELECIONE O AEROPORTO DE ORIGEM..."
              onChange={(aeroportoOrigem) => {
                const autoScope = detectFlightScope(aeroportoOrigem, data.aeroportoDestino);
                onChange({ ...data, aeroportoOrigem, tipoEnvio: autoScope });
              }}
              required
            />

            {/* Caixa 2: Aeroporto de Destino */}
            <AirportCombobox
              label="DESTINO (AEROPORTO DE DESEMBARQUE)"
              value={data.aeroportoDestino}
              otherAirportValue={data.aeroportoOrigem}
              placeholder="BUSQUE OU SELECIONE O AEROPORTO DE DESTINO..."
              onChange={(aeroportoDestino) => {
                const autoScope = detectFlightScope(data.aeroportoOrigem, aeroportoDestino);
                onChange({ ...data, aeroportoDestino, tipoEnvio: autoScope });
              }}
              required
            />
          </div>

          {isDuplicateAirport && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 uppercase font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ATENÇÃO: O AEROPORTO DE ORIGEM E O AEROPORTO DE DESTINO NÃO PODEM SER IGUAIS.</span>
            </div>
          )}
        </div>

        {/* Bloco 2: Especificações da Carga e Modalidade */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                2. ESPECIFICAÇÕES DA CARGA E CARACTERÍSTICAS
              </h3>
              <p className="text-xs text-slate-500 uppercase">
                DADOS DE PESO, DIMENSÕES E REQUISITOS OBRIGATÓRIOS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Âmbito do Voo - Ajustado automaticamente pela rota */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                ÂMBITO DO FRETE
              </label>
              <select
                value={data.tipoEnvio || 'nacional'}
                onChange={(e) =>
                  onChange({ ...data, tipoEnvio: e.target.value as AirFreightData['tipoEnvio'] })
                }
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-blue-400/80 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase cursor-pointer"
              >
                <option value="nacional">NACIONAL (DOMÉSTICO)</option>
                <option value="internacional_importacao">INTERNACIONAL (IMPORTAÇÃO)</option>
                <option value="internacional_exportacao">INTERNACIONAL (EXPORTAÇÃO)</option>
                <option value="internacional_cross_trade">INTERNACIONAL (CROSS-TRADE)</option>
                <option value="internacional">INTERNACIONAL</option>
              </select>
            </div>

            {/* Tipo de Carga Aérea (Campo Livre e Editável, iniciando em branco) */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                TIPO DE CARGA <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                placeholder="DIGITE O TIPO DE CARGA..."
                value={data.tipoCarga || ''}
                onChange={(e) => onChange({ ...data, tipoCarga: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 uppercase font-semibold placeholder:text-slate-400 ${
                  !isTipoCargaValid
                    ? 'border-amber-400 focus:ring-amber-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* Tipo de Embalagem - Validação de Dados (Obrigatório) */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                TIPO DE EMBALAGEM <span className="text-blue-600">*</span>
              </label>
              <select
                value={data.tipoEmbalagem || AIR_FREIGHT_PACKAGING_OPTIONS[0].value}
                onChange={(e) => onChange({ ...data, tipoEmbalagem: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase cursor-pointer"
              >
                {AIR_FREIGHT_PACKAGING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantidade de Volumes (Obrigatório) */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                QUANTIDADE DE VOLUME <span className="text-blue-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="EX: 1"
                value={data.quantidadeVolumes ?? ''}
                onChange={(e) => handleVolumesChange(parseInt(e.target.value, 10) || 0)}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 uppercase font-semibold ${
                  !isQtdVolumesValid
                    ? 'border-amber-400 focus:ring-amber-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* Peso Bruto Total (Obrigatório) */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                PESO BRUTO TOTAL (KG) <span className="text-blue-600">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="EX: 350.5"
                value={data.pesoBrutoKg || ''}
                onChange={(e) =>
                  onChange({ ...data, pesoBrutoKg: parseFloat(e.target.value) || 0 })
                }
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 uppercase font-semibold ${
                  !isPesoValid
                    ? 'border-amber-400 focus:ring-amber-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* Novo Campo 1: MEDIDA UNITÁRIA */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                MEDIDA UNITÁRIA (C x L x A CM)
              </label>
              <input
                type="text"
                placeholder="EX: 120 x 80 x 100 CM"
                value={data.medidaUnitaria || ''}
                onChange={(e) => handleMedidaUnitariaChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-semibold placeholder:text-slate-400"
              />
            </div>

            {/* Novo Campo 2: MEDIDA TOTAL (Obrigatório) */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                MEDIDA TOTAL <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                placeholder="EX: 0.96 M³ OU 120x80x200"
                value={data.medidaTotal || ''}
                onChange={(e) => onChange({ ...data, medidaTotal: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 uppercase font-semibold placeholder:text-slate-400 ${
                  !isMedidaTotalValid
                    ? 'border-amber-400 focus:ring-amber-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* Valor da Mercadoria (Obrigatório) */}
            <div className="sm:col-span-12">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                VALOR DA MERCADORIA (R$) <span className="text-blue-600">*</span>
              </label>
              <input
                type="number"
                step="100"
                placeholder="EX: 85000.00"
                value={data.valorMercadoria || ''}
                onChange={(e) =>
                  onChange({ ...data, valorMercadoria: parseFloat(e.target.value) || 0 })
                }
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 uppercase font-semibold ${
                  !isValorValid
                    ? 'border-amber-400 focus:ring-amber-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>

          {/* Serviços Porta a Porta Opcionais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
              <input
                type="checkbox"
                checked={Boolean(data.coletaOrigemPorta)}
                onChange={(e) => onChange({ ...data, coletaOrigemPorta: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase">
                INCLUIR COLETA NA ORIGEM (DOOR-TO-AIRPORT)
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
              <input
                type="checkbox"
                checked={Boolean(data.entregaDestinoPorta)}
                onChange={(e) => onChange({ ...data, entregaDestinoPorta: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase">
                INCLUIR ENTREGA NO DESTINO (AIRPORT-TO-DOOR)
              </span>
            </label>
          </div>

          {/* Observações da Operação Aérea */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
              OBSERVAÇÕES E PARTICULARIDADES DO FRETE AÉREO (OPCIONAL)
            </label>
            <textarea
              rows={2}
              placeholder="EX: VOO DIRETO PREFERENCIAL, HORÁRIO LIMITE DE CHEGADA NO TERMINAL DE CARGAS..."
              value={data.observacoesAereo || ''}
              onChange={(e) => onChange({ ...data, observacoesAereo: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>
        </div>
      </div>

      {/* Trava Informativa: Exibe os campos obrigatórios restantes para avançar */}
      {!isValid && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold uppercase text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>CAMPOS OBRIGATÓRIOS PENDENTES PARA LIBERAR O BOTÃO AVANÇAR:</span>
          </div>
          <p className="text-[11px] font-semibold uppercase text-amber-800/90 dark:text-amber-300/90">
            {missingFields.join(' • ')}
          </p>
        </div>
      )}

      {/* Navegação Padronizada com Trava Estrita */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition uppercase cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR</span>
        </button>

        <button
          type="button"
          disabled={!isValid}
          onClick={onProceed}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs transition uppercase ${
            isValid
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-70'
          }`}
          title={isValid ? 'AVANÇAR PARA A PRÓXIMA ETAPA' : `PREENCHA: ${missingFields.join(', ')}`}
        >
          <span>AVANÇAR</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
