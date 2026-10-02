import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plane, Search, ChevronDown, Check, X, AlertTriangle } from 'lucide-react';
import { ALL_WORLD_AIRPORTS, WorldAirportItem, formatAirportDisplay, stripAccents } from '../../data/airports';

interface AirportComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  otherAirportValue?: string;
  placeholder?: string;
  required?: boolean;
}

export const AirportCombobox: React.FC<AirportComboboxProps> = ({
  label,
  value,
  onChange,
  otherAirportValue,
  placeholder = 'BUSQUE OU SELECIONE O AEROPORTO...',
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Foco no input ao abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Busca instantânea com normalização de acentos e suporte bilingue (Português/Inglês)
  const filteredAirports = useMemo(() => {
    const term = stripAccents(search.trim());

    if (!term) {
      // Quando não há digitação, não renderiza lista automática (atende ao pedido do usuário)
      return [];
    }

    // Filtra através de todos os 5.880 aeroportos comerciais do mundo
    const results: WorldAirportItem[] = [];
    for (let i = 0; i < ALL_WORLD_AIRPORTS.length; i++) {
      const a = ALL_WORLD_AIRPORTS[i];
      if (a.searchable.includes(term)) {
        results.push(a);
        if (results.length >= 80) break; // Fluidez absoluta na rolagem
      }
    }
    return results;
  }, [search]);

  const isDuplicate = Boolean(value && otherAirportValue && value === otherAirportValue);

  const handleSelect = (airport: WorldAirportItem) => {
    const formatted = formatAirportDisplay(airport);
    onChange(formatted);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  // Se o usuário digitou um IATA ou texto e pressionou Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (filteredAirports.length > 0) {
        handleSelect(filteredAirports[0]);
      } else if (search.trim().length >= 3) {
        const custom = search.trim().toUpperCase();
        onChange(`${custom} — AEROPORTO COMERCIAL`);
        setIsOpen(false);
        setSearch('');
      }
    }
  };

  return (
    <div className="space-y-1.5 uppercase" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
          {label} {required && <span className="text-blue-600">*</span>}
        </label>
        {isDuplicate && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            ORIGEM E DESTINO NÃO PODEM SER IGUAIS
          </span>
        )}
      </div>

      {/* Caixa de Seleção / Dropdown Trigger */}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
            isDuplicate
              ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
              : isOpen
              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-white dark:bg-slate-950'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Plane className="w-4 h-4" />
            </div>

            {value ? (
              <div className="truncate">
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-wide">
                  {value}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 text-xs sm:text-sm uppercase font-normal">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="LIMPAR"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {/* Dropdown Menu Clean & Visível */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Campo Único de Pesquisa Clean: País, Cidade, Aeroporto ou Código IATA */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="DIGITE O PAÍS, CIDADE, AEROPORTO OU CÓDIGO IATA..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase font-semibold placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Conteúdo do Dropdown */}
            {search.trim() === '' ? (
              // Ao abrir sem digitação: tela clean sem a lista automática ocupando espaço
              <div className="py-6 px-4 text-center text-slate-400 dark:text-slate-500 space-y-1">
                <Search className="w-5 h-5 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                  DIGITE PARA PESQUISAR POR PAÍS, CIDADE, AEROPORTO OU CÓDIGO IATA
                </p>
                <p className="text-[11px] text-slate-400 uppercase">
                  EXEMPLOS: BRASIL, ESTADOS UNIDOS, SÃO PAULO, MIAMI, PARIS, GRU, JFK...
                </p>
              </div>
            ) : (
              // Lista de resultados filtrados
              <div className="max-h-72 overflow-y-auto p-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredAirports.length === 0 ? (
                  <div className="p-5 text-center space-y-2">
                    <p className="text-xs text-slate-500 uppercase">
                      NENHUM AEROPORTO ENCONTRADO PARA &quot;{search}&quot;.
                    </p>
                    {search.trim().length >= 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          const custom = `${search.trim().toUpperCase()} — AEROPORTO COMERCIAL`;
                          onChange(custom);
                          setIsOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold uppercase transition hover:bg-sky-700 cursor-pointer"
                      >
                        UTILIZAR &quot;{search.trim().toUpperCase()}&quot;
                      </button>
                    )}
                  </div>
                ) : (
                  filteredAirports.map((airport) => {
                    const displayStr = formatAirportDisplay(airport);
                    const isCurrent = value === displayStr || value.startsWith(airport.iata + ' —');
                    const isOther =
                      otherAirportValue === displayStr ||
                      (otherAirportValue && otherAirportValue.startsWith(airport.iata + ' —'));

                    return (
                      <div
                        key={`${airport.iata}-${airport.name}`}
                        onClick={() => handleSelect(airport)}
                        className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition ${
                          isCurrent
                            ? 'bg-sky-600 text-white'
                            : isOther
                            ? 'opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-extrabold tracking-wider ${
                                isCurrent
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400'
                              }`}
                            >
                              {airport.iata}
                            </span>
                            <span className="text-xs font-bold uppercase truncate max-w-[200px] sm:max-w-none">
                              {airport.city || airport.name}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-semibold ${
                                isCurrent ? 'text-sky-100' : 'text-slate-400'
                              }`}
                            >
                              • {airport.country}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] truncate max-w-sm sm:max-w-md uppercase ${
                              isCurrent ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {airport.name}
                          </p>
                        </div>

                        {isCurrent && <Check className="w-4 h-4 text-white shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
