import ExcelJS from 'exceljs';
import { BriefingData } from '../types/logistics';
import { parseAirportInfo, calculateAirMetrics } from './exportService';
import { formatCurrencyBRL } from './cepService';

/**
 * Gera arquivo nativo .xlsx com layout 100% idêntico à imagem de referência
 * com seletor de MOEDA, campos de valores monetários e bloqueio estrito de células.
 */
export async function generateProtectedAirFreightXlsx(
  briefing: BriefingData,
  defaultCurrency: string = 'USD'
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BPG Logística';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Cotação Aérea', {
    views: [{ showGridLines: true }]
  });

  const fa = briefing.dadosFreteAereo;
  const origin = parseAirportInfo(fa?.aeroportoOrigem);
  const dest = parseAirportInfo(fa?.aeroportoDestino);
  const vols = fa?.quantidadeVolumes || 1;
  const metrics = calculateAirMetrics(fa?.pesoBrutoKg || 0, vols, fa?.medidaUnitaria, fa?.medidaTotal);
  const dataFormatada = new Date(briefing.dataCriacao).toLocaleDateString('pt-BR');

  // Largura das colunas (A até K)
  ws.columns = [
    { key: 'A', width: 4 },
    { key: 'B', width: 22 },
    { key: 'C', width: 9 },
    { key: 'D', width: 9 },
    { key: 'E', width: 12 },
    { key: 'F', width: 15 },
    { key: 'G', width: 4 },
    { key: 'H', width: 28 },
    { key: 'I', width: 15 },
    { key: 'J', width: 15 },
    { key: 'K', width: 4 },
  ];

  const thinBorder = {
    top: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
  };

  const navyDark = 'FF0B2545';
  const blueMedium = 'FF0070BA';
  const cyanBlue = 'FF0284C7';
  const yellowFill = 'FFFEF08A';
  const yellowBorder = {
    top: { style: 'thin' as const, color: { argb: 'FFFACC15' } },
    left: { style: 'thin' as const, color: { argb: 'FFFACC15' } },
    bottom: { style: 'thin' as const, color: { argb: 'FFFACC15' } },
    right: { style: 'thin' as const, color: { argb: 'FFFACC15' } },
  };

  // Linha 2: Barra superior azul escura e títulos
  for (let c = 2; c <= 10; c++) {
    const cell = ws.getCell(2, c);
    cell.border = { top: { style: 'medium', color: { argb: navyDark } } };
  }
  const b2 = ws.getCell('B2');
  b2.value = 'AIR FREIGHT  ·  QUOTE REQUEST';
  b2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: cyanBlue } };

  const j2 = ws.getCell('J2');
  j2.value = 'BRIEFING Nº';
  j2.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF64748B' } };
  j2.alignment = { horizontal: 'right' };

  // Linha 3
  const b3 = ws.getCell('B3');
  b3.value = 'Solicitação de Cotação · Frete Aéreo';
  b3.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0F172A' } };

  const j3 = ws.getCell('J3');
  j3.value = briefing.codigo;
  j3.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0F172A' } };
  j3.alignment = { horizontal: 'right' };

  // Linha 5: Labels de Origem e Destino
  const b5 = ws.getCell('B5');
  b5.value = 'ORIGIN · Origem';
  b5.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF64748B' } };

  const h5 = ws.getCell('H5');
  h5.value = 'DESTINATION · Destino';
  h5.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF64748B' } };

  // Linha 6: Códigos IATA e Avião
  const b6 = ws.getCell('B6');
  b6.value = origin.iata;
  b6.font = { name: 'Calibri', size: 28, bold: true, color: { argb: cyanBlue } };

  const f6 = ws.getCell('F6');
  f6.value = '✈';
  f6.font = { name: 'Calibri', size: 20, color: { argb: 'FF94A3B8' } };
  f6.alignment = { horizontal: 'center', vertical: 'middle' };

  const h6 = ws.getCell('H6');
  h6.value = dest.iata;
  h6.font = { name: 'Calibri', size: 28, bold: true, color: { argb: cyanBlue } };

  // Linha 7: Nomes das Cidades
  const b7 = ws.getCell('B7');
  b7.value = origin.cityCountry;
  b7.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };

  const h7 = ws.getCell('H7');
  h7.value = dest.cityCountry;
  h7.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };

  // Linha 9: Headers das duas seções
  ws.mergeCells('B9:F9');
  const b9 = ws.getCell('B9');
  b9.value = '①  CARGO DETAILS  ·  Detalhes da carga';
  b9.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  b9.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navyDark } };
  b9.alignment = { horizontal: 'left', indent: 1 };

  ws.mergeCells('H9:J9');
  const h9 = ws.getCell('H9');
  h9.value = '②  CHARGES  ·  Taxas e valores';
  h9.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  h9.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: blueMedium } };
  h9.alignment = { horizontal: 'left', indent: 1 };

  // Helper para formatar linhas padrão da tabela de carga (ESQUERDA)
  const setCargoRow = (row: number, label: string, val: string | number, unit?: string, isHighlighted?: boolean) => {
    const lbl = ws.getCell(`B${row}`);
    lbl.value = label;
    lbl.font = { name: 'Calibri', size: 10, bold: true };
    lbl.border = thinBorder;
    lbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

    ws.mergeCells(`C${row}:D${row}`);
    const cd = ws.getCell(`C${row}`);
    cd.border = thinBorder;

    const valCell = ws.getCell(`E${row}`);
    valCell.value = val;
    valCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: isHighlighted ? cyanBlue : 'FF0F172A' } };
    valCell.alignment = { horizontal: 'right' };
    valCell.border = thinBorder;

    const unitCell = ws.getCell(`F${row}`);
    unitCell.value = unit || '';
    unitCell.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
    unitCell.border = thinBorder;
  };

  // Helper para formatar campos de VALORES MONETÁRIOS do fornecedor (AMARELO e DESBLOQUEADO)
  const setMoneyChargeRow = (row: number, label: string, unit: string) => {
    const lbl = ws.getCell(`H${row}`);
    lbl.value = label;
    lbl.font = { name: 'Calibri', size: 10, bold: true };
    lbl.border = thinBorder;

    const fillCell = ws.getCell(`I${row}`);
    fillCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: yellowFill } };
    fillCell.border = yellowBorder;
    fillCell.alignment = { horizontal: 'right' };
    fillCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF713F12' } };
    fillCell.numFmt = '#,##0.00';
    // DESBLOQUEADA PARA EDIÇÃO!
    fillCell.protection = { locked: false };

    const unitCell = ws.getCell(`J${row}`);
    unitCell.value = unit;
    unitCell.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
    unitCell.border = thinBorder;
  };

  // Linha 10: Pieces (Esquerda) e NOVO CAMPO DE MOEDA (Direita)
  setCargoRow(10, 'Pieces', vols, 'pcs');

  // CAMPO DE MOEDA DA PROPOSTA (AMARELO, DESBLOQUEADO COM VALIDAÇÃO)
  const h10 = ws.getCell('H10');
  h10.value = 'Currency · Moeda da Proposta';
  h10.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
  h10.border = thinBorder;
  h10.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F7FF' } };

  const i10 = ws.getCell('I10');
  i10.value = defaultCurrency || 'USD';
  i10.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: yellowFill } };
  i10.border = yellowBorder;
  i10.alignment = { horizontal: 'center' };
  i10.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF713F12' } };
  i10.protection = { locked: false }; // DESBLOQUEADO
  i10.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"USD,BRL,EUR,ARS,CLP,GBP"'],
    showErrorMessage: true,
    errorTitle: 'Moeda Inválida',
    error: 'Por favor escolha uma moeda válida da lista (USD, BRL, EUR, ARS, etc).'
  };

  const j10 = ws.getCell('J10');
  j10.value = 'USD / BRL / EUR / ARS';
  j10.font = { name: 'Calibri', size: 8, italic: true, color: { argb: 'FF64748B' } };
  j10.border = thinBorder;

  // Linha 11: Dimensions (Esquerda) e Freight, Fuel, Risk em Moeda (Direita)
  const b11 = ws.getCell('B11');
  b11.value = 'Dimensions';
  b11.font = { name: 'Calibri', size: 10, bold: true };
  b11.border = thinBorder;
  b11.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

  const c11 = ws.getCell('C11');
  c11.value = parseFloat(metrics.dimL) || 120;
  c11.font = { name: 'Calibri', size: 10, bold: true, color: { argb: cyanBlue } };
  c11.alignment = { horizontal: 'center' };
  c11.border = thinBorder;

  const d11 = ws.getCell('D11');
  d11.value = parseFloat(metrics.dimW) || 120;
  d11.font = { name: 'Calibri', size: 10, bold: true, color: { argb: cyanBlue } };
  d11.alignment = { horizontal: 'center' };
  d11.border = thinBorder;

  const e11 = ws.getCell('E11');
  e11.value = parseFloat(metrics.dimH) || 120;
  e11.font = { name: 'Calibri', size: 10, bold: true, color: { argb: cyanBlue } };
  e11.alignment = { horizontal: 'center' };
  e11.border = thinBorder;

  const f11 = ws.getCell('F11');
  f11.value = 'cm (L × W × H)';
  f11.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
  f11.border = thinBorder;

  setMoneyChargeRow(11, 'Freight, Fuel, Risk', 'per kg');

  // Linha 12: Weight per piece & Minimum Charge (Moeda)
  setCargoRow(12, 'Weight per piece', metrics.pesoUnitario.replace('.', ','), 'kg');
  setMoneyChargeRow(12, 'Minimum charge (Min)', 'per shipment');

  // Linha 13: Total pieces & ASC (Moeda)
  setCargoRow(13, `Total of ${vols} pieces`, metrics.pesoTotal.replace('.', ','), 'kg');
  setMoneyChargeRow(13, 'AVIATION SECURITY (ASC)', 'per kg');

  // Linha 14: Gross Weight & AWB (Moeda)
  setCargoRow(14, 'Gross Weight', metrics.pesoTotal.replace('.', ','), 'kg');
  setMoneyChargeRow(14, 'Air Waybill Fee (AWB)', 'per shipment');

  // Linha 15: Volume & DG Check (Moeda)
  setCargoRow(15, 'Volume', metrics.volumeM3.replace('.', ','), 'm³');
  setMoneyChargeRow(15, 'DG Check Fee', 'per shipment');

  // Linha 16: Volumetric factor & Data Transfer (Moeda)
  setCargoRow(16, 'Volumetric factor', '166,67', 'kg/m³ (IATA)');
  setMoneyChargeRow(16, 'Data transfer fee (custom)', 'per shipment');

  // Linha 17: Chargeable Weight (Esquerda) e TOTAL (Direita com cálculo automático em Moeda)
  setCargoRow(17, 'Chargeable Weight', metrics.chargeableWeight.replace('.', ','), 'kg', true);
  const cwCell = ws.getCell('E17');
  cwCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: cyanBlue } };

  // TOTAL Linha 17: H17 rótulo, I17 fórmula em moeda, J17 unidade
  const h17 = ws.getCell('H17');
  h17.value = 'TOTAL COTAÇÃO';
  h17.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  h17.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navyDark } };
  h17.alignment = { horizontal: 'left', indent: 1 };
  h17.border = thinBorder;

  const i17 = ws.getCell('I17');
  i17.value = { formula: 'MAX(I11*E17, I12) + (I13*E17) + I14 + I15 + I16' };
  i17.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  i17.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navyDark } };
  i17.alignment = { horizontal: 'right' };
  i17.numFmt = '#,##0.00';
  i17.border = thinBorder;

  const j17 = ws.getCell('J17');
  j17.value = { formula: 'I10' }; // Mostra o código da moeda definida dinamicamente!
  j17.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  j17.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navyDark } };
  j17.alignment = { horizontal: 'center' };
  j17.border = thinBorder;

  // Linha 18: Description & Estimated Transit Time
  const b18 = ws.getCell('B18');
  b18.value = 'Description';
  b18.font = { name: 'Calibri', size: 10, bold: true };
  b18.border = thinBorder;
  b18.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

  ws.mergeCells('C18:F18');
  const c18 = ws.getCell('C18');
  c18.value = fa?.tipoCarga?.toUpperCase() || 'MEDICAMENTO';
  c18.font = { name: 'Calibri', size: 10, bold: true, color: { argb: cyanBlue } };
  c18.border = thinBorder;

  const h18 = ws.getCell('H18');
  h18.value = 'Estimated Transit Time';
  h18.font = { name: 'Calibri', size: 10, bold: true };
  h18.border = thinBorder;

  const i18 = ws.getCell('I18');
  i18.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: yellowFill } };
  i18.border = yellowBorder;
  i18.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF713F12' } };
  i18.alignment = { horizontal: 'right' };
  i18.protection = { locked: false }; // DESBLOQUEADO

  const j18 = ws.getCell('J18');
  j18.value = 'Dias / Voo';
  j18.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
  j18.border = thinBorder;

  // Linha 19: Packaging & Proposal Validity
  const b19 = ws.getCell('B19');
  b19.value = 'Packaging';
  b19.font = { name: 'Calibri', size: 10, bold: true };
  b19.border = thinBorder;
  b19.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

  ws.mergeCells('C19:F19');
  const c19 = ws.getCell('C19');
  c19.value = fa?.tipoEmbalagem || 'CAIXAS DE PAPELÃO (CARTON BOX)';
  c19.font = { name: 'Calibri', size: 10, color: { argb: cyanBlue } };
  c19.border = thinBorder;

  const h19 = ws.getCell('H19');
  h19.value = 'Proposal Validity';
  h19.font = { name: 'Calibri', size: 10, bold: true };
  h19.border = thinBorder;

  const i19 = ws.getCell('I19');
  i19.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: yellowFill } };
  i19.border = yellowBorder;
  i19.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF713F12' } };
  i19.alignment = { horizontal: 'right' };
  i19.protection = { locked: false }; // DESBLOQUEADO

  const j19 = ws.getCell('J19');
  j19.value = 'Dias';
  j19.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
  j19.border = thinBorder;

  // Linha 20: Value of Goods & Airline Name
  const b20 = ws.getCell('B20');
  b20.value = 'Value of Goods';
  b20.font = { name: 'Calibri', size: 10, bold: true };
  b20.border = thinBorder;
  b20.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

  ws.mergeCells('C20:F20');
  const c20 = ws.getCell('C20');
  c20.value = formatCurrencyBRL(fa?.valorMercadoria || 0);
  c20.font = { name: 'Calibri', size: 10, bold: true, color: { argb: cyanBlue } };
  c20.alignment = { horizontal: 'right' };
  c20.border = thinBorder;

  const h20 = ws.getCell('H20');
  h20.value = 'Airline / Forwarder Name';
  h20.font = { name: 'Calibri', size: 10, bold: true };
  h20.border = thinBorder;

  ws.mergeCells('I20:J20');
  const i20 = ws.getCell('I20');
  i20.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: yellowFill } };
  i20.border = yellowBorder;
  i20.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF713F12' } };
  i20.protection = { locked: false }; // DESBLOQUEADO

  // Linha 21 e 22: Pick-up / Delivery & Nota
  const b21 = ws.getCell('B21');
  b21.value = 'Pick-up / Delivery';
  b21.font = { name: 'Calibri', size: 10, bold: true };
  b21.border = thinBorder;
  b21.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

  ws.mergeCells('C21:F21');
  const c21 = ws.getCell('C21');
  c21.value = fa?.coletaOrigemPorta ? 'Coleta na Origem Requerida' : 'Entrega no Aeroporto de Origem';
  c21.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF334155' } };
  c21.border = thinBorder;

  ws.mergeCells('H21:J21');
  const h21 = ws.getCell('H21');
  h21.value = 'Preencha apenas as células amarelas e devolva a proposta ao vendedor. O total é calculado automaticamente.';
  h21.font = { name: 'Calibri', size: 8, italic: true, color: { argb: 'FF64748B' } };
  h21.alignment = { wrapText: true };

  const b22 = ws.getCell('B22');
  b22.border = thinBorder;
  b22.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

  ws.mergeCells('C22:F22');
  const c22 = ws.getCell('C22');
  c22.value = fa?.entregaDestinoPorta ? 'Entrega no Destino Requerida' : 'Retirada no Aeroporto de Destino';
  c22.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF334155' } };
  c22.border = thinBorder;

  // Linha 24: Headers Rodapé
  const b24 = ws.getCell('B24');
  b24.value = 'CLIENTE';
  b24.font = { name: 'Calibri', size: 8, bold: true, color: { argb: 'FF64748B' } };

  const h24 = ws.getCell('H24');
  h24.value = 'VENDEDOR';
  h24.font = { name: 'Calibri', size: 8, bold: true, color: { argb: 'FF64748B' } };

  const j24 = ws.getCell('J24');
  j24.value = 'GERADO EM';
  j24.font = { name: 'Calibri', size: 8, bold: true, color: { argb: 'FF64748B' } };

  // Linha 25: Valores Rodapé
  ws.mergeCells('B25:F25');
  const b25 = ws.getCell('B25');
  b25.value = briefing.clienteRazaoSocial;
  b25.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };

  const h25 = ws.getCell('H25');
  h25.value = briefing.vendedorNome;
  h25.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };

  const j25 = ws.getCell('J25');
  j25.value = dataFormatada;
  j25.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };

  // Linha 27: Título Legenda
  const b27 = ws.getCell('B27');
  b27.value = 'COMO PREENCHER · LEGENDA';
  b27.font = { name: 'Calibri', size: 9, bold: true, color: { argb: cyanBlue } };

  // Linha 28: Amarelo
  const b28 = ws.getCell('B28');
  b28.value = 'Amarelo';
  b28.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF854D0E' } };
  b28.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: yellowFill } };
  b28.alignment = { horizontal: 'center' };
  b28.border = thinBorder;

  ws.mergeCells('C28:J28');
  const c28 = ws.getCell('C28');
  c28.value = 'Campos do agente / forwarder (moeda e valores monetários). Ex.: moeda USD, frete 4,85/kg · mínimo 150,00.';
  c28.font = { name: 'Calibri', size: 9, color: { argb: 'FF334155' } };
  c28.border = thinBorder;

  // Linha 29: Azul
  const b29 = ws.getCell('B29');
  b29.value = 'Azul';
  b29.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF1E40AF' } };
  b29.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
  b29.alignment = { horizontal: 'center' };
  b29.border = thinBorder;

  ws.mergeCells('C29:J29');
  const c29 = ws.getCell('C29');
  c29.value = 'Dados da carga, editáveis. Volume, peso cobrável e totais se recalculam sozinhos.';
  c29.font = { name: 'Calibri', size: 9, color: { argb: 'FF334155' } };
  c29.border = thinBorder;

  // Linha 30: Fórmulas
  const b30 = ws.getCell('B30');
  b30.value = 'Fórmulas';
  b30.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  b30.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  b30.alignment = { horizontal: 'center' };
  b30.border = thinBorder;

  ws.mergeCells('C30:J30');
  const c30 = ws.getCell('C30');
  c30.value = 'Chargeable Weight = maior entre peso bruto e volume × 166,67 kg/m³ (IATA 1:6000). Total = máx(Frete × CW; Mínimo) + ASC × CW + AWB + DG Check + Data transfer.';
  c30.font = { name: 'Calibri', size: 9, color: { argb: 'FF334155' } };
  c30.border = thinBorder;

  // ATIVAÇÃO DA PROTEÇÃO DA PLANILHA (BLOQUEIO DE TODAS AS CÉLULAS EXCETO AS AMARELAS)
  await ws.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
