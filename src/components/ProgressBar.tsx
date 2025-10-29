import { memo } from "react";
import { Logo } from "./Logo";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  visitedSteps?: Set<number>;
  onStepClick?: (stepNumber: number) => void;
}

export const ProgressBar = memo(function ProgressBar({ currentStep, totalSteps, stepLabels, visitedSteps, onStepClick }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-lg border-b-2 border-green-500 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="text-xs sm:text-sm text-slate-700">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-green-600">
            {Math.round(percentage)}% Complete
          </span>
        </div>
        
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {stepLabels && (
          <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-2">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep - 1;
              const isVisited = visitedSteps?.has(stepNumber) ?? false;
              const isClickable = isVisited && onStepClick;
              
              return (
                <div
                  key={index}
                  className={`text-center transition-all duration-300 ${
                    isCompleted
                      ? "text-green-600"
                      : isCurrent
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <button
                      onClick={() => isClickable && onStepClick(stepNumber)}
                      disabled={!isClickable}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 text-white shadow-md shadow-green-500/30"
                          : isCurrent
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-400/50"
                          : "bg-slate-300 text-slate-600"
                      } ${
                        isClickable
                          ? "cursor-pointer hover:scale-110 hover:shadow-lg active:scale-95"
                          : "cursor-default"
                      }`}
                      aria-label={isClickable ? `Go to ${label}` : label}
                    >
                      {index + 1}
                    </button>
                    <span className="text-[9px] sm:text-[10px] leading-tight">{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});