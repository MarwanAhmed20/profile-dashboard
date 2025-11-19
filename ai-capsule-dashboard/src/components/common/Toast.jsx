import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const types = {
  success: { icon: CheckCircle, color: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' },
  error: { icon: AlertCircle, color: 'bg-red-500/10 border-red-500/50 text-red-400' },
  info: { icon: Info, color: 'bg-blue-500/10 border-blue-500/50 text-blue-400' },
};

export default function Toast({ type = 'success', message, onClose }) {
  const { icon: Icon, color } = types[type];

  return (
    <div className={`
      fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border
      backdrop-blur-sm animate-slide-in shadow-2xl ${color}
    `}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
