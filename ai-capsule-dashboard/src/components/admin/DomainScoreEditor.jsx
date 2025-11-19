import React, { useState } from 'react';

export default function DomainScoreEditor({ domainScore, onScoreChange, onStrengthsChange, onWeaknessesChange }) {
  const [strengths, setStrengths] = useState(domainScore.strengths || []);
  const [weaknesses, setWeaknesses] = useState(domainScore.weaknesses || []);
  const [showDetails, setShowDetails] = useState(false);

  const addStrength = () => {
    const newStrength = { title: '', description: '' };
    const updated = [...strengths, newStrength];
    setStrengths(updated);
    onStrengthsChange(domainScore.domain_id, updated);
  };

  const updateStrength = (index, field, value) => {
    const updated = strengths.map((s, i) => i === index ? { ...s, [field]: value } : s);
    setStrengths(updated);
    onStrengthsChange(domainScore.domain_id, updated);
  };

  const removeStrength = (index) => {
    const updated = strengths.filter((_, i) => i !== index);
    setStrengths(updated);
    onStrengthsChange(domainScore.domain_id, updated);
  };

  const addWeakness = () => {
    const newWeakness = { title: '', description: '', improvement_suggestion: '' };
    const updated = [...weaknesses, newWeakness];
    setWeaknesses(updated);
    onWeaknessesChange(domainScore.domain_id, updated);
  };

  const updateWeakness = (index, field, value) => {
    const updated = weaknesses.map((w, i) => i === index ? { ...w, [field]: value } : w);
    setWeaknesses(updated);
    onWeaknessesChange(domainScore.domain_id, updated);
  };

  const removeWeakness = (index) => {
    const updated = weaknesses.filter((_, i) => i !== index);
    setWeaknesses(updated);
    onWeaknessesChange(domainScore.domain_id, updated);
  };

  return (
    <div className="border border-slate-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{domainScore.domain_name}</h3>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={domainScore.score}
          onChange={(e) => onScoreChange(domainScore.domain_id, e.target.value)}
          className="w-24 px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-right"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-blue-400 hover:text-blue-300 mb-3"
      >
        {showDetails ? '▼ Hide' : '▶ Show'} Strengths & Weaknesses
      </button>

      {showDetails && (
        <div className="space-y-4 mt-4">
          {/* Strengths */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-green-400">Strengths</label>
              <button
                type="button"
                onClick={addStrength}
                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded"
              >
                + Add
              </button>
            </div>
            {strengths.map((strength, index) => (
              <div key={index} className="bg-slate-700 p-3 rounded mb-2">
                <input
                  type="text"
                  placeholder="Strength title"
                  value={strength.title}
                  onChange={(e) => updateStrength(index, 'title', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded mb-2 text-sm"
                />
                <textarea
                  placeholder="Description"
                  value={strength.description}
                  onChange={(e) => updateStrength(index, 'description', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-sm"
                  rows="2"
                />
                <button
                  type="button"
                  onClick={() => removeStrength(index)}
                  className="text-xs text-red-400 hover:text-red-300 mt-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Weaknesses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-red-400">Weaknesses</label>
              <button
                type="button"
                onClick={addWeakness}
                className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
              >
                + Add
              </button>
            </div>
            {weaknesses.map((weakness, index) => (
              <div key={index} className="bg-slate-700 p-3 rounded mb-2">
                <input
                  type="text"
                  placeholder="Weakness title"
                  value={weakness.title}
                  onChange={(e) => updateWeakness(index, 'title', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded mb-2 text-sm"
                />
                <textarea
                  placeholder="Description"
                  value={weakness.description}
                  onChange={(e) => updateWeakness(index, 'description', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded mb-2 text-sm"
                  rows="2"
                />
                <textarea
                  placeholder="Improvement suggestion"
                  value={weakness.improvement_suggestion}
                  onChange={(e) => updateWeakness(index, 'improvement_suggestion', e.target.value)}
                  className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-sm"
                  rows="2"
                />
                <button
                  type="button"
                  onClick={() => removeWeakness(index)}
                  className="text-xs text-red-400 hover:text-red-300 mt-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
