import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScopeSummaryHeader, SERVICE_TITLES_MAP } from './components/ScopeSummaryHeader';
import { FlowchartStepper } from './components/FlowchartStepper';
import { SellerIdentityForm } from './components/forms/SellerIdentityForm';
import { ServiceSelector, OFFICIAL_SERVICES } from './components/ServiceSelector';
import { ClientInfoForm } from './components/forms/ClientInfoForm';
import { TransporteForm } from './components/forms/TransporteForm';
import { ArmazemForm } from './components/forms/ArmazemForm';
import { CabotagemForm } from './components/forms/CabotagemForm';
import { FittingForm } from './components/forms/FittingForm';
import { MistosForm } from './components/forms/MistosForm';
import { AirFreightOperationalForm } from './components/forms/AirFreightOperationalForm';
import { BriefingReviewView } from './components/BriefingReviewView';
import { BriefingData, ServiceCategory, TransporteData, AirFreightData, ArmazemData, CabotagemData, FittingData, ServicosMistosData } from './types/logistics';

const INITIAL_TRANSPORTE: TransporteData = {
  tipoOperacao: 'lotacao_ftl',
  tipoVeiculo: 'carreta_ls',
  tipoCarroceria: 'sider_cortina',
  coleta: {
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    tipoLocal: 'doca',
    agendamentoObrigatorio: false,
  },
  entrega: {
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    tipoLocal: 'doca',
    agendamentoObrigatorio: false,
  },
  temOvaDesova: false,
  descricaoMercadoria: '',
  pesoBrutoKg: 0,
  valorNotaFiscal: 0,
  isCargaPerigosa: false,
  isCargaRefrigerada: false,
  isCargaComExcesso: false,
  exigenciaSeguranca: {
    rastreadorDuplo: false,
    travaQuintaRoda: false,
    escoltaArmada: false,
    sensorDesengate: false,
  },
};

const INITIAL_ARMAZEM: ArmazemData = {
  tipoArmazenagem: 'geral',
  cidadePreferencia: 'Cajamar',
  ufPreferencia: 'SP',
  metricaPrincipal: 'posicoes_palete',
  quantidadeMetrica: 350,
  tipoPalete: 'pbr',
  servicosAdicionais: {
    pickingFracionado: true,
    kittingMontagem: false,
    etiquetagemInmetro: true,
    reembalagemStrech: true,
    integracaoWmsApi: true,
    inventarioRotativo: true,
  },
  recebimentoPrevistoMes: 150,
  expedicaoPrevistaMes: 120,
  diasGiroEstoque: 25,
  observacoesOperacionais: '',
};

const INITIAL_CABOTAGEM: CabotagemData = {
  portoOrigem: 'Porto de Santos (SP)',
  portoDestino: 'Porto de Suape (PE)',
  modalidade: 'porta_a_porta_integrado',
  tipoContainer: '40_hc',
  quantidadeContainersMes: 6,
  pesoMedioPorContainerTon: 22,
  mercadoria: 'Insumos Industriais',
  freeTimeOrigemDias: 7,
  freeTimeDestinoDias: 10,
  seguroMaritimoIncluso: true,
  observacoesCabotagem: '',
};

const INITIAL_FITTING: FittingData = {
  tipoFitting: 'thermal_liner',
  tipoContainer: '40_pes',
  quantidadeContainers: 4,
  localExecucao: 'terminal_portuario',
  exigeNr35EspacoConfinado: true,
  exigeLaudoArtEngenheiro: true,
  fornecimentoMaterial: 'incluso_pelo_prestador',
  especificacoesProduto: '',
};

const INITIAL_MISTOS: ServicosMistosData = {
  descricaoOperacao: '',
  modaisEnvolvidos: ['Rodoviário Lotação', 'Armazém de Trânsito'],
  transitTimeMaximoDias: 5,
  exigeFrotaDedicada: false,
  observacoesMistos: '',
};

const INITIAL_FRETE_AEREO: AirFreightData = {
  aeroportoOrigem: '',
  aeroportoDestino: '',
  tipoEnvio: 'nacional',
  tipoCarga: '',
  tipoEmbalagem: 'CAIXAS DE PAPELÃO (CARTON BOX)',
  pesoBrutoKg: 0,
  quantidadeVolumes: 1,
  valorMercadoria: 0,
  medidaUnitaria: '',
  medidaTotal: '',
  coletaOrigemPorta: false,
  entregaDestinoPorta: false,
  observacoesAereo: '',
};

function createNewBriefing(vendedorNome = 'Carlos Oliveira', vendedorEmail = 'carlos.oliveira@empresa.com.br'): BriefingData {
  const codeNum = Math.floor(1000 + Math.random() * 9000);
  return {
    id: Math.random().toString(36).substring(2, 9),
    codigo: `BRF-${codeNum}`,
    dataCriacao: new Date().toISOString(),
    vendedorNome,
    vendedorEmail,
    clienteRazaoSocial: '',
    clienteCnpj: '',
    clienteContato: '',
    clienteTelefone: '',
    clienteEmail: '',
    status: 'rascunho',
    servicosSelecionados: ['frete_rodoviario'],
    dadosTransporte: { ...INITIAL_TRANSPORTE },
    dadosFreteAereo: { ...INITIAL_FRETE_AEREO },
    dadosArmazem: { ...INITIAL_ARMAZEM },
    dadosCabotagem: { ...INITIAL_CABOTAGEM },
    dadosFitting: { ...INITIAL_FITTING },
    dadosServicosMistos: { ...INITIAL_MISTOS },
    custosFornecedores: [],
  };
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [briefing, setBriefing] = useState<BriefingData>(() => createNewBriefing());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Sincronizar tema Dark/Light
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sequência do Stepper
  const stepsTitles: string[] = [
    '1. VENDEDOR',
    '2. ESCOLHER SERVIÇO',
    '3. CLIENTE',
    ...briefing.servicosSelecionados.map((srvId) => {
      return SERVICE_TITLES_MAP[srvId] || srvId.toUpperCase();
    }),
    'REVISÃO & COTAÇÃO',
  ];

  const handleToggleService = (serviceId: ServiceCategory) => {
    const exists = briefing.servicosSelecionados.includes(serviceId);
    let updated: ServiceCategory[];
    if (exists) {
      if (briefing.servicosSelecionados.length === 1) return;
      updated = briefing.servicosSelecionados.filter((s) => s !== serviceId);
    } else {
      updated = [...briefing.servicosSelecionados, serviceId];
    }
    setBriefing({ ...briefing, servicosSelecionados: updated });
  };

  const handleSelectSingleService = (serviceId: ServiceCategory) => {
    setBriefing({ ...briefing, servicosSelecionados: [serviceId] });
  };

  const handleSellerConfirm = (nome: string, email: string) => {
    const fresh = createNewBriefing(nome, email);
    setBriefing(fresh);
    setCurrentStepIndex(1); // Vai direto para a escolha do serviço
  };

  const handleReset = () => {
    setBriefing(createNewBriefing(briefing.vendedorNome, briefing.vendedorEmail));
    setCurrentStepIndex(0);
  };

  // Renderizador dinâmico de etapas
  const renderStepContent = () => {
    // Passo 0: Vendedor se identifica e clica em Criar Novo Briefing
    if (currentStepIndex === 0) {
      return (
        <SellerIdentityForm
          vendedorNome={briefing.vendedorNome}
          vendedorEmail={briefing.vendedorEmail}
          onConfirm={handleSellerConfirm}
        />
      );
    }

    // Passo 1: Escolha do Serviço que deseja cotar (Lista oficial em MAIÚSCULAS)
    if (currentStepIndex === 1) {
      return (
        <ServiceSelector
          vendedorNome={briefing.vendedorNome}
          codigoBriefing={briefing.codigo}
          selected={briefing.servicosSelecionados}
          onToggle={handleToggleService}
          onSelectSingle={handleSelectSingleService}
          onProceed={() => setCurrentStepIndex(2)}
          onBack={() => setCurrentStepIndex(0)}
        />
      );
    }

    // Passo 2: Dados do Cliente
    if (currentStepIndex === 2) {
      return (
        <ClientInfoForm
          briefing={briefing}
          onChange={(patch) => setBriefing({ ...briefing, ...patch })}
          onProceed={() => setCurrentStepIndex(3)}
          onBack={() => setCurrentStepIndex(1)}
        />
      );
    }

    // Passos dos Serviços Selecionados:
    const selectedServiceIndex = currentStepIndex - 3;
    if (selectedServiceIndex >= 0 && selectedServiceIndex < briefing.servicosSelecionados.length) {
      const activeService = briefing.servicosSelecionados[selectedServiceIndex];

      if (activeService === 'frete_aereo') {
        return (
          <AirFreightOperationalForm
            briefing={briefing}
            data={briefing.dadosFreteAereo || INITIAL_FRETE_AEREO}
            onChange={(dadosFreteAereo) => setBriefing({ ...briefing, dadosFreteAereo })}
            onProceed={() => setCurrentStepIndex(currentStepIndex + 1)}
            onBack={() => setCurrentStepIndex(currentStepIndex - 1)}
          />
        );
      }

      if (
        activeService === 'frete_rodoviario' ||
        activeService === 'frete_maritimo'
      ) {
        return (
          <TransporteForm
            data={briefing.dadosTransporte || INITIAL_TRANSPORTE}
            onChange={(dadosTransporte) => setBriefing({ ...briefing, dadosTransporte })}
            onNext={() => setCurrentStepIndex(currentStepIndex + 1)}
            onBack={() => setCurrentStepIndex(currentStepIndex - 1)}
          />
        );
      }

      if (activeService === 'armazenagem') {
        return (
          <ArmazemForm
            data={briefing.dadosArmazem || INITIAL_ARMAZEM}
            onChange={(dadosArmazem) => setBriefing({ ...briefing, dadosArmazem })}
            onNext={() => setCurrentStepIndex(currentStepIndex + 1)}
            onBack={() => setCurrentStepIndex(currentStepIndex - 1)}
          />
        );
      }

      if (activeService === 'cabotagem') {
        return (
          <CabotagemForm
            data={briefing.dadosCabotagem || INITIAL_CABOTAGEM}
            onChange={(dadosCabotagem) => setBriefing({ ...briefing, dadosCabotagem })}
            onNext={() => setCurrentStepIndex(currentStepIndex + 1)}
            onBack={() => setCurrentStepIndex(currentStepIndex - 1)}
          />
        );
      }

      if (activeService === 'fitting') {
        return (
          <FittingForm
            data={briefing.dadosFitting || INITIAL_FITTING}
            onChange={(dadosFitting) => setBriefing({ ...briefing, dadosFitting })}
            onNext={() => setCurrentStepIndex(currentStepIndex + 1)}
            onBack={() => setCurrentStepIndex(currentStepIndex - 1)}
          />
        );
      }

      if (activeService === 'multiplos_servicos') {
        return (
          <MistosForm
            data={briefing.dadosServicosMistos || INITIAL_MISTOS}
            onChange={(dadosServicosMistos) => setBriefing({ ...briefing, dadosServicosMistos })}
            onNext={() => setCurrentStepIndex(currentStepIndex + 1)}
            onBack={() => setCurrentStepIndex(currentStepIndex - 1)}
          />
        );
      }
    }

    // Último Passo: Revisão, Exportação RFQ & Cotação Final
    return (
      <BriefingReviewView
        briefing={briefing}
        onUpdateBriefing={(updated) => setBriefing(updated)}
        onBack={() => setCurrentStepIndex(currentStepIndex - 1)}
        onReset={handleReset}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNewBriefing={handleReset}
        activeCount={1}
      />

      {/* Espaço Superior de Escopo Progressivo (apenas nas etapas de preenchimento 1 a 4) */}
      {currentStepIndex > 0 && currentStepIndex < 5 && (
        <ScopeSummaryHeader
          briefing={briefing}
          currentStepIndex={currentStepIndex}
        />
      )}

      {/* Stepper dinâmico */}
      <FlowchartStepper
        currentStepIndex={currentStepIndex}
        totalSteps={stepsTitles.length}
        stepsTitles={stepsTitles}
        onSelectStep={(idx) => setCurrentStepIndex(idx)}
      />

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {renderStepContent()}
      </main>

      {/* Rodapé Executivo */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-3 px-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs uppercase">
        <p>
          COTAÇÕES BPG © 2026 — SISTEMA INTELIGENTE DE BRIEFING &amp; COTAÇÕES LOGÍSTICAS MULTIMODAIS.
        </p>
      </footer>
    </div>
  );
}
