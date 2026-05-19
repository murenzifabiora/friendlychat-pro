import { useEffect, useRef, useState, useCallback } from 'react';

export interface VoiceAnalysisResult {
  emotionalState: string;
  confidence: number;
  patterns: {
    pitch: number;
    energy: number;
    rate: number;
    stability: number;
  };
  detectedIndicators: string[];
  timestamp: Date;
}

const EMOTION_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  happy: { label: 'Happy', emoji: '😊', color: 'text-yellow-400' },
  sad: { label: 'Sad', emoji: '😢', color: 'text-blue-400' },
  angry: { label: 'Angry', emoji: '😠', color: 'text-red-500' },
  calm: { label: 'Calm', emoji: '😌', color: 'text-green-400' },
  stressed: { label: 'Stressed', emoji: '😰', color: 'text-orange-400' },
  tired: { label: 'Tired', emoji: '😴', color: 'text-purple-400' },
  neutral: { label: 'Neutral', emoji: '😐', color: 'text-gray-400' },
  sleeping: { label: 'Sleeping', emoji: '💤', color: 'text-indigo-400' },
  lying: { label: 'Possibly Lying', emoji: '🤥', color: 'text-red-400' },
};

export const getEmotionInfo = (state: string) =>
  EMOTION_LABELS[state] || EMOTION_LABELS['neutral'];

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
  return (maxIndex * nyquist) / dataArray.length;
};

const estimateSpeechRate = (dataArray: Uint8Array): number => {
  let changes = 0;
  for (let i = 1; i < dataArray.length; i++) {
    if (Math.abs(dataArray[i] - dataArray[i - 1]) > 10) changes++;
  }
  return changes / dataArray.length;
};

const detectEmotionalState = (
  energy: number,
  variance: number,
  pitch: number,
  rate: number
): string => {
  // Sleeping: very low energy and very low rate
  if (energy < 30 && rate < 0.1) return 'sleeping';
  // Tired: low energy, low pitch
  if (energy < 55 && pitch < 120) return 'tired';
  // Angry: high energy, high variance
  if (energy > 150 && variance > 40) return 'angry';
  // Stressed: high energy, high variance, high rate
  if (energy > 120 && variance > 60 && rate > 0.4) return 'stressed';
  // Possibly lying: irregular pauses + elevated pitch + high rate
  if (rate > 0.55 && variance > 70 && pitch > 250) return 'lying';
  // Happy: above average energy, higher pitch
  if (energy > 100 && pitch > 200) return 'happy';
  // Sad: low energy, low variance
  if (energy < 60 && variance < 20) return 'sad';
  // Calm: low variance
  if (variance < 18) return 'calm';
  return 'neutral';
};

const detectPatterns = (
  energy: number,
  variance: number,
  pitch: number,
  rate: number
): string[] => {
  const patterns: string[] = [];
  if (rate > 0.5) patterns.push('Irregular pauses');
  if (energy > 160) patterns.push('Elevated volume');
  if (variance > 80) patterns.push('Voice instability');
  if (pitch > 300) patterns.push('High pitch');
  if (pitch < 80) patterns.push('Low pitch');
  if (energy < 60 && pitch < 120) patterns.push('Possible fatigue');
  if (energy < 30 && rate < 0.1) patterns.push('Possible sleeping');
  if (rate > 0.55 && variance > 70) patterns.push('Deception indicators');
  return patterns;
};

export const useVoiceAnalysis = (stream: MediaStream | null, enabled: boolean = true) => {
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const analyze = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const variance = Math.sqrt(
      dataArray.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / dataArray.length
    );
    const pitch = estimatePitch(dataArray, sampleRate);
    const rate = estimateSpeechRate(dataArray);
    const emotionalState = detectEmotionalState(average, variance, pitch, rate);
    const detectedIndicators = detectPatterns(average, variance, pitch, rate);

    setResult({
      emotionalState,
      confidence: Math.min(0.97, Math.max(0.45, variance / 100)),
      patterns: {
        pitch: Math.round(pitch),
        energy: Math.round(average),
        rate: parseFloat(rate.toFixed(3)),
        stability: parseFloat((1 - Math.min(1, variance / 100)).toFixed(2)),
      },
      detectedIndicators,
      timestamp: new Date(),
    });
  }, []);

  useEffect(() => {
    if (!stream || !enabled) return;

    const setup = async () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
        setIsAnalyzing(true);
        intervalRef.current = setInterval(analyze, 1500);
      } catch (err) {
        console.error('Voice analysis setup error:', err);
      }
    };

    setup();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sourceRef.current?.disconnect();
      audioContextRef.current?.close();
      setIsAnalyzing(false);
    };
  }, [stream, enabled, analyze]);

  return { result, isAnalyzing };
};
