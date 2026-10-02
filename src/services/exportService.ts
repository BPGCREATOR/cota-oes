import { BriefingData } from '../types/logistics';
import { formatCurrencyBRL } from './cepService';

/**
 * Extrai IATA, Cidade/País e Nome Amigável do aeroporto a partir do texto padrão
 */
export function parseAirportInfo(str?: string) {
  if (!str) return { iata: 'N/A', name: 'NÃO INFORMADO', cityCountry: 'NÃO INFORMADO' };
  const parts = str.split('—');
  const iata = parts[0]?.trim() || 'N/A';
  const name = parts[1]?.trim() || str;
  const cityCountry = name.split('-')[0]?.trim() || name;
  return { iata, name, cityCountry };
}

/**
 * Desmembra as dimensões unitárias (C, L, A em cm)
 */
export function parseUnitDimensions(medidaUnitaria?: string) {
  if (!medidaUnitaria) return { l: '120', w: '120', h: '120' };
  const match = medidaUnitaria.match(
    /(\d+(?:[.,]\d+)?)\s*[xX*]\s*(\d+(?:[.,]\d+)?)\s*[xX*]\s*(\d+(?:[.,]\d+)?)/
  );
  if (match) {
    return {
      l: match[1].replace(',', '.'),
      w: match[2].replace(',', '.'),
      h: match[3].replace(',', '.'),
    };
  }
  return { l: '120', w: '120', h: '120' };
}

/**
 * Calcula Volume total em m³ e o Chargeable Weight
 */
export function calculateAirMetrics(
  pesoBrutoKg: number,
  volumes: number,
  medidaUnitaria?: string,
  medidaTotal?: string
) {
  const vols = volumes > 0 ? volumes : 1;
  const { l, w, h } = parseUnitDimensions(medidaUnitaria);
  const numL = parseFloat(l) || 0;
  const numW = parseFloat(w) || 0;
  const numH = parseFloat(h) || 0;

  let volumeM3 = 0;
  if (medidaTotal) {
    const matchM3 = medidaTotal.match(/(\d+(?:[.,]\d+)?)/);
    if (matchM3) {
      volumeM3 = parseFloat(matchM3[1].replace(',', '.'));
    }
  }

  if (!volumeM3 && numL > 0 && numW > 0 && numH > 0) {
    volumeM3 = (numL * numW * numH / 1000000) * vols;
  }

  if (!volumeM3) volumeM3 = 1.728; // Fallback elegante

  const volumetricWeight = volumeM3 * 166.67;
  const chargeableWeight = Math.max(pesoBrutoKg || 0, volumetricWeight);

  const pesoUnitario = vols > 0 ? (pesoBrutoKg || 0) / vols : pesoBrutoKg || 0;

  return {
    dimL: l,
    dimW: w,
    dimH: h,
    volumeM3: volumeM3.toFixed(3),
    volumetricWeight: volumetricWeight.toFixed(2),
    chargeableWeight: chargeableWeight.toFixed(2),
    pesoUnitario: pesoUnitario.toFixed(1),
    pesoTotal: (pesoBrutoKg || 0).toFixed(1),
  };
}

/**
 * Gera arquivo CSV com a exata estrutura do anexo oficial
 */
export function generateSupplierRfqCsv(briefing: BriefingData): string {
  // Se for Frete Aéreo, aplica a estrutura idêntica do anexo
  if (briefing.servicosSelecionados.includes('frete_aereo') && briefing.dadosFreteAereo) {
    const fa = briefing.dadosFreteAereo;
    const origin = parseAirportInfo(fa.aeroportoOrigem);
    const dest = parseAirportInfo(fa.aeroportoDestino);
    const vols = fa.quantidadeVolumes || 1;
    const metrics = calculateAirMetrics(fa.pesoBrutoKg || 0, vols, fa.medidaUnitaria, fa.medidaTotal);
    const dataFormatada = new Date(briefing.dataCriacao).toLocaleDateString('pt-BR');

    const rows: string[][] = [
      ['', '', '', '', '', '', '', '', '', ''],
      ['', 'AIR FREIGHT  ·  QUOTE REQUEST', '', '', '', '', '', 'BRIEFING Nº', '', ''],
      ['', 'Solicitação de Cotação · Frete Aéreo', '', '', '', '', '', briefing.codigo, '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', 'ORIGIN · Origem', '', '', '', '', '', 'DESTINATION · Destino', '', ''],
      ['', origin.iata, '', '✈', '', '', '', dest.iata, '', ''],
      ['', origin.cityCountry, '', '', '', '', '', dest.cityCountry, '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '①  CARGO DETAILS  ·  Detalhes da carga', '', '', '', '', '', '②  CHARGES  ·  Taxas e valores', '', ''],
      ['', 'Pieces', String(vols), '', '', 'pcs', '', '"Currency · Moeda"', 'USD', '(USD / BRL / EUR / ARS)'],
      ['', 'Dimensions', metrics.dimL, metrics.dimW, metrics.dimH, 'cm (L × W × H)', '', '"Freight, Fuel, Risk"', '', 'per kg'],
      ['', 'Weight per piece', `"${metrics.pesoUnitario.replace('.', ',')}"`, '', '', 'kg', '', 'Minimum charge (Min)', '', 'per shipment'],
      ['', `Total of ${vols} pieces`, `"${metrics.pesoTotal.replace('.', ',')}"`, '', '', 'kg', '', 'AVIATION SECURITY (ASC)', '', 'per kg'],
      ['', 'Gross Weight', `"${metrics.pesoTotal.replace('.', ',')}"`, '', '', 'kg', '', 'Air Waybill Fee (AWB)', '', 'per shipment'],
      ['', 'Volume', `"${metrics.volumeM3.replace('.', ',')}"`, '', '', 'm³', '', 'DG Check Fee', '', 'per shipment'],
      ['', 'Volumetric factor', '"166,67"', '', '', 'kg/m³ (IATA)', '', 'Data transfer fee (custom)', '', 'per shipment'],
      ['', 'Chargeable Weight', `"${metrics.chargeableWeight.replace('.', ',')}"`, '', '', 'kg', '', 'TOTAL COTAÇÃO', '=MAX(I11*E17, I12) + (I13*E17) + I14 + I15 + I16', 'USD'],
      ['', 'Description', `"${fa.tipoCarga?.toUpperCase() || 'CARGA GERAL'}"`, '', '', '', '', 'Estimated Transit Time', '', 'Dias / Voo'],
      ['', 'Packaging', `"${fa.tipoEmbalagem || 'CAIXAS DE PAPELÃO (CARTON BOX)'}"`, '', '', '', '', 'Proposal Validity', '', 'Dias'],
      ['', 'Value of Goods', `"${formatCurrencyBRL(fa.valorMercadoria || 0)}"`, '', '', '', '', 'Airline / Forwarder Name', '', ''],
      ['', 'Pick-up / Delivery', fa.coletaOrigemPorta ? 'Coleta na Origem Requerida' : 'Entrega no Aeroporto de Origem', '', '', '', '', 'Preencha apenas as células amarelas e devolva a proposta ao vendedor.', '', ''],
      ['', '', fa.entregaDestinoPorta ? 'Entrega no Destino Requerida' : 'Retirada no Aeroporto de Destino', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', 'CLIENTE', '', '', '', '', '', 'VENDEDOR', 'GERADO EM', ''],
      ['', briefing.clienteRazaoSocial, '', '', '', '', '', briefing.vendedorNome, dataFormatada, ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', 'COMO PREENCHER  ·  LEGENDA', '', '', '', '', '', '', '', ''],
      ['', 'Amarelo', '"Campos do agente / forwarder (moeda e valores monetários). Ex.: moeda USD, frete 4,85 por kg · mínimo 150,00."', '', '', '', '', '', '', ''],
      ['', 'Azul', '"Dados da carga, editáveis. Volume, peso cobrável e totais se recalculam sozinhos."', '', '', '', '', '', '', ''],
      ['', 'Fórmulas', '"Chargeable Weight = maior entre peso bruto e volume × 166,67 kg/m³ (IATA 1:6000). Total = máx(Frete × CW; Mínimo) + ASC × CW + AWB + DG Check + Data transfer."', '', '', '', '', '', '', ''],
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\r\n');
    return '\uFEFF' + csvContent;
  }

  // Fallback padrão para outros modais
  const rows: string[][] = [
    ['BRIEFING PARA COTAÇÃO LOGÍSTICA (RFQ)'],
    ['Código:', briefing.codigo, 'Data:', new Date(briefing.dataCriacao).toLocaleDateString('pt-BR')],
    ['Cliente:', briefing.clienteRazaoSocial, 'Vendedor:', briefing.vendedorNome],
    ['Serviços:', briefing.servicosSelecionados.join(', ').toUpperCase()],
  ];
  return '\uFEFF' + rows.map((r) => r.join(';')).join('\r\n');
}

/**
 * Dispara download no navegador
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Gera documento HTML/Excel formatado exatamente no layout do anexo oficial
 */
export function generateSupplierRfqExcelHtml(briefing: BriefingData): string {
  if (briefing.servicosSelecionados.includes('frete_aereo') && briefing.dadosFreteAereo) {
    const fa = briefing.dadosFreteAereo;
    const origin = parseAirportInfo(fa.aeroportoOrigem);
    const dest = parseAirportInfo(fa.aeroportoDestino);
    const vols = fa.quantidadeVolumes || 1;
    const metrics = calculateAirMetrics(fa.pesoBrutoKg || 0, vols, fa.medidaUnitaria, fa.medidaTotal);
    const dataFormatada = new Date(briefing.dataCriacao).toLocaleDateString('pt-BR');

    return `<!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <style>
        body { font-family: Calibri, -apple-system, sans-serif; font-size: 11pt; color: #1e293b; background: #ffffff; }
        table { border-collapse: collapse; width: 100%; margin: auto; }
        td, th { padding: 6px 10px; vertical-align: middle; }
        
        .header-main { background-color: #0f172a; color: #ffffff; font-size: 15pt; font-weight: bold; }
        .header-sub { background-color: #0f172a; color: #94a3b8; font-size: 10pt; }
        .badge-code { background-color: #1e293b; color: #38bdf8; font-size: 14pt; font-weight: bold; text-align: center; }
        
        .route-label { font-size: 9pt; color: #64748b; font-weight: bold; text-transform: uppercase; background-color: #f8fafc; }
        .route-iata { font-size: 22pt; font-weight: 800; color: #0284c7; }
        .route-city { font-size: 10pt; font-weight: 600; color: #334155; }
        .plane-symbol { font-size: 20pt; text-align: center; color: #94a3b8; }
        
        .section-header-cargo { background-color: #dbeafe; color: #1e3a8a; font-weight: 800; font-size: 11pt; border-top: 2px solid #3b82f6; border-bottom: 2px solid #3b82f6; }
        .section-header-charges { background-color: #fef08a; color: #854d0e; font-weight: 800; font-size: 11pt; border-top: 2px solid #eab308; border-bottom: 2px solid #eab308; }
        
        .cargo-label { font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0; }
        .cargo-value { font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; text-align: right; }
        .cargo-unit { color: #64748b; font-size: 9pt; border-bottom: 1px solid #e2e8f0; }
        
        .charge-label { font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0; }
        .charge-fill { background-color: #fef9c3; border: 1px solid #facc15; font-weight: bold; color: #713f12; text-align: right; }
        .charge-unit { color: #64748b; font-size: 9pt; border-bottom: 1px solid #e2e8f0; }
        
        .total-row td { background-color: #f8fafc; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; font-size: 13pt; font-weight: 800; color: #0f172a; }
        .total-fill { background-color: #fef08a !important; color: #0f172a !important; text-align: right; font-weight: 900; }
        
        .footer-label { font-size: 9pt; font-weight: bold; color: #64748b; text-transform: uppercase; background-color: #f1f5f9; }
        .footer-value { font-size: 11pt; font-weight: bold; color: #0f172a; }
        
        .legend-title { font-weight: bold; color: #334155; font-size: 10pt; background-color: #e2e8f0; }
        .legend-text { font-size: 9pt; color: #475569; }
      </style>
    </head>
    <body>
      <table>
        <!-- Linha 1 e 2: Cabeçalho Oficial -->
        <tr>
          <td colspan="6" class="header-main">AIR FREIGHT · QUOTE REQUEST</td>
          <td colspan="4" class="route-label" style="text-align: right;">BRIEFING Nº</td>
        </tr>
        <tr>
          <td colspan="6" class="header-sub">Solicitação de Cotação · Frete Aéreo</td>
          <td colspan="4" class="badge-code">${briefing.codigo}</td>
        </tr>
        <tr><td colspan="10" style="height: 10px;"></td></tr>

        <!-- Linha 4, 5 e 6: Bloco Origem e Destino -->
        <tr>
          <td colspan="4" class="route-label">ORIGIN · Origem</td>
          <td colspan="2" class="plane-symbol"></td>
          <td colspan="4" class="route-label">DESTINATION · Destino</td>
        </tr>
        <tr>
          <td colspan="4" class="route-iata">${origin.iata}</td>
          <td colspan="2" class="plane-symbol">✈</td>
          <td colspan="4" class="route-iata">${dest.iata}</td>
        </tr>
        <tr>
          <td colspan="4" class="route-city">${origin.cityCountry}</td>
          <td colspan="2"></td>
          <td colspan="4" class="route-city">${dest.cityCountry}</td>
        </tr>
        <tr><td colspan="10" style="height: 12px;"></td></tr>

        <!-- Títulos das duas Seções -->
        <tr>
          <th colspan="5" class="section-header-cargo">① CARGO DETAILS · Detalhes da carga</th>
          <th colspan="5" class="section-header-charges">② CHARGES · Taxas e valores</th>
        </tr>

        <!-- Linha Pieces / Freight -->
        <tr>
          <td class="cargo-label">Pieces</td>
          <td colspan="3" class="cargo-value">${vols}</td>
          <td class="cargo-unit">pcs</td>
          <td colspan="2" class="charge-label">Freight, Fuel, Risk</td>
          <td colspan="2" class="charge-fill"></td>
          <td class="charge-unit">per kg</td>
        </tr>

        <!-- Linha Dimensions / Min Charge -->
        <tr>
          <td class="cargo-label">Dimensions</td>
          <td class="cargo-value">${metrics.dimL}</td>
          <td class="cargo-value">${metrics.dimW}</td>
          <td class="cargo-value">${metrics.dimH}</td>
          <td class="cargo-unit">cm (L × W × H)</td>
          <td colspan="2" class="charge-label">Minimum charge (Min US$)</td>
          <td colspan="2" class="charge-fill"></td>
          <td class="charge-unit">per shipment</td>
        </tr>

        <!-- Linha Weight per piece / ASC -->
        <tr>
          <td class="cargo-label">Weight per piece</td>
          <td colspan="3" class="cargo-value">${metrics.pesoUnitario.replace('.', ',')}</td>
          <td class="cargo-unit">kg</td>
          <td colspan="2" class="charge-label">AVIATION SECURITY (ASC)</td>
          <td colspan="2" class="charge-fill"></td>
          <td class="charge-unit">per kg</td>
        </tr>

        <!-- Linha Total pieces / AWB -->
        <tr>
          <td class="cargo-label">Total of ${vols} pieces</td>
          <td colspan="3" class="cargo-value">${metrics.pesoTotal.replace('.', ',')}</td>
          <td class="cargo-unit">kg</td>
          <td colspan="2" class="charge-label">Air Waybill Fee (AWB)</td>
          <td colspan="2" class="charge-fill"></td>
          <td class="charge-unit">per shipment</td>
        </tr>

        <!-- Linha Gross Weight / DG Check -->
        <tr>
          <td class="cargo-label">Gross Weight</td>
          <td colspan="3" class="cargo-value">${metrics.pesoTotal.replace('.', ',')}</td>
          <td class="cargo-unit">kg</td>
          <td colspan="2" class="charge-label">DG Check Fee</td>
          <td colspan="2" class="charge-fill"></td>
          <td class="charge-unit">per shipment</td>
        </tr>

        <!-- Linha Volume / Data transfer -->
        <tr>
          <td class="cargo-label">Volume</td>
          <td colspan="3" class="cargo-value">${metrics.volumeM3.replace('.', ',')}</td>
          <td class="cargo-unit">m³</td>
          <td colspan="2" class="charge-label">Data transfer fee (custom)</td>
          <td colspan="2" class="charge-fill"></td>
          <td class="charge-unit">per shipment</td>
        </tr>

        <!-- Linha Volumetric Factor / TOTAL -->
        <tr class="total-row">
          <td class="cargo-label">Volumetric factor</td>
          <td colspan="3" class="cargo-value">166,67</td>
          <td class="cargo-unit">kg/m³ (IATA)</td>
          <td colspan="2" style="font-weight: 800;">TOTAL</td>
          <td colspan="2" class="total-fill">=MAX(H10*C17, H11) + (H12*C17) + H13 + H14 + H15</td>
          <td></td>
        </tr>

        <!-- Linha Chargeable Weight / Transit Time -->
        <tr>
          <td class="cargo-label" style="font-weight: 800; color: #0284c7;">Chargeable Weight</td>
          <td colspan="3" class="cargo-value" style="color: #0284c7;">${metrics.chargeableWeight.replace('.', ',')}</td>
          <td class="cargo-unit">kg</td>
          <td colspan="2" class="charge-label">Estimated Transit Time</td>
          <td colspan="2" class="charge-fill"></td>
          <td class="charge-unit">Dias / Voo</td>
        </tr>

        <!-- Linha Description / Validity -->
        <tr>
          <td class="cargo-label">Description</td>
          <td colspan="4" class="cargo-value" style="text-align: left; color: #0369a1;">${fa.tipoCarga?.toUpperCase() || 'CARGA GERAL'}</td>
          <td colspan="2" class="charge-label">Proposal Validity</td>
          <td colspan="2" class="charge-fill"></td>
          <td class="charge-unit">Dias</td>
        </tr>

        <!-- Linha Packaging / Airline -->
        <tr>
          <td class="cargo-label">Packaging</td>
          <td colspan="4" class="cargo-value" style="text-align: left;">${fa.tipoEmbalagem || 'CAIXAS DE PAPELÃO (CARTON BOX)'}</td>
          <td colspan="2" class="charge-label">Airline / Forwarder Name</td>
          <td colspan="3" class="charge-fill"></td>
        </tr>

        <!-- Linha Value of Goods / Instruções -->
        <tr>
          <td class="cargo-label">Value of Goods</td>
          <td colspan="4" class="cargo-value" style="text-align: left;">${formatCurrencyBRL(fa.valorMercadoria || 0)}</td>
          <td colspan="5" style="font-size: 8.5pt; color: #713f12; background-color: #fefce8; font-style: italic; padding: 6px;">
            Preencha apenas as células amarelas e devolva a proposta ao vendedor. O total é calculado automaticamente.
          </td>
        </tr>

        <!-- Linha Coleta / Entrega -->
        <tr>
          <td class="cargo-label">Pick-up / Delivery</td>
          <td colspan="4" style="font-size: 9.5pt; color: #334155; border-bottom: 1px solid #e2e8f0;">
            ${fa.coletaOrigemPorta ? '✓ Coleta na Origem Requerida' : '— Entrega no Aeroporto de Origem'}
          </td>
          <td colspan="5"></td>
        </tr>
        <tr>
          <td></td>
          <td colspan="4" style="font-size: 9.5pt; color: #334155; border-bottom: 1px solid #e2e8f0;">
            ${fa.entregaDestinoPorta ? '✓ Entrega no Destino Requerida' : '— Retirada no Aeroporto de Destino'}
          </td>
          <td colspan="5"></td>
        </tr>
        <tr><td colspan="10" style="height: 14px;"></td></tr>

        <!-- Rodapé Cliente, Vendedor e Data -->
        <tr>
          <td colspan="5" class="footer-label">CLIENTE</td>
          <td colspan="3" class="footer-label">VENDEDOR</td>
          <td colspan="2" class="footer-label">GERADO EM</td>
        </tr>
        <tr>
          <td colspan="5" class="footer-value">${briefing.clienteRazaoSocial}</td>
          <td colspan="3" class="footer-value">${briefing.vendedorNome}</td>
          <td colspan="2" class="footer-value">${dataFormatada}</td>
        </tr>
        <tr><td colspan="10" style="height: 14px;"></td></tr>

        <!-- Legenda e Instruções -->
        <tr>
          <td colspan="10" class="legend-title">COMO PREENCHER · LEGENDA</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #854d0e; background-color: #fef9c3;">Amarelo</td>
          <td colspan="9" class="legend-text">Campos do agente / forwarder (valores em US$). Ex.: frete 4,85 por kg · mínimo 150,00.</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #1e40af; background-color: #dbeafe;">Azul</td>
          <td colspan="9" class="legend-text">Dados da carga, editáveis. Volume, peso cobrável e totais se recalculam sozinhos.</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #0f172a;">Fórmulas</td>
          <td colspan="9" class="legend-text">Chargeable Weight = maior entre peso bruto e volume × 166,67 kg/m³ (IATA 1:6000). Total = máx(Frete × CW; Mínimo) + ASC × CW + AWB + DG Check + Data transfer.</td>
        </tr>
      </table>
    </body>
    </html>`;
  }

  // Template padrão para Transporte Rodoviário e Outros
  return `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"/></head>
  <body>
    <h2>COTAÇÃO LOGÍSTICA (RFQ Nº ${briefing.codigo})</h2>
    <p>Cliente: ${briefing.clienteRazaoSocial} | Vendedor: ${briefing.vendedorNome}</p>
  </body>
  </html>`;
}
