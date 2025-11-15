import React from "react";
import DomainCard from "../common/DomainCard";

export default function StudentDomainsSection({ student }) {
  const domains = student?.domain_scores || [];
  
  console.log('StudentDomainsSection - domains:', domains);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Domain Performance</h2>
        <span className="text-sm text-slate-400">
          {domains.length} {domains.length === 1 ? 'Domain' : 'Domains'}
        </span>
      </div>

      {domains.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400">No domain scores available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {domains.map((domainScore) => (
            <div
              key={domainScore.id || domainScore.domain_id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{domainScore.domain_name || 'Unknown Domain'}</h3>
                <span className="text-2xl font-bold text-blue-400">
                  {parseFloat(domainScore.score || 0).toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, parseFloat(domainScore.score || 0)))}%` }}
                />
              </div>

              <div className="mt-4 text-sm text-slate-400">
                Last updated: {domainScore.updated_at ? new Date(domainScore.updated_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
