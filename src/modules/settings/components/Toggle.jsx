import React from "react";

export default function Toggle({ checked, onChange, label, hint, disabled }) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? "opacity-60" : ""}`}>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 rounded-full transition
          ${checked ? "bg-primary" : "bg-border"}
        `}
        disabled={disabled}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition
            ${checked ? "translate-x-5" : "translate-x-0.5"}
          `}
        />
      </button>
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted">{hint}</div>}
      </div>
    </label>
  );
}
