import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Calculator, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Truck, 
  Warehouse, 
  Anchor, 
  Layers, 
  ShieldCheck, 
  Printer, 
  Upload, 
  FileCheck,
  TrendingUp,
  Plane,
  User
} from 'lucide-react';
import { BriefingData, SupplierCostItem } from '../types/logistics';
import { formatCurrencyBRL } from '../services/cepService';
import { 
  generateSupplierRfqCsv, 
  generateSupplierRfqExcelHtml, 
  downloadFile,
  parseAirportInfo,
  calculateAirMetrics
} from '../services/exportService';
import { generateProtectedAirFreightXlsx } from '../services/excelExportService';
import { SERVICE_TITLES_MAP } from './ScopeSummaryHeader';

interface BriefingReviewViewProps {
  briefing: BriefingData;
  onUpdateBriefing: (updated: BriefingData) => void;
  onBack: () => void;
  onReset: () => void;
}

export const BriefingReviewView: React.FC<BriefingReviewViewProps> = ({
  briefing,
  onUpdateBriefing,
  onBack,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'resumo' | 'rfq_fornecedores' | 'cotacao_final'>('resumo');
  const [uploadedTemplateName, setUploadedTemplateName] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'BRL' | 'EUR' | 'ARS'>('USD');

  // Estado para cadastro de custos de fornecedor
  const [newSupplier, setNewSupplier] = useState<Partial<SupplierCostItem>>({
    fornecedorNome: '',
    servico: briefing.servicosSelecionados[0] || 'frete_rodoviario',
    descricaoServico: 'Frete e operação logística completa',
    custoBase: 0,
    custoPedagio: 0,
    custoAjudantes: 0,
    prazoTransitTimeDias: 2,
    validadeDias: 5,
    condicaoPagamento: '15 dias após entrega',
    margemAplicadaPercentual: 18,
  });

  const handleExportCsv = () => {
    const csv = generateSupplierRfqCsv(briefing);
    downloadFile(csv, `RFQ_Fornecedores_${briefing.codigo}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportExcel = async () => {
    if (briefing.servicosSelecionados.includes('frete_aereo')) {
      const blob = await generateProtectedAirFreightXlsx(briefing, selectedCurrency);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cotacao_Aerea_${briefing.codigo}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const html = generateSupplierRfqExcelHtml(briefing);
      downloadFile(html, `RFQ_Fornecedores_${briefing.codigo}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
    }
  };

  const handleAddSupplierCost = () => {
    if (!newSupplier.fornecedorNome || !newSupplier.custoBase) return;

    const custoTotal = 
      Number(newSupplier.custoBase || 0) + 
      Number(newSupplier.custoPedagio || 0) + 
      Number(newSupplier.custoAjudantes || 0);

    const margem = Number(newSupplier.margemAplicadaPercentual || 15) / 100;
    const precoFinal = custoTotal / (1 - margem);

    const item: SupplierCostItem = {
      id: Math.random().toString(36).substring(2, 9),
      fornecedorNome: newSupplier.fornecedorNome,
      servico: newSupplier.servico || 'transporte',
      descricaoServico: newSupplier.descricaoServico || 'Operação Logística',
      custoBase: Number(newSupplier.custoBase || 0),
      custoPedagio: Number(newSupplier.custoPedagio || 0),
      custoAjudantes: Number(newSupplier.custoAjudantes || 0),
      custoTotal,
      prazoTransitTimeDias: Number(newSupplier.prazoTransitTimeDias || 2),
      validadeDias: Number(newSupplier.validadeDias || 5),
      condicaoPagamento: newSupplier.condicaoPagamento || '15 dias',
      observacoes: newSupplier.observacoes || '',
      margemAplicadaPercentual: Number(newSupplier.margemAplicadaPercentual || 18),
      precoFinalCliente: Math.round(precoFinal * 100) / 100,
    };

    onUpdateBriefing({
      ...briefing,
      status: 'valores_recebidos',
      custosFornecedores: [...briefing.custosFornecedores, item],
    });

    setNewSupplier({
      fornecedorNome: '',
      servico: briefing.servicosSelecionados[0] || 'transporte',
      descricaoServico: 'Frete e operação logística completa',
      custoBase: 0,
      custoPedagio: 0,
      custoAjudantes: 0,
      prazoTransitTimeDias: 2,
      validadeDias: 5,
      condicaoPagamento: '15 dias após entrega',
      margemAplicadaPercentual: 18,
    });
  };

  const handleRemoveSupplierCost = (id: string) => {
    onUpdateBriefing({
      ...briefing,
      custosFornecedores: briefing.custosFornecedores.filter((c) => c.id !== id),
    });
  };

  // Melhor cotação (menor custo / melhor margem)
  const bestSupplier = briefing.custosFornecedores.length > 0 
    ? [...briefing.custosFornecedores].sort((a, b) => a.custoTotal - b.custoTotal)[0] 
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Barra Consolidada do Briefing com Ações (Substitui o antigo bloco verde pelo formato limpo da barra vermelha) */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Itens do Escopo (Código, Vendedor, Serviço, Cliente, Rota) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* 1. Código do Briefing */}
            <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">ESCOPO</span>
              <strong className="text-xs font-mono font-bold text-white">{briefing.codigo}</strong>
            </div>

            {/* 2. Vendedor */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-400 text-[11px] uppercase">VENDEDOR:</span>
              <strong className="text-white uppercase font-bold text-[11px]">
                {briefing.vendedorNome || 'NÃO DEFINIDO'}
              </strong>
            </div>

            {/* 3. Serviço */}
            <div className="flex items-center gap-1.5 bg-blue-950/50 border border-blue-800/80 px-3 py-1.5 rounded-xl text-blue-200">
              <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-400 text-[11px] uppercase">SERVIÇO(S):</span>
              <div className="flex items-center gap-1">
                {briefing.servicosSelecionados.map((s) => (
                  <span
                    key={s}
                    className="font-bold text-[11px] uppercase bg-blue-600/40 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-500/30"
                  >
                    {SERVICE_TITLES_MAP[s] || s.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Cliente */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-emerald-200">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400 text-[11px] uppercase">CLIENTE:</span>
              <strong className="text-white uppercase font-bold text-[11px] truncate max-w-[200px]">
                {briefing.clienteRazaoSocial || 'NÃO INFORMADO'}
              </strong>
            </div>

            {/* 5. Rota Aérea (se Frete Aéreo) */}
            {briefing.servicosSelecionados.includes('frete_aereo') && briefing.dadosFreteAereo?.aeroportoOrigem && (
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-sky-500/40 px-3 py-1.5 rounded-xl text-sky-200">
                <Plane className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-slate-400 text-[11px] uppercase">ROTA AÉREA:</span>
                <span className="font-bold text-[11px] text-sky-300 uppercase">
                  {briefing.dadosFreteAereo.aeroportoOrigem.split('—')[0].trim()} ✈ {briefing.dadosFreteAereo.aeroportoDestino.split('—')[0].trim()}
                </span>
              </div>
            )}

            {/* 5.1 Rota Terrestre (se Rodoviário) */}
            {briefing.servicosSelecionados.some(s => ['frete_rodoviario', 'transporte'].includes(s)) && briefing.dadosTransporte?.coleta?.cidade && (
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-amber-500/40 px-3 py-1.5 rounded-xl text-amber-200">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400 text-[11px] uppercase">ROTA:</span>
                <span className="font-bold text-[11px] text-amber-300 uppercase">
                  {briefing.dadosTransporte.coleta.cidade}/{briefing.dadosTransporte.coleta.uf} ➔ {briefing.dadosTransporte.entrega.cidade}/{briefing.dadosTransporte.entrega.uf}
                </span>
              </div>
            )}
          </div>

          {/* Ações de Exportação Imediata - Limpas e Modernas */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer uppercase"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Gerar Planilha Fornecedores (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer uppercase"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        {[
          { id: 'resumo', label: '1. Resumo do Briefing Coletado' },
          { id: 'rfq_fornecedores', label: '2. Planilha & Envio aos Fornecedores' },
          { id: 'cotacao_final', label: `3. Retorno de Custos & Cotação Final (${briefing.custosFornecedores.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Resumo do Briefing */}
      {activeTab === 'resumo' && (
        <div className="space-y-6">
          {/* Transporte Rodoviário Card (Apenas se o serviço for rodoviário ou transporte) */}
          {briefing.servicosSelecionados.some(s => ['frete_rodoviario', 'transporte'].includes(s)) && briefing.dadosTransporte && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Transporte Rodoviário</h3>
                    <p className="text-xs text-slate-500">
                      Modal: {briefing.dadosTransporte.tipoOperacao.replace('_', ' ').toUpperCase()} | Veículo: {briefing.dadosTransporte.tipoVeiculo.toUpperCase()} ({briefing.dadosTransporte.tipoCarroceria.toUpperCase()})
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {briefing.dadosTransporte.pesoBrutoKg.toLocaleString('pt-BR')} kg
                </span>
              </div>

              {/* Rota */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Origem / Coleta
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {briefing.dadosTransporte.coleta.cidade} - {briefing.dadosTransporte.coleta.uf}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {briefing.dadosTransporte.coleta.logradouro}, {briefing.dadosTransporte.coleta.numero || 'S/N'} - {briefing.dadosTransporte.coleta.bairro}
                  </p>
                  <p className="text-xs font-mono text-slate-500 mt-1">
                    CEP: <strong>{briefing.dadosTransporte.coleta.cep}</strong> | Tipo: {briefing.dadosTransporte.coleta.tipoLocal}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Destino / Entrega
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {briefing.dadosTransporte.entrega.cidade} - {briefing.dadosTransporte.entrega.uf}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {briefing.dadosTransporte.entrega.logradouro}, {briefing.dadosTransporte.entrega.numero || 'S/N'} - {briefing.dadosTransporte.entrega.bairro}
                  </p>
                  <p className="text-xs font-mono text-slate-500 mt-1">
                    CEP: <strong>{briefing.dadosTransporte.entrega.cep}</strong> | Tipo: {briefing.dadosTransporte.entrega.tipoLocal}
                  </p>
                </div>
              </div>

              {/* Ova/Desova se houver */}
              {briefing.dadosTransporte.temOvaDesova && briefing.dadosTransporte.ovaDesova && (
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-xs">
                  <strong>Ova / Desova Inclusa:</strong> Operação de {briefing.dadosTransporte.ovaDesova.tipoManuseio.toUpperCase()} no CEP {briefing.dadosTransporte.ovaDesova.cep} ({briefing.dadosTransporte.ovaDesova.cidade}/{briefing.dadosTransporte.ovaDesova.uf}) com {briefing.dadosTransporte.ovaDesova.equipamentoNecessario}.
                </div>
              )}

              {/* Características e Gerenciamento de Risco */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  Mercadoria: {briefing.dadosTransporte.descricaoMercadoria}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  Valor NF: {formatCurrencyBRL(briefing.dadosTransporte.valorNotaFiscal)}
                </span>
                {briefing.dadosTransporte.isCargaPerigosa && (
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 font-bold">
                    ⚠️ ONU {briefing.dadosTransporte.cargaPerigosaInfo?.numeroOnu} (Classe {briefing.dadosTransporte.cargaPerigosaInfo?.classeImo})
                  </span>
                )}
                {briefing.dadosTransporte.isCargaRefrigerada && (
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 font-bold">
                    ❄️ {briefing.dadosTransporte.cargaRefrigeradaInfo?.temperaturaMinC}°C a {briefing.dadosTransporte.cargaRefrigeradaInfo?.temperaturaMaxC}°C
                  </span>
                )}
                {briefing.dadosTransporte.exigenciaSeguranca?.escoltaArmada && (
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold">
                    🛡️ Escolta Armada Requerida
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Frete Aéreo Card */}
          {briefing.servicosSelecionados.includes('frete_aereo') && briefing.dadosFreteAereo && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 uppercase">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base uppercase">Frete Aéreo</h3>
                    <p className="text-xs text-slate-500 uppercase">
                      {briefing.dadosFreteAereo.aeroportoOrigem || 'AEROPORTO ORIGEM'} ➔ {briefing.dadosFreteAereo.aeroportoDestino || 'AEROPORTO DESTINO'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 uppercase">
                  {briefing.dadosFreteAereo.tipoEnvio === 'internacional_importacao'
                    ? 'INTERNACIONAL (IMPORTAÇÃO)'
                    : briefing.dadosFreteAereo.tipoEnvio === 'internacional_exportacao'
                    ? 'INTERNACIONAL (EXPORTAÇÃO)'
                    : briefing.dadosFreteAereo.tipoEnvio === 'internacional_cross_trade'
                    ? 'INTERNACIONAL (CROSS-TRADE)'
                    : briefing.dadosFreteAereo.tipoEnvio === 'internacional'
                    ? 'INTERNACIONAL'
                    : 'NACIONAL (DOMÉSTICO)'} • {briefing.dadosFreteAereo.tipoCarga?.toUpperCase() || 'NÃO ESPECIFICADO'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block uppercase">Origem</span>
                  <strong className="text-slate-800 dark:text-slate-200 uppercase truncate block" title={briefing.dadosFreteAereo.aeroportoOrigem}>
                    {briefing.dadosFreteAereo.aeroportoOrigem?.split('—')[0]?.trim() || 'NÃO DEFINIDA'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block uppercase">Destino</span>
                  <strong className="text-slate-800 dark:text-slate-200 uppercase truncate block" title={briefing.dadosFreteAereo.aeroportoDestino}>
                    {briefing.dadosFreteAereo.aeroportoDestino?.split('—')[0]?.trim() || 'NÃO DEFINIDO'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block uppercase">Embalagem</span>
                  <strong className="text-slate-800 dark:text-slate-200 uppercase truncate block" title={briefing.dadosFreteAereo.tipoEmbalagem}>
                    {briefing.dadosFreteAereo.tipoEmbalagem || 'CAIXAS'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block uppercase">Volumes</span>
                  <strong className="text-slate-800 dark:text-slate-200">{briefing.dadosFreteAereo.quantidadeVolumes || 1} vol</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block uppercase">Peso Bruto</span>
                  <strong className="text-slate-800 dark:text-slate-200">{briefing.dadosFreteAereo.pesoBrutoKg || 0} kg</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block uppercase">Medida Total</span>
                  <strong className="text-slate-800 dark:text-slate-200 uppercase truncate block" title={briefing.dadosFreteAereo.medidaTotal}>
                    {briefing.dadosFreteAereo.medidaTotal || 'NÃO INFORMADA'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block uppercase">Valor Mercadoria</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(briefing.dadosFreteAereo.valorMercadoria || 0)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Armazém Card */}
          {briefing.servicosSelecionados.some(s => ['armazenagem', 'armazem'].includes(s)) && briefing.dadosArmazem && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <Warehouse className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Armazenagem & Hub</h3>
                    <p className="text-xs text-slate-500">
                      Região: {briefing.dadosArmazem.cidadePreferencia} - {briefing.dadosArmazem.ufPreferencia} | Tipo: {briefing.dadosArmazem.tipoArmazenagem.toUpperCase()}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {briefing.dadosArmazem.quantidadeMetrica} {briefing.dadosArmazem.metricaPrincipal.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Tipo Palete</span>
                  <strong className="text-slate-800 dark:text-slate-200 uppercase">{briefing.dadosArmazem.tipoPalete}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Inbound Previsto</span>
                  <strong className="text-slate-800 dark:text-slate-200">{briefing.dadosArmazem.recebimentoPrevistoMes}/mês</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Outbound Previsto</span>
                  <strong className="text-slate-800 dark:text-slate-200">{briefing.dadosArmazem.expedicaoPrevistaMes}/mês</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Giro Estimado</span>
                  <strong className="text-slate-800 dark:text-slate-200">{briefing.dadosArmazem.diasGiroEstoque} dias</strong>
                </div>
              </div>
            </div>
          )}

          {/* Cabotagem Card */}
          {briefing.servicosSelecionados.includes('cabotagem') && briefing.dadosCabotagem && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Cabotagem Marítima</h3>
                    <p className="text-xs text-slate-500">
                      {briefing.dadosCabotagem.portoOrigem} ➔ {briefing.dadosCabotagem.portoDestino}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                  {briefing.dadosCabotagem.quantidadeContainersMes}x {briefing.dadosCabotagem.tipoContainer.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Modalidade: <strong>{briefing.dadosCabotagem.modalidade.replace(/_/g, ' ').toUpperCase()}</strong> | Free time: {briefing.dadosCabotagem.freeTimeOrigemDias} dias (origem) / {briefing.dadosCabotagem.freeTimeDestinoDias} dias (destino).
              </p>
            </div>
          )}

          {/* Fitting Card */}
          {briefing.servicosSelecionados.includes('fitting') && briefing.dadosFitting && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Fitting & Peação Técnica</h3>
                    <p className="text-xs text-slate-500">
                      Serviço: {briefing.dadosFitting.tipoFitting.replace(/_/g, ' ').toUpperCase()} ({briefing.dadosFitting.quantidadeContainers} contêineres)
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Local de Execução: <strong>{briefing.dadosFitting.localExecucao.toUpperCase()}</strong> | {briefing.dadosFitting.exigeLaudoArtEngenheiro ? 'Laudo ART do Engenheiro Requerido' : 'Certificado Padrão'}
              </p>
            </div>
          )}

          {/* Seção Insumos e Upload de Modelo (Seção 6 do briefing) */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Insumos do Cliente (Planilha de Briefing & Modelo de Cotação)
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  Conforme a Seção 6 do seu protocolo, este módulo está preparado para receber sua planilha de briefing atual e o modelo oficial da sua proposta comercial.
                </p>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{uploadedTemplateName ? 'Substituir Arquivo' : 'Carregar Modelo de Proposta (.xlsx)'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedTemplateName(file.name);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {uploadedTemplateName && (
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <FileCheck className="w-4 h-4" />
                Template carregado com sucesso: <strong>{uploadedTemplateName}</strong> (Pronto para mapeamento de campos)
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Planilha RFQ para Fornecedores */}
      {activeTab === 'rfq_fornecedores' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Visualização Prévia da Planilha para Fornecedores (RFQ)
                </h3>
                <p className="text-xs text-slate-500">
                  Os fornecedores receberão todas as restrições e preencherão apenas as colunas em amarelo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Baixar Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar CSV
                </button>
              </div>
            </div>

            {/* Se for Frete Aéreo, renderiza exatamente o layout oficial da planilha do anexo */}
            {briefing.servicosSelecionados.includes('frete_aereo') && briefing.dadosFreteAereo ? (
              <div className="space-y-6">
                {(() => {
                  const fa = briefing.dadosFreteAereo;
                  const origin = parseAirportInfo(fa.aeroportoOrigem);
                  const dest = parseAirportInfo(fa.aeroportoDestino);
                  const vols = fa.quantidadeVolumes || 1;
                  const metrics = calculateAirMetrics(fa.pesoBrutoKg || 0, vols, fa.medidaUnitaria, fa.medidaTotal);
                  const dataFormatada = new Date(briefing.dataCriacao).toLocaleDateString('pt-BR');

                  return (
                    <div className="space-y-6">
                      {/* 1. Cabeçalho Oficial da Planilha */}
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                        <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-base sm:text-lg font-extrabold tracking-wide uppercase">
                              AIR FREIGHT · QUOTE REQUEST
                            </h4>
                            <p className="text-xs text-slate-400">
                              Solicitação de Cotação · Frete Aéreo
                            </p>
                          </div>
                          <div className="flex items-center gap-2 sm:text-right">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">BRIEFING Nº:</span>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 font-mono font-bold rounded-lg border border-blue-500/30 text-xs">
                              {briefing.codigo}
                            </span>
                          </div>
                        </div>

                        {/* Rota Aérea: ORIGIN · Origem ✈ DESTINATION · Destino */}
                        <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800">
                          <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-3">
                            <div className="sm:col-span-5 space-y-0.5">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                ORIGIN · Origem
                              </span>
                              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
                                {origin.iata}
                              </div>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                                {origin.cityCountry}
                              </p>
                            </div>

                            <div className="sm:col-span-1 flex justify-center text-2xl text-slate-400">
                              ✈
                            </div>

                            <div className="sm:col-span-5 space-y-0.5 sm:text-right">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                DESTINATION · Destino
                              </span>
                              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
                                {dest.iata}
                              </div>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                                {dest.cityCountry}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Dois Painéis: ① CARGO DETAILS e ② CHARGES */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* PAINEL ESQUERDO: ① CARGO DETAILS */}
                        <div className="border border-blue-200 dark:border-blue-900/60 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
                          <div className="bg-blue-100 dark:bg-blue-950/80 px-4 py-2.5 text-center font-extrabold text-blue-900 dark:text-blue-200 text-xs sm:text-sm tracking-wide uppercase border-b border-blue-200 dark:border-blue-800">
                            ① CARGO DETAILS · Detalhes da carga
                          </div>
                          <div className="p-4 sm:p-5 space-y-2.5 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="flex items-center justify-between pt-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Pieces</span>
                              <span className="font-bold text-slate-900 dark:text-white font-mono">{vols} pcs</span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Dimensions</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {metrics.dimL} × {metrics.dimW} × {metrics.dimH} cm (L × W × H)
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Weight per piece</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">{metrics.pesoUnitario.replace('.', ',')} kg</span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Total of {vols} pieces</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">{metrics.pesoTotal.replace('.', ',')} kg</span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Gross Weight</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">{metrics.pesoTotal.replace('.', ',')} kg</span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Volume</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">{metrics.volumeM3.replace('.', ',')} m³</span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Volumetric factor</span>
                              <span className="font-mono text-slate-500">166,67 kg/m³ (IATA)</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 bg-blue-50/50 dark:bg-blue-950/30 -mx-4 px-4 py-2 rounded-lg">
                              <span className="font-extrabold text-blue-900 dark:text-blue-300">Chargeable Weight</span>
                              <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                                {metrics.chargeableWeight.replace('.', ',')} kg
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Description</span>
                              <span className="font-bold text-sky-700 dark:text-sky-300 uppercase">
                                {fa.tipoCarga || 'CARGA GERAL'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Packaging</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                                {fa.tipoEmbalagem || 'CAIXAS DE PAPELÃO (CARTON BOX)'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Value of Goods</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {formatCurrencyBRL(fa.valorMercadoria || 0)}
                              </span>
                            </div>

                            <div className="pt-2 text-slate-600 dark:text-slate-400 space-y-0.5">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Pick-up / Delivery</span>
                              <p className="text-[11px] font-medium text-slate-500">
                                {fa.coletaOrigemPorta ? '✓ Coleta na Origem Requerida' : '— Entrega no Aeroporto de Origem'}
                              </p>
                              <p className="text-[11px] font-medium text-slate-500">
                                {fa.entregaDestinoPorta ? '✓ Entrega no Destino Requerida' : '— Retirada no Aeroporto de Destino'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* PAINEL DIREITO: ② CHARGES */}
                        <div className="border border-amber-300 dark:border-amber-800/80 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
                          <div className="bg-amber-100 dark:bg-amber-950/80 px-4 py-2.5 text-center font-extrabold text-amber-900 dark:text-amber-200 text-xs sm:text-sm tracking-wide uppercase border-b border-amber-300 dark:border-amber-800">
                            ② CHARGES · Taxas e valores
                          </div>
                          <div className="p-4 sm:p-5 space-y-2.5 text-xs">
                            {/* CAMPO DE SELEÇÃO DE MOEDA (AMARELO / DESTACADO) */}
                            <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 p-2.5 rounded-xl">
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                                  Currency · Moeda da Proposta
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Defina a moeda de retorno da cotação
                                </span>
                              </div>
                              <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                                className="bg-amber-100 dark:bg-amber-900/70 border border-amber-400 text-amber-950 dark:text-amber-100 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                              >
                                <option value="USD">USD (Dólar Americano $)</option>
                                <option value="BRL">BRL (Real Brasileiro R$)</option>
                                <option value="EUR">EUR (Euro €)</option>
                                <option value="ARS">ARS (Peso Argentino $)</option>
                                <option value="CLP">CLP (Peso Chileno $)</option>
                                <option value="GBP">GBP (Libra Esterlina £)</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Freight, Fuel, Risk</span>
                              <span className="bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-mono text-[11px] border border-amber-300">
                                [ {selectedCurrency} 0,00 per kg ]
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Minimum charge (Min)</span>
                              <span className="bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-mono text-[11px] border border-amber-300">
                                [ {selectedCurrency} 0,00 per shipment ]
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">AVIATION SECURITY (ASC)</span>
                              <span className="bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-mono text-[11px] border border-amber-300">
                                [ {selectedCurrency} 0,00 per kg ]
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Air Waybill Fee (AWB)</span>
                              <span className="bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-mono text-[11px] border border-amber-300">
                                [ {selectedCurrency} 0,00 per shipment ]
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">DG Check Fee</span>
                              <span className="bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-mono text-[11px] border border-amber-300">
                                [ {selectedCurrency} 0,00 per shipment ]
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Data transfer fee (custom)</span>
                              <span className="bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-mono text-[11px] border border-amber-300">
                                [ {selectedCurrency} 0,00 per shipment ]
                              </span>
                            </div>

                            <div className="pt-3 border-t-2 border-slate-900 dark:border-white flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl">
                              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                TOTAL COTAÇÃO
                              </span>
                              <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/60 px-3 py-1 rounded border border-amber-400">
                                [ {selectedCurrency} Calculado Automaticamente ]
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Estimated Transit Time</span>
                              <span className="bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-mono text-[11px] border border-amber-300">
                                [ ___ Dias / Voo ]
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Proposal Validity</span>
                              <span className="bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-mono text-[11px] border border-amber-300">
                                [ ___ Dias ]
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Airline / Forwarder Name</span>
                              <span className="bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-mono text-[11px] border border-amber-300">
                                [ ___________________ ]
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                              Preencha apenas as células amarelas e devolva a proposta ao vendedor. O total é calculado automaticamente.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Rodapé Executivo: CLIENTE, VENDEDOR, GERADO EM */}
                      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">CLIENTE</span>
                          <strong className="text-slate-900 dark:text-white uppercase">{briefing.clienteRazaoSocial}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">VENDEDOR</span>
                          <strong className="text-slate-900 dark:text-white uppercase">{briefing.vendedorNome}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">GERADO EM</span>
                          <strong className="text-slate-900 dark:text-white">{dataFormatada}</strong>
                        </div>
                      </div>

                      {/* 4. Legenda Oficial de Preenchimento */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
                          COMO PREENCHER · LEGENDA
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px]">
                            <strong>Amarelo:</strong> Campos do agente / forwarder (valores em US$). Ex.: frete 4,85 por kg · mínimo 150,00.
                          </div>
                          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-[11px]">
                            <strong>Azul:</strong> Dados da carga, editáveis. Volume, peso cobrável e totais se recalculam sozinhos.
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                            <strong>Fórmulas:</strong> Chargeable Weight = maior entre peso bruto e volume × 166,67 kg/m³ (IATA 1:6000). Total = máx(Frete × CW; Mínimo) + ASC × CW + AWB + DG Check + Data transfer.
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Tabela Padrão para outros modais */
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <th className="p-3 border-r border-slate-200 dark:border-slate-700">Item</th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-700">Serviço / Escopo</th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-700">Origem (CEP)</th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-700">Destino (CEP)</th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-700">Carga / Peso</th>
                      <th className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-r border-amber-200">
                        Custo Frete / Base (R$)
                      </th>
                      <th className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-r border-amber-200">
                        Pedágio / Taxas (R$)
                      </th>
                      <th className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-r border-amber-200">
                        Transit Time (Dias)
                      </th>
                      <th className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
                        Validade Proposta
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {briefing.servicosSelecionados.some(s => ['frete_rodoviario', 'transporte'].includes(s)) && briefing.dadosTransporte && (
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-blue-600">TR-01</td>
                        <td className="p-3">
                          {briefing.dadosTransporte.tipoOperacao.toUpperCase()} - {briefing.dadosTransporte.tipoVeiculo.toUpperCase()}
                        </td>
                        <td className="p-3">
                          {briefing.dadosTransporte.coleta.cidade}/{briefing.dadosTransporte.coleta.uf}
                        </td>
                        <td className="p-3">
                          {briefing.dadosTransporte.entrega.cidade}/{briefing.dadosTransporte.entrega.uf}
                        </td>
                        <td className="p-3 font-medium">
                          {briefing.dadosTransporte.pesoBrutoKg.toLocaleString('pt-BR')} kg
                        </td>
                        <td className="p-3 bg-amber-50/60 dark:bg-amber-950/30 font-mono text-slate-400 italic">
                          [Fornecedor preenche]
                        </td>
                        <td className="p-3 bg-amber-50/60 dark:bg-amber-950/30 font-mono text-slate-400 italic">
                          [Fornecedor preenche]
                        </td>
                        <td className="p-3 bg-amber-50/60 dark:bg-amber-950/30 font-mono text-slate-400 italic">
                          [Fornecedor preenche]
                        </td>
                        <td className="p-3 bg-amber-50/60 dark:bg-amber-950/30 font-mono text-slate-400 italic">
                          [Fornecedor preenche]
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Retorno de Fornecedores & Montagem da Cotação Final */}
      {activeTab === 'cotacao_final' && (
        <div className="space-y-6">
          {/* Lançamento / Importação de Valores do Fornecedor */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Lançar / Importar Retorno de Fornecedor
                  </h3>
                  <p className="text-xs text-slate-500">
                    Insira os valores recebidos dos transportadores ou armadores para simular as margens e gerar a proposta final.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Fornecedor / Transportadora *
                </label>
                <input
                  type="text"
                  placeholder="Ex: TransLog Brasil Cargas"
                  value={newSupplier.fornecedorNome || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, fornecedorNome: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Frete Base / Custo (R$) *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 5800"
                  value={newSupplier.custoBase || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, custoBase: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pedágio (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 420"
                  value={newSupplier.custoPedagio || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, custoPedagio: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transit Time (Dias)
                </label>
                <input
                  type="number"
                  value={newSupplier.prazoTransitTimeDias || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, prazoTransitTimeDias: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Margem Comercial (%)
                </label>
                <input
                  type="number"
                  value={newSupplier.margemAplicadaPercentual || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, margemAplicadaPercentual: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!newSupplier.fornecedorNome || !newSupplier.custoBase}
                onClick={handleAddSupplierCost}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Proposta do Fornecedor</span>
              </button>
            </div>
          </div>

          {/* Tabela Comparativa de Custos Recebidos */}
          {briefing.custosFornecedores.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  Quadro Comparativo de Fornecedores & Preço de Venda ao Cliente
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <th className="p-3">Fornecedor</th>
                      <th className="p-3">Frete Base</th>
                      <th className="p-3">Pedágio</th>
                      <th className="p-3">Custo Total Compra</th>
                      <th className="p-3">Transit Time</th>
                      <th className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                        Margem
                      </th>
                      <th className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold">
                        PREÇO FINAL VENDA
                      </th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {briefing.custosFornecedores.map((item) => {
                      const isBest = bestSupplier?.id === item.id;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${
                            isBest ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {item.fornecedorNome}
                            {isBest && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-600 text-white font-bold">
                                MENOR CUSTO
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono">{formatCurrencyBRL(item.custoBase)}</td>
                          <td className="p-3 font-mono">{formatCurrencyBRL(item.custoPedagio || 0)}</td>
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrencyBRL(item.custoTotal)}
                          </td>
                          <td className="p-3">{item.prazoTransitTimeDias} dias</td>
                          <td className="p-3 font-bold text-blue-600 bg-blue-50/30 dark:bg-blue-950/20">
                            {item.margemAplicadaPercentual}%
                          </td>
                          <td className="p-3 font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 text-sm">
                            {formatCurrencyBRL(item.precoFinalCliente)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveSupplierCost(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition"
                              title="Remover fornecedor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Botão para Imprimir / Exportar Proposta Comercial */}
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Gerar PDF da Cotação Comercial</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <Calculator className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                Nenhum custo de fornecedor lançado ainda
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Envie a planilha RFQ gerada na aba anterior para seus fornecedores. Quando eles retornarem com as tarifas, lance-as acima para calcular a margem e montar a cotação final.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navegação inferior */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Formulário</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition cursor-pointer"
        >
          Novo Briefing
        </button>
      </div>
    </div>
  );
};
