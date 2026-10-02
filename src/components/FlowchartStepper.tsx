import React from 'react';
import { Check, Circle } from 'lucide-react';

interface FlowchartStepperProps {
  currentStepIndex: number;
  totalSteps: number;
  stepsTitles: string[];
  onSelectStep?: (index: number) => void;
}

export const FlowchartStepper: React.FC<FlowchartStepperProps> = ({
  currentStepIndex,
  stepsTitles,
  onSelectStep,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between overflow-x-auto pb-1 no-scrollbar gap-2 sm:gap-4">
          {stepsTitles.map((title, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div
                key={idx}
                onClick={() => isCompleted && onSelectStep && onSelectStep(idx)}
                className={`flex items-center gap-2 shrink-0 select-none ${
                  isCompleted ? 'cursor-pointer hover:opacity-80' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
                </div>

                <div className="text-left">
                  <p
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrent
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : isCompleted
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {title}
                  </p>
                </div>

                {idx < stepsTitles.length - 1 && (
                  <div
                    className={`w-6 sm:w-10 h-0.5 mx-1 transition-colors ${
                      idx < currentStepIndex
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
