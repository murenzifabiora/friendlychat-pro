import React from 'react';
import { VoiceAnalysisResult, getEmotionInfo } from '../hooks/useVoiceAnalysis';

interface VoiceAnalysisPanelProps {
  result: VoiceAnalysisResult | null;
  isAnalyzing: boolean;
  userName?: string;
}

const VoiceAnalysisPanel: React.FC<VoiceAnalysisPanelProps> = ({
  result,
  isAnalyzing,
  userName,
}) => {
  const emotionInfo = result ? getEmotionInfo(result.emotionalState) : null;

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 min-w-[220px]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎙️</span>
        <h3 className="text-white font-semibold text-sm">
          Voice Analysis {userName ? `— ${userName}` : ''}
        </h3>
        {isAnalyzing && (
          <span className="ml-auto flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs">Live</span>
          </span>
        )}
      </div>

      {!result ? (
        <div className="text-gray-500 text-xs text-center py-4">
          {isAnalyzing ? 'Listening...' : 'No audio detected'}
        </div>
      ) : (
        <>
          {/* Emotional State */}
          <div className="flex items-center gap-3 mb-3 bg-gray-700 rounded-lg p-3">
            <span className="text-3xl">{emotionInfo?.emoji}</span>
            <div>
              <p className={`font-bold text-base ${emotionInfo?.color}`}>
                {emotionInfo?.label}
              </p>
              <p className="text-gray-400 text-xs">
                Confidence: {Math.round(result.confidence * 100)}%
              </p>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Confidence</span>
              <span>{Math.round(result.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-500"
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Voice Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <MetricBadge label="Energy" value={result.patterns.energy} max={255} unit="" />
            <MetricBadge label="Pitch" value={result.patterns.pitch} max={1000} unit="Hz" />
            <MetricBadge label="Stability" value={Math.round(result.patterns.stability * 100)} max={100} unit="%" />
            <MetricBadge label="Rate" value={Math.round(result.patterns.rate * 100)} max={100} unit="%" />
          </div>

          {/* Detected Patterns */}
          {result.detectedIndicators.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs mb-1 font-medium">Detected Patterns</p>
              <div className="flex flex-wrap gap-1">
                {result.detectedIndicators.map((indicator, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      indicator.toLowerCase().includes('deception') ||
                      indicator.toLowerCase().includes('lying')
                        ? 'bg-red-900 text-red-300'
                        : indicator.toLowerCase().includes('sleeping')
                        ? 'bg-indigo-900 text-indigo-300'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const MetricBadge: React.FC<{
  label: string;
  value: number;
  max: number;
  unit: string;
}> = ({ label, value, max, unit }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="bg-gray-700 rounded-lg p-2">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-sm font-semibold">
        {value}
        {unit}
      </p>
      <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
        <div
          className="h-1 rounded-full bg-blue-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default VoiceAnalysisPanel;
