import React from 'react';

export default function StatCardModern({ icon: Icon, label, value, trend, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-400',
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6
      hover:shadow-xl transition-all duration-300 group
      ${colors[color]}
    `}>
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-100">{value}</p>
        {trend && (
          <p className="text-xs text-slate-500">{trend}</p>
        )}
      </div>
      
      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full blur-2xl" />
      </div>
    </div>
  );
}
