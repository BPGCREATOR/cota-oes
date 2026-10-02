import React, { useState } from 'react';
import { User, ArrowRight, UserCheck } from 'lucide-react';

interface SellerIdentityFormProps {
  vendedorNome: string;
  vendedorEmail: string;
  onConfirm: (nome: string, email: string) => void;
}

const REGISTERED_SELLERS = [
  { nome: 'Carlos Oliveira', email: 'carlos.oliveira@empresa.com.br' },
  { nome: 'Juliana Mendes', email: 'juliana.mendes@empresa.com.br' },
  { nome: 'Rodrigo Santos', email: 'rodrigo.santos@empresa.com.br' },
  { nome: 'Fernanda Lima', email: 'fernanda.lima@empresa.com.br' },
  { nome: 'Matheus Costa', email: 'matheus.costa@empresa.com.br' },
];

export const SellerIdentityForm: React.FC<SellerIdentityFormProps> = ({
  vendedorNome: initialNome,
  vendedorEmail: initialEmail,
  onConfirm,
}) => {
  const [selectedSeller, setSelectedSeller] = useState<string>(
    initialNome || REGISTERED_SELLERS[0].nome
  );
  const [customNome, setCustomNome] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const isCustom = selectedSeller === 'OUTRO';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustom) {
      if (!customNome.trim()) return;
      onConfirm(customNome.trim(), customEmail.trim() || `${customNome.toLowerCase().replace(/\s+/g, '.')}@empresa.com.br`);
    } else {
      const found = REGISTERED_SELLERS.find((s) => s.nome === selectedSeller);
      if (found) {
        onConfirm(found.nome, found.email);
      } else {
        onConfirm(selectedSeller, initialEmail);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto pt-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Cabeçalho minimalista */}
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            NOVO BRIEFING DE COTAÇÃO
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
            SELECIONE O VENDEDOR RESPONSÁVEL PARA INICIAR
          </p>
        </div>

        {/* Formulário com Select Único e Direto */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase">
              VENDEDOR RESPONSÁVEL
            </label>
            <div className="relative">
              <select
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition uppercase"
              >
                {REGISTERED_SELLERS.map((s) => (
                  <option key={s.nome} value={s.nome} className="uppercase">
                    {s.nome.toUpperCase()}
                  </option>
                ))}
                <option value="OUTRO" className="uppercase">+ CADASTRAR OUTRO VENDEDOR...</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Campo condicional caso queira digitar um novo vendedor */}
          {isCustom && (
            <div className="space-y-3 pt-1 animate-in fade-in">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  NOME DO NOVO VENDEDOR *
                </label>
                <input
                  type="text"
                  required
                  placeholder="NOME COMPLETO"
                  value={customNome}
                  onChange={(e) => setCustomNome(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  E-MAIL CORPORATIVO (OPCIONAL)
                </label>
                <input
                  type="email"
                  placeholder="VENDEDOR@EMPRESA.COM.BR"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>
          )}

          {/* Botão de Criação */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow transition cursor-pointer uppercase"
            >
              <span>CRIAR NOVO BRIEFING</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
