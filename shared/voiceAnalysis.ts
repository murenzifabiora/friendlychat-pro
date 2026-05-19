/**
 * Voice Analysis Utility
 * Provides functions for analyzing voice patterns, emotions, and detecting anomalies
 */

export interface VoiceAnalysisOptions {
  minDuration?: number; // in milliseconds
  sampleRate?: number; // Hz
  fftSize?: number;
}

export interface AnalysisResult {
  emotionalState: string;
  confidence: number;
  patterns: {
    pitch: number;
    energy: number;
    rate: number;
    stability: number;
  };
  detectedIndicators: string[];
}

/**
 * Analyzes audio stream for emotional state and patterns
 */
export const analyzeVoiceStream = async (
  audioContext: AudioContext,
  analyser: AnalyserNode,
  options: VoiceAnalysisOptions = {}
): Promise<AnalysisResult> => {
  const { sampleRate = 44100, fftSize = 2048 } = options;

  analyser.fftSize = fftSize;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  analyser.getByteFrequencyData(dataArray);

  // Calculate voice features
  const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
  const variance = Math.sqrt(
    dataArray.reduce((sq, n) => sq + Math.pow(n - average, 2)) /
      dataArray.length
  );

  // Estimate pitch (simplified)
  const pitch = estimatePitch(dataArray, sampleRate);

  // Estimate rate of speech (simplified)
  const rate = estimateSpeechRate(dataArray);

  // Detect emotional state based on patterns
  const emotionalState = detectEmotionalState(average, variance, pitch);

  // Detect specific patterns
  const detectedIndicators = detectPatterns(average, variance, pitch, rate);

  return {
    emotionalState,
    confidence: Math.min(0.95, Math.max(0.5, variance / 100)),
    patterns: {
      pitch,
      energy: average,
      rate,
      stability: 1 - variance / 100,
    },
    detectedIndicators,
  };
};

/**
 * Estimates pitch from frequency data
 */
const estimatePitch = (dataArray: Uint8Array, sampleRate: number): number => {
  let maxValue = 0;
  let maxIndex = 0;

  for (let i = 0; i < dataArray.length; i++) {
    if (dataArray[i] > maxValue) {
      maxValue = dataArray[i];
      maxIndex = i;
    }
  }

  const nyquist = sampleRate / 2;
  const pitch = (maxIndex * nyquist) / dataArray.length;

  return pitch;
};

/**
 * Estimates speech rate from frequency changes
 */
const estimateSpeechRate = (dataArray: Uint8Array): number => {
  let changes = 0;

  for (let i = 1; i < dataArray.length; i++) {
    if (Math.abs(dataArray[i] - dataArray[i - 1]) > 10) {
      changes++;
    }
  }

  return changes / dataArray.length;
};

/**
 * Detects emotional state based on voice characteristics
 */
const detectEmotionalState = (
  energy: number,
  variance: number,
  pitch: number
): string => {
  // Simplified emotional detection
  if (energy > 150 && variance > 40) return 'angry';
  if (energy > 100 && pitch > 200) return 'happy';
  if (energy < 50 && variance < 20) return 'sad';
  if (variance < 15) return 'calm';
  if (energy > 120 && variance > 60) return 'stressed';
  if (pitch < 100) return 'tired';
  return 'neutral';
};

/**
 * Detects specific patterns that might indicate anomalies
 */
const detectPatterns = (
  energy: number,
  variance: number,
  pitch: number,
  rate: number
): string[] => {
  const patterns: string[] = [];

  // Detect irregular patterns that might indicate deception
  if (rate > 0.5) patterns.push('irregular_pauses');
  if (energy > 160) patterns.push('elevated_volume');
  if (variance > 80) patterns.push('voice_instability');
  if (pitch > 300) patterns.push('high_pitch');
  if (pitch < 80) patterns.push('low_pitch');

  // Fatigue detection
  if (energy < 60 && pitch < 120) patterns.push('possible_fatigue');

  // Detect sleeping patterns
  if (energy < 40 && rate < 0.2) patterns.push('possible_sleeping');

  return patterns;
};

/**
 * Processes audio blob for analysis
 */
export const processAudioBlob = async (
  audioBlob: Blob
): Promise<{ duration: number; summary: string }> => {
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const duration = audioBuffer.duration * 1000; // in ms
  const summary = `Processed ${duration.toFixed(2)}ms of audio`;

  return { duration, summary };
};
