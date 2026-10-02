import React, { useState, useEffect } from 'react';
import { Building2, ArrowRight, ArrowLeft, Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { BriefingData } from '../../types/logistics';
import { formatCNPJ, formatPhone, sanitizeCnpj, fetchCompanyByCnpj, CnpjCompanyData } from '../../services/cepService';

interface ClientInfoFormProps {
  briefing: BriefingData;
  onChange: (updated: Partial<BriefingData>) => void;
  onProceed: () => void;
  onBack: () => void;
}

export const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  briefing,
  onChange,
  onProceed,
  onBack,
}) => {
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleCnpjChange = (raw: string) => {
    const formatted = formatCNPJ(raw);
    onChange({ clienteCnpj: formatted });
    setCnpjFeedback({ type: null, message: '' });

    const clean = sanitizeCnpj(raw);
    if (clean.length === 14) {
      triggerCnpjLookup(clean);
    }
  };

  const triggerCnpjLookup = async (cleanCnpj?: string) => {
    const targetCnpj = cleanCnpj || sanitizeCnpj(briefing.clienteCnpj);
    if (targetCnpj.length !== 14) {
      setCnpjFeedback({
        type: 'error',
        message: 'O CNPJ DEVE CONTER 14 DÍGITOS PARA CONSULTA NA RECEITA.',
      });
      return;
    }

    setIsLoadingCnpj(true);
    setCnpjFeedback({ type: null, message: '' });

    try {
      const companyData: CnpjCompanyData = await fetchCompanyByCnpj(targetCnpj);

      // Auto-preenche os dados cadastrais
      const patch: Partial<BriefingData> = {
        clienteRazaoSocial: companyData.razaoSocial,
      };

      if (companyData.telefone && !briefing.clienteTelefone) {
        patch.clienteTelefone = companyData.telefone;
      }
      if (companyData.email && !briefing.clienteEmail) {
        patch.clienteEmail = companyData.email;
      }

      onChange(patch);
      setCnpjFeedback({
        type: 'success',
        message: `DADOS LOCALIZADOS: ${companyData.razaoSocial} (${companyData.situacaoCadastral || 'ATIVA'})`,
      });
    } catch (err: unknown) {
      setCnpjFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'ERRO AO CONSULTAR CNPJ NA RECEITA FEDERAL.',
      });
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const isFormValid = () => {
    return (
      Boolean(briefing.clienteRazaoSocial.trim()) &&
      Boolean(briefing.clienteContato.trim())
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 uppercase">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 uppercase">
          DADOS DO EMBARCADOR / CLIENTE
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
          PARA QUAL CLIENTE É ESTA COTAÇÃO?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 uppercase">
          VENDEDOR RESPONSÁVEL: <strong className="text-blue-600 uppercase">{briefing.vendedorNome}</strong> ({briefing.codigo})
        </p>
      </div>

      {/* Card do Formulário */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">DADOS DA EMPRESA / EMBARCADOR</h3>
            <p className="text-xs text-slate-500 uppercase">DIGITE O CNPJ PARA PREENCHIMENTO AUTOMÁTICO VIA RECEITA FEDERAL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
          {/* 1º CAMPO: CNPJ (PRIMEIRO CAMPO OBRIGATÓRIO/DESTAQUE) */}
          <div className="sm:col-span-12 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                1. CNPJ DO CLIENTE / EMBARCADOR *
              </label>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                BUSCA AUTOMÁTICA NA RECEITA FEDERAL
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={briefing.clienteCnpj}
                  onChange={(e) => handleCnpjChange(e.target.value)}
                  maxLength={18}
                  className="w-full px-4 py-2.5 text-base font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-wider uppercase"
                />
                {isLoadingCnpj && (
                  <div className="absolute right-3.5 top-3 text-blue-600 animate-spin">
                    <Loader2 className="w-5 h-5" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => triggerCnpjLookup()}
                disabled={isLoadingCnpj || sanitizeCnpj(briefing.clienteCnpj).length < 14}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:cursor-not-allowed uppercase"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">CONSULTAR CNPJ</span>
              </button>
            </div>

            {/* Feedback da API */}
            {isLoadingCnpj && (
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-medium uppercase animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                CONSULTANDO RECEITA FEDERAL E CARREGANDO DADOS DA EMPRESA...
              </p>
            )}

            {cnpjFeedback.type === 'success' && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 uppercase font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cnpjFeedback.message}</span>
              </div>
            )}

            {cnpjFeedback.type === 'error' && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 uppercase font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{cnpjFeedback.message}</span>
              </div>
            )}
          </div>

          {/* 2º CAMPO: RAZÃO SOCIAL OU NOME FANTASIA */}
          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
              2. RAZÃO SOCIAL OU NOME FANTASIA *
            </label>
            <input
              type="text"
              placeholder="EX: INDÚSTRIA METALÚRGICA BRASIL S/A"
              value={briefing.clienteRazaoSocial}
              onChange={(e) => onChange({ clienteRazaoSocial: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold uppercase"
            />
          </div>

          {/* 3º CAMPO: NOME DO CONTATO PRINCIPAL */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
              3. CONTATO PRINCIPAL *
            </label>
            <input
              type="text"
              placeholder="EX: MARIANA SILVEIRA (COMPRAS)"
              value={briefing.clienteContato}
              onChange={(e) => onChange({ clienteContato: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-medium"
            />
          </div>

          {/* 4º CAMPO: TELEFONE / WHATSAPP */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
              4. TELEFONE / WHATSAPP
            </label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={briefing.clienteTelefone}
              onChange={(e) => onChange({ clienteTelefone: formatPhone(e.target.value) })}
              className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          {/* 5º CAMPO: E-MAIL DE CONTATO */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
              5. E-MAIL DE CONTATO
            </label>
            <input
              type="email"
              placeholder="COMPRAS@CLIENTE.COM.BR"
              value={briefing.clienteEmail}
              onChange={(e) => onChange({ clienteEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-medium"
            />
          </div>
        </div>

        {/* OBSERVAÇÕES GERAIS */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
            CONTEXTO OU PARTICULARIDADE DA NEGOCIAÇÃO (OPCIONAL)
          </label>
          <textarea
            rows={2}
            placeholder="EX: COTAÇÃO URGENTE COM NECESSIDADE DE INÍCIO NA PRIMEIRA SEMANA DO MÊS. CLIENTE SENSÍVEL A TRANSIT TIME."
            value={briefing.observacoesGerais || ''}
            onChange={(e) => onChange({ observacoesGerais: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          />
        </div>
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition uppercase cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR AOS SERVIÇOS</span>
        </button>

        <button
          type="button"
          disabled={!isFormValid()}
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer disabled:cursor-not-allowed uppercase"
        >
          <span>AVANÇAR PARA DETALHES OPERACIONAIS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
