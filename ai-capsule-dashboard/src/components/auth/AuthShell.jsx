import React from "react";

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_55%)]" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
