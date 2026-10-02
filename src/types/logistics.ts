export type ServiceCategory =
  | 'frete_rodoviario'
  | 'frete_maritimo'
  | 'frete_aereo'
  | 'armazenagem'
  | 'cabotagem'
  | 'fitting'
  | 'multiplos_servicos';

export interface ServiceMeta {
  id: ServiceCategory;
  title: string; // Em MAIÚSCULAS
  shortDesc: string;
}

export interface CepAddress {
  cep: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  tipoLocal?: 'doca' | 'plataforma' | 'nivel_zero' | 'patio_aberto' | 'porto_retroportuario';
  agendamentoObrigatorio?: boolean;
  horarioRecebimento?: string;
}

export interface TransporteData {
  tipoOperacao: 'lotacao_ftl' | 'fracionado_ltl' | 'puxada_container' | 'dedicado';
  containerTamanho?: '20_dry' | '40_dry' | '40_hc' | '40_reefer' | 'especial';
  terminalRetiradaVazio?: string;
  terminalDevolucaoVazio?: string;
  tipoVeiculo: 'vuc' | 'tooco' | 'truck' | 'bitrem' | 'rodotrem' | 'carreta_ls' | 'vanderleia' | 'utilitario' | 'prancha_rebaixada';
  tipoCarroceria: 'sider_cortina' | 'bau_fechado' | 'grade_baixa' | 'graneleiro' | 'porta_container' | 'refrigerado' | 'prancha';
  coleta: CepAddress;
  entrega: CepAddress;
  temOvaDesova: boolean;
  ovaDesova?: CepAddress & {
    tipoManuseio: 'ova' | 'desova' | 'ambos';
    equipamentoNecessario: 'empilhadeira_padrao' | 'reach_stacker' | 'guindaste' | 'manual';
  };
  descricaoMercadoria: string;
  pesoBrutoKg: number;
  cubagemM3?: number;
  quantidadeVolumes?: number;
  valorNotaFiscal: number;
  isCargaPerigosa: boolean;
  cargaPerigosaInfo?: {
    classeImo: string;
    numeroOnu: string;
    grupoEmbalagem?: string;
  };
  isCargaRefrigerada: boolean;
  cargaRefrigeradaInfo?: {
    temperaturaMinC: number;
    temperaturaMaxC: number;
    exigeTermografo: boolean;
  };
  isCargaComExcesso: boolean;
  cargaExcessoInfo?: {
    comprimentoMetros: number;
    larguraMetros: number;
    alturaMetros: number;
  };
  exigenciaSeguranca?: {
    rastreadorDuplo?: boolean;
    travaQuintaRoda?: boolean;
    escoltaArmada?: boolean;
    sensorDesengate?: boolean;
  };
}

export interface AirFreightData {
  aeroportoOrigem: string;
  aeroportoDestino: string;
  tipoEnvio?: 'nacional' | 'internacional_importacao' | 'internacional_exportacao' | 'internacional_cross_trade' | 'internacional';
  tipoCarga?: string;
  tipoEmbalagem?: string;
  pesoBrutoKg?: number;
  quantidadeVolumes?: number;
  valorMercadoria?: number;
  medidaUnitaria?: string;
  medidaTotal?: string;
  coletaOrigemPorta?: boolean;
  entregaDestinoPorta?: boolean;
  observacoesAereo?: string;
}

export interface ArmazemData {
  tipoArmazenagem: 'geral' | 'filial_fiscal' | 'alfandegado_clia' | 'cross_docking' | 'climatizado';
  cidadePreferencia: string;
  ufPreferencia: string;
  metricaPrincipal: 'posicoes_palete' | 'area_m2' | 'volume_m3' | 'toneladas';
  quantidadeMetrica: number;
  tipoPalete: 'pbr' | 'euro' | 'descartavel' | 'carga_batida';
  servicosAdicionais: {
    pickingFracionado: boolean;
    kittingMontagem: boolean;
    etiquetagemInmetro: boolean;
    reembalagemStrech: boolean;
    integracaoWmsApi: boolean;
    inventarioRotativo: boolean;
  };
  recebimentoPrevistoMes: number;
  expedicaoPrevistaMes: number;
  diasGiroEstoque: number;
  observacoesOperacionais?: string;
}

export interface CabotagemData {
  portoOrigem: string;
  portoDestino: string;
  modalidade: 'porta_a_porta_integrado' | 'porto_a_porto' | 'porta_a_porto' | 'porto_a_porta';
  tipoContainer: '20_dry' | '40_dry' | '40_hc' | '40_reefer' | 'breakbulk';
  quantidadeContainersMes: number;
  pesoMedioPorContainerTon: number;
  mercadoria: string;
  freeTimeOrigemDias: number;
  freeTimeDestinoDias: number;
  seguroMaritimoIncluso: boolean;
  observacoesCabotagem?: string;
}

export interface FittingData {
  tipoFitting: 'thermal_liner' | 'lashing_peacao' | 'flexitank_liquidos' | 'liner_bag_granel' | 'dunnage_airbags' | 'bercos_madeira';
  tipoContainer: '20_pes' | '40_pes';
  quantidadeContainers: number;
  localExecucao: 'terminal_portuario' | 'fabrica_cliente' | 'armazem_parceiro';
  enderecoExecucao?: CepAddress;
  exigeNr35EspacoConfinado: boolean;
  exigeLaudoArtEngenheiro: boolean;
  fornecimentoMaterial: 'incluso_pelo_prestador' | 'fornecido_pelo_cliente';
  especificacoesProduto?: string;
}

export interface ServicosMistosData {
  descricaoOperacao: string;
  modaisEnvolvidos: string[];
  pontoTransbordoIntermediario?: string;
  transitTimeMaximoDias?: number;
  exigeFrotaDedicada: boolean;
  observacoesMistos?: string;
}

export interface SupplierCostItem {
  id: string;
  fornecedorNome: string;
  servico: string;
  descricaoServico: string;
  custoBase: number;
  custoPedagio?: number;
  custoAjudantes?: number;
  custoTotal: number;
  prazoTransitTimeDias: number;
  validadeDias: number;
  condicaoPagamento: string;
  observacoes?: string;
  margemAplicadaPercentual: number;
  precoFinalCliente: number;
}

export interface BriefingData {
  id: string;
  codigo: string;
  dataCriacao: string;
  vendedorNome: string;
  vendedorEmail: string;
  clienteRazaoSocial: string;
  clienteCnpj: string;
  clienteContato: string;
  clienteTelefone: string;
  clienteEmail: string;
  observacoesGerais?: string;
  status: 'rascunho' | 'aguardando_fornecedores' | 'valores_recebidos' | 'proposta_gerada';
  servicosSelecionados: ServiceCategory[];
  dadosTransporte?: TransporteData;
  dadosFreteAereo?: AirFreightData;
  dadosArmazem?: ArmazemData;
  dadosCabotagem?: CabotagemData;
  dadosFitting?: FittingData;
  dadosServicosMistos?: ServicosMistosData;
  custosFornecedores: SupplierCostItem[];
}
