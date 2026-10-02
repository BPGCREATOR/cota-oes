export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean | string;
}

export interface BrasilApiResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service?: string;
}

export interface CleanAddressResult {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  origemApi: 'viacep' | 'brasilapi' | 'cache' | 'manual';
}

const cepCache = new Map<string, CleanAddressResult>();

/**
 * Remove qualquer caractere que não seja número
 */
export function sanitizeCep(cep: string): string {
  return cep.replace(/\D/g, '').slice(0, 8);
}

/**
 * Formata CEP no padrão 00000-000
 */
export function formatCep(cep: string): string {
  const clean = sanitizeCep(cep);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`;
}

/**
 * Consulta CEP na ViaCEP com fallback automático para BrasilAPI
 */
export async function fetchAddressByCep(cepInput: string): Promise<CleanAddressResult> {
  const cleanCep = sanitizeCep(cepInput);

  if (cleanCep.length !== 8) {
    throw new Error('O CEP deve conter exatamente 8 dígitos numéricos.');
  }

  // Verifica cache em memória
  if (cepCache.has(cleanCep)) {
    const cached = cepCache.get(cleanCep)!;
    return { ...cached, origemApi: 'cache' };
  }

  // 1ª Tentativa: ViaCEP
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data: ViaCepResponse = await response.json();
      if (!data.erro) {
        const result: CleanAddressResult = {
          cep: formatCep(data.cep || cleanCep),
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: (data.uf || '').toUpperCase(),
          origemApi: 'viacep',
        };
        cepCache.set(cleanCep, result);
        return result;
      }
    }
  } catch {
    // Falha silenciosa no ViaCEP para tentar BrasilAPI
  }

  // 2ª Tentativa (Fallback): BrasilAPI
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const fallbackResponse = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (fallbackResponse.ok) {
      const bData: BrasilApiResponse = await fallbackResponse.json();
      const result: CleanAddressResult = {
        cep: formatCep(bData.cep || cleanCep),
        logradouro: bData.street || '',
        bairro: bData.neighborhood || '',
        cidade: bData.city || '',
        uf: (bData.state || '').toUpperCase(),
        origemApi: 'brasilapi',
      };
      cepCache.set(cleanCep, result);
      return result;
    }
  } catch {
    // Ambos falharam
  }

  throw new Error(`Não foi possível localizar o endereço para o CEP ${formatCep(cleanCep)}. Por favor, preencha manualmente.`);
}

export function formatCurrencyBRL(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0);
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '').slice(0, 14);
  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 10) {
    return clean.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return clean.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

export interface CnpjCompanyData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  telefone?: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  situacaoCadastral?: string;
}

const cnpjCache = new Map<string, CnpjCompanyData>();

export function sanitizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '').slice(0, 14);
}

/**
 * Consulta dados cadastrais completos da empresa via CNPJ (BrasilAPI com fallback para MinhaReceita)
 */
export async function fetchCompanyByCnpj(cnpjInput: string): Promise<CnpjCompanyData> {
  const cleanCnpj = sanitizeCnpj(cnpjInput);

  if (cleanCnpj.length !== 14) {
    throw new Error('O CNPJ DEVE CONTER EXATAMENTE 14 DÍGITOS NUMÉRICOS.');
  }

  if (cnpjCache.has(cleanCnpj)) {
    return cnpjCache.get(cleanCnpj)!;
  }

  // 1ª Tentativa: BrasilAPI
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const phoneRaw = data.ddd_telefone_1 || data.telefone || '';
      const formattedPhone = phoneRaw ? formatPhone(phoneRaw) : '';
      const email = (data.email || '').toLowerCase();
      const result: CnpjCompanyData = {
        cnpj: formatCNPJ(cleanCnpj),
        razaoSocial: (data.razao_social || data.nome_fantasia || '').toUpperCase(),
        nomeFantasia: (data.nome_fantasia || '').toUpperCase(),
        telefone: formattedPhone,
        email,
        cep: data.cep ? formatCep(data.cep) : '',
        logradouro: (data.logradouro || '').toUpperCase(),
        numero: data.numero || '',
        bairro: (data.bairro || '').toUpperCase(),
        cidade: (data.municipio || '').toUpperCase(),
        uf: (data.uf || '').toUpperCase(),
        situacaoCadastral: (data.descricao_situacao_cadastral || 'ATIVA').toUpperCase(),
      };
      cnpjCache.set(cleanCnpj, result);
      return result;
    }
  } catch {
    // Falha silenciosa para fallback
  }

  // 2ª Tentativa: MinhaReceita
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://minhareceita.org/${cleanCnpj}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const phoneRaw = data.ddd_telefone_1 || '';
      const formattedPhone = phoneRaw ? formatPhone(phoneRaw) : '';
      const email = (data.email || '').toLowerCase();
      const result: CnpjCompanyData = {
        cnpj: formatCNPJ(cleanCnpj),
        razaoSocial: (data.razao_social || data.nome_fantasia || '').toUpperCase(),
        nomeFantasia: (data.nome_fantasia || '').toUpperCase(),
        telefone: formattedPhone,
        email,
        cep: data.cep ? formatCep(data.cep) : '',
        logradouro: (data.logradouro || '').toUpperCase(),
        numero: data.numero || '',
        bairro: (data.bairro || '').toUpperCase(),
        cidade: (data.municipio || '').toUpperCase(),
        uf: (data.uf || '').toUpperCase(),
        situacaoCadastral: (data.descricao_situacao_cadastral || 'ATIVA').toUpperCase(),
      };
      cnpjCache.set(cleanCnpj, result);
      return result;
    }
  } catch {
    // Ambos falharam
  }

  throw new Error('NÃO FOI POSSÍVEL CONSULTAR O CNPJ NA RECEITA FEDERAL AUTOMATICAMENTE. FAVOR PREENCHER OS CAMPOS MANUALMENTE.');
}

