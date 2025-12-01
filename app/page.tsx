'use client'
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Certainty Factor calculation utilities
const cfCombine = (cf1: number, cf2: number): number => {
  if (cf1 > 0 && cf2 > 0) {
    return cf1 + cf2 * (1 - cf1);
  } else if (cf1 < 0 && cf2 < 0) {
    return cf1 + cf2 * (1 + cf1);
  } else {
    return (cf1 + cf2) / (1 - Math.min(Math.abs(cf1), Math.abs(cf2)));
  }
};

// Sample data (in real app, this comes from Supabase)
const RULES = [
  {
    id: 1,
    disease_name: "Anthracnose (Patek)",
    symptoms: ["sunken dark spots on fruit", "orange spore discharge", "fruit rotting"],
    solution: "Remove infected fruits, apply fungicide (mancozeb / chlorothalonil), improve airflow.",
    cf_rule: 0.85
  },
  {
    id: 2,
    disease_name: "Fusarium Wilt",
    symptoms: ["wilted leaves", "brown vascular tissue", "stunted growth"],
    solution: "Improve drainage, use Trichoderma, remove infected plants to prevent spread.",
    cf_rule: 0.9
  },
  {
    id: 3,
    disease_name: "Powdery Mildew",
    symptoms: ["white fungal powder on leaves", "leaf curling", "reduced photosynthesis"],
    solution: "Spray sulfur fungicide, reduce humidity, increase sunlight exposure.",
    cf_rule: 0.75
  },
  {
    id: 4,
    disease_name: "Bacterial Wilt",
    symptoms: ["wilted leaves", "stunted growth", "brown vascular tissue"],
    solution: "Remove infected plants immediately, avoid overwatering, use resistant varieties.",
    cf_rule: 0.88
  },
  {
    id: 5,
    disease_name: "Root Rot",
    symptoms: ["wilted leaves", "yellow leaves", "root rot", "stunted growth"],
    solution: "Improve soil drainage, reduce watering frequency, apply fungicide to soil.",
    cf_rule: 0.82
  }
];

// Get all unique symptoms from rules
const ALL_SYMPTOMS = Array.from(
  new Set(RULES.flatMap(rule => rule.symptoms))
).sort();

interface DiagnosisResult {
  disease: string;
  confidence: number;
  solution: string;
  matchedSymptoms: string[];
}

interface HistoryEntry {
  id: string;
  date: string;
  symptoms: string[];
  results: DiagnosisResult[];
}

export default function ChiliDiagnosisApp() {
  const [currentPage, setCurrentPage] = useState<'diagnosis' | 'history'>('diagnosis');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chili_diagnosis_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const performDiagnosis = () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }

    // CF calculation with forward chaining
    const results: DiagnosisResult[] = [];

    RULES.forEach(rule => {
      // Check which symptoms match
      const matchedSymptoms = rule.symptoms.filter(s => selectedSymptoms.includes(s));
      
      if (matchedSymptoms.length > 0) {
        // Calculate combined CF for matched symptoms
        // Assume user certainty is 0.8 for each selected symptom
        const userCF = 0.8;
        let combinedCF = userCF * rule.cf_rule;
        
        // Combine multiple symptom matches
        for (let i = 1; i < matchedSymptoms.length; i++) {
          combinedCF = cfCombine(combinedCF, userCF * rule.cf_rule);
        }

        results.push({
          disease: rule.disease_name,
          confidence: combinedCF * 100,
          solution: rule.solution,
          matchedSymptoms
        });
      }
    });

    // Sort by confidence (highest first)
    results.sort((a, b) => b.confidence - a.confidence);

    setDiagnosisResults(results);
    setShowResults(true);

    // Save to localStorage
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      symptoms: selectedSymptoms,
      results
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('chili_diagnosis_history', JSON.stringify(updatedHistory));
  };

  const resetForm = () => {
    setSelectedSymptoms([]);
    setDiagnosisResults([]);
    setShowResults(false);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all diagnosis history?')) {
      setHistory([]);
      localStorage.removeItem('chili_diagnosis_history');
    }
  };

  const deleteHistoryEntry = (id: string) => {
    const updatedHistory = history.filter(entry => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('chili_diagnosis_history', JSON.stringify(updatedHistory));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">🌶 Chili Plant Disease Diagnosis System</h1>
          <p className="text-green-100 mt-2">Expert System for Capsicum frutescens</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 py-4">
            <button
              onClick={() => setCurrentPage('diagnosis')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'diagnosis'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              New Diagnosis
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'history'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Diagnosis History
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'diagnosis' ? (
          <div className="max-w-6xl mx-auto">
            {!showResults ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Observed Symptoms</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {ALL_SYMPTOMS.map(symptom => (
                    <label
                      key={symptom}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSymptoms.includes(symptom)
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSymptoms.includes(symptom)}
                        onChange={() => toggleSymptom(symptom)}
                        className="w-5 h-5 text-green-600"
                      />
                      <span className="text-gray-700 capitalize">{symptom}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={performDiagnosis}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    🔍 Diagnose Disease
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Diagnosis Results</h2>
                  
                  {diagnosisResults.length > 0 ? (
                    <>
                      <div className="mb-8">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={diagnosisResults.map(r => ({
                            name: r.disease,
                            confidence: r.confidence.toFixed(1)
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="confidence" fill="#16a34a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-4">
                        {diagnosisResults.map((result, index) => (
                          <div
                            key={index}
                            className="border-2 border-green-200 rounded-lg p-6 bg-green-50"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-xl font-bold text-gray-800">{result.disease}</h3>
                              <span className="bg-green-600 text-white px-4 py-1 rounded-full font-semibold">
                                {result.confidence.toFixed(1)}%
                              </span>
                            </div>
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 font-semibold mb-1">Matched Symptoms:</p>
                              <div className="flex flex-wrap gap-2">
                                {result.matchedSymptoms.map(s => (
                                  <span key={s} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-green-300">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-semibold mb-1">Recommended Solution:</p>
                              <p className="text-gray-700">{result.solution}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      No diseases matched the selected symptoms. Please try different symptoms.
                    </p>
                  )}

                  <button
                    onClick={resetForm}
                    className="mt-6 w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Start New Diagnosis
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Diagnosis History</h2>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear All History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No diagnosis history yet.</p>
              ) : (
                <div className="space-y-6">
                  {history.map(entry => (
                    <div key={entry.id} className="border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Date: {entry.date}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Symptoms: {entry.symptoms.join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteHistoryEntry(entry.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="space-y-2">
                        {entry.results.slice(0, 3).map((result, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <span className="font-medium text-gray-800">{result.disease}</span>
                            <span className="text-green-600 font-semibold">{result.confidence.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-600 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>Chili Plant Disease Expert System © 2024</p>
          <p className="text-sm text-green-100 mt-2">Using Certainty Factor Algorithm</p>
        </div>
      </footer>
    </div>
  );
}