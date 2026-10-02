import React, { useState, useEffect } from 'react';
import { MapPin, Search, CheckCircle2, AlertCircle, Loader2, Edit3, Lock, Building, Clock } from 'lucide-react';
import { CepAddress } from '../types/logistics';
import { fetchAddressByCep, formatCep, sanitizeCep } from '../services/cepService';

interface CepFieldProps {
  label: string;
  helperText?: string;
  value: CepAddress;
  onChange: (updated: CepAddress) => void;
  required?: boolean;
}

export const CepField: React.FC<CepFieldProps> = ({
  label,
  helperText,
  value,
  onChange,
  required = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualEdit, setManualEdit] = useState(false);
  const [successSource, setSuccessSource] = useState<string | null>(null);

  // Consulta automática quando o CEP atingir 8 dígitos
  const handleCepChange = async (rawInput: string) => {
    const formatted = formatCep(rawInput);
    const clean = sanitizeCep(rawInput);

    onChange({
      ...value,
      cep: formatted,
    });
    setError(null);

    if (clean.length === 8) {
      await executeCepLookup(clean);
    }
  };

  const executeCepLookup = async (cleanCep: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAddressByCep(cleanCep);
      onChange({
        ...value,
        cep: res.cep,
        logradouro: res.logradouro || value.logradouro || '',
        bairro: res.bairro || value.bairro || '',
        cidade: res.cidade,
        uf: res.uf,
      });
      setSuccessSource(res.origemApi);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao consultar CEP';
      setError(msg);
      setManualEdit(true); // Se falhar, libera digitação manual imediatamente
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              {label}
              {required && <span className="text-rose-500 font-bold">*</span>}
            </h4>
            {helperText && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setManualEdit(!manualEdit)}
          className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 transition"
        >
          {manualEdit ? <Lock className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          {manualEdit ? 'Bloquear edição' : 'Editar dados'}
        </button>
      </div>

      {/* Campo principal do CEP */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
        <div className="sm:col-span-4">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            CEP (apenas números)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="00000-000"
              maxLength={9}
              value={value.cep || ''}
              onChange={(e) => handleCepChange(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-sm font-mono font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="button"
              disabled={loading || sanitizeCep(value.cep || '').length !== 8}
              onClick={() => executeCepLookup(sanitizeCep(value.cep || ''))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 disabled:opacity-40 transition"
              title="Buscar CEP"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Feedback visual da API */}
        <div className="sm:col-span-8 flex items-end">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 pb-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Consultando base nacional de CEP...
            </div>
          )}
          {successSource && !loading && !error && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Endereço preenchido automaticamente ({successSource.toUpperCase()})
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 pb-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Campos de endereço (Logradouro, Bairro, Cidade, UF) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
        <div className="sm:col-span-7">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Logradouro / Rua / Rodovia
          </label>
          <input
            type="text"
            placeholder="Ex: Av. das Indústrias, Km 42"
            value={value.logradouro || ''}
            disabled={!manualEdit && Boolean(value.cidade)}
            onChange={(e) => onChange({ ...value, logradouro: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Número
          </label>
          <input
            type="text"
            placeholder="Nº ou S/N"
            value={value.numero || ''}
            onChange={(e) => onChange({ ...value, numero: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Complemento / Galpão
          </label>
          <input
            type="text"
            placeholder="Galpão 03, Bloco B"
            value={value.complemento || ''}
            onChange={(e) => onChange({ ...value, complemento: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
        <div className="sm:col-span-5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Bairro
          </label>
          <input
            type="text"
            placeholder="Ex: Distrito Industrial"
            value={value.bairro || ''}
            disabled={!manualEdit && Boolean(value.cidade)}
            onChange={(e) => onChange({ ...value, bairro: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="sm:col-span-5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cidade
          </label>
          <input
            type="text"
            placeholder="Cidade"
            value={value.cidade || ''}
            disabled={!manualEdit && Boolean(value.cidade)}
            onChange={(e) => onChange({ ...value, cidade: e.target.value })}
            className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            UF
          </label>
          <input
            type="text"
            placeholder="UF"
            maxLength={2}
            value={value.uf || ''}
            disabled={!manualEdit && Boolean(value.cidade)}
            onChange={(e) => onChange({ ...value, uf: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 text-sm font-bold text-center uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Condições Logísticas do Local (Doca, Agendamento, Horários) */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            Infraestrutura de Carga/Descarga
          </label>
          <select
            value={value.tipoLocal || 'doca'}
            onChange={(e) => onChange({ ...value, tipoLocal: e.target.value as any })}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="doca">Doca com Nivelador Hidráulico</option>
            <option value="plataforma">Plataforma Padrão</option>
            <option value="nivel_zero">Nível Zero (Chão / Empilhadeira de Pátio)</option>
            <option value="patio_aberto">Pátio Aberto / Exige Munck ou Guindaste</option>
            <option value="porto_retroportuario">Terminal Portuário / Retroárea</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Janela de Horário
          </label>
          <input
            type="text"
            placeholder="Ex: 08:00 às 17:00 (Seg a Sex)"
            value={value.horarioRecebimento || ''}
            onChange={(e) => onChange({ ...value, horarioRecebimento: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center pt-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(value.agendamentoObrigatorio)}
              onChange={(e) => onChange({ ...value, agendamentoObrigatorio: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Exige Agendamento Prévio
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
