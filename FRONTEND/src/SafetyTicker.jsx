import React from 'react';
import { ShieldAlert, AlertCircle, Info } from 'lucide-react';

const SafetyTicker = () => {
  const tips = [
    "EMERGENCY: In case of severe allergic reaction, use EpiPen and call 911 immediately.",
    "SAFETY: Always keep medications in their original containers with clear labels.",
    "DOSAGE: Never double up on a dose if you missed the previous one.",
    "STORAGE: Keep all medicines out of reach of children and pets.",
    "CONSULT: If you experience unexpected side effects, contact your doctor right away.",
    "HELPLINE: National Poison Control Center: 1-800-222-1222 available 24/7."
  ];

  return (
    <div className="safety-ticker-wrapper" data-cursor-icon="Safety">
      <div className="ticker-label">
        <ShieldAlert size={18} />
        <span>SAFETY HUB</span>
      </div>
      <div className="ticker-content">
        <div className="ticker-track">
          {tips.concat(tips).map((tip, index) => (
            <div key={index} className="ticker-item">
              <AlertCircle size={14} className="ticker-icon" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyTicker;
