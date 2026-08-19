"use client";

const WIZARD_STEPS = [
  { id: 1, label: "Datos" },
  { id: 2, label: "Formato" },
  { id: 3, label: "Equipos" },
];

interface WizardProgressBarProps {
  currentStep: number;
}

export default function WizardProgressBar({ currentStep }: WizardProgressBarProps) {
  const progressPct = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="mb-8">
      <div className="relative flex items-start justify-between">
        {/* Track line */}
        <div className="absolute top-3.5 left-0 right-0 h-[2px] bg-secondary z-0 rounded-full" />
        {/* Active progress */}
        <div
          className="absolute top-3.5 left-0 h-[2px] bg-primary z-0 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />

        {WIZARD_STEPS.map((s) => {
          const isCompleted = s.id < currentStep;
          const isActive = s.id === currentStep;
          return (
            <div key={s.id} className="flex flex-col items-center z-10 relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground shadow-md"
                    : isActive
                    ? "bg-card border-primary text-primary shadow"
                    : "bg-card border-secondary text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <span
                className={`text-[10px] font-semibold mt-1.5 uppercase tracking-wider ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
