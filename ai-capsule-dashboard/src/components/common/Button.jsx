import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600',
  secondary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
  outline: 'bg-transparent hover:bg-slate-800 text-slate-200 border-slate-600',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  loading = false,
  className = '',
  ...props 
}) {
  return (
    <button
      className={`
        inline-flex items-center gap-2 rounded-xl border font-medium
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon && (
        <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
}
