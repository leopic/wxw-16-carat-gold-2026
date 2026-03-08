import './ProgressBar.css';

type Props = {
  step: number; // 0-based index into STEPS
  steps: string[];
};

export function ProgressBar({ step, steps }: Props) {
  return (
    <div className="progress-bar">
      <div className="progress-steps">
        {steps.map((label, i) => (
          <div key={i} className={`progress-step ${i <= step ? 'active' : ''} ${i === step ? 'current' : ''}`}>
            <div className="progress-dot" />
            <span className="progress-label">{label}</span>
          </div>
        ))}
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(step / (steps.length - 1)) * 100}%` }} />
      </div>
    </div>
  );
}
