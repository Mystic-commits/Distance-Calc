import React from 'react';
import { CheckCircle, AlertTriangle, Shield } from 'lucide-react';

export function ResultsPanel({ results }) {
  const { actualDistance, requiredDistance, safetyFactor, isSafe } = results;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-gray-600" />
        Safety Analysis
      </h2>

      <div className="space-y-4">
        {/* Safety Status */}
        <div className={`p-4 rounded-lg border-2 ${
          isSafe 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isSafe ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-semibold ${
              isSafe ? 'text-green-800' : 'text-red-800'
            }`}>
              {isSafe ? 'SAFE' : 'UNSAFE'}
            </span>
          </div>
          <p className={`text-sm ${
            isSafe ? 'text-green-700' : 'text-red-700'
          }`}>
            {isSafe 
              ? 'Buildings meet minimum safety distance requirements'
              : 'Buildings are too close for the given explosive quantity'
            }
          </p>
        </div>

        {/* Distance Metrics */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Actual Distance</div>
            <div className="text-lg font-semibold text-gray-900">
              {actualDistance.toFixed(2)} units
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Required Distance</div>
            <div className="text-lg font-semibold text-gray-900">
              {requiredDistance.toFixed(2)} units
            </div>
          </div>
        </div>

        {/* Formula Reference */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="text-xs text-blue-700 font-medium mb-1">Formula Used</div>
          <div className="text-sm text-blue-800 font-mono">
            D = K × W^(1/3)
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Where K = 4, W = explosive weight (kg)
          </div>
        </div>
      </div>
    </div>
  );
} 