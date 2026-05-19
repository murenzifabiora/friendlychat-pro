# Voice Analysis Feature Guide

## Overview

VoiceChat Pro includes advanced voice analysis capabilities that detect emotional states, fatigue levels, and potential deception patterns during conversations.

## How It Works

### 1. Audio Capture

When a call is initiated, the application:
- Requests microphone permission from the user
- Creates an audio context using the Web Audio API
- Continuously captures audio data during the call

```typescript
const audioContext = new AudioContext();
const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
const source = audioContext.createMediaStreamSource(mediaStream);
const analyser = audioContext.createAnalyser();
source.connect(analyser);
```

### 2. Feature Extraction

The system extracts key features from the audio:

#### Pitch Detection
- Analyzes frequency spectrum
- Identifies fundamental frequency of voice
- Higher pitch often indicates stress or excitement
- Lower pitch can indicate fatigue or sadness

#### Energy Analysis
- Measures overall amplitude of voice
- High energy = strong/loud voice (may indicate anger or excitement)
- Low energy = quiet/weak voice (may indicate sadness or fatigue)

#### Speech Rate
- Calculates frequency of sound changes
- Faster rate = quick speaking (stress, excitement, nervousness)
- Slower rate = slow speaking (sadness, tiredness, calmness)

#### Voice Stability
- Measures consistency of voice
- Stable voice = calm, confident
- Unstable voice = stressed, nervous, uncertain

### 3. Emotional State Classification

Based on extracted features:

| Emotion | Pitch | Energy | Rate | Stability |
|---------|-------|--------|------|-----------|
| **Happy** | High | High | Moderate | Good |
| **Sad** | Low | Low | Slow | Poor |
| **Angry** | High | High | Fast | Poor |
| **Calm** | Moderate | Low | Slow | Excellent |
| **Stressed** | High | High | Fast | Poor |
| **Tired** | Low | Low | Slow | Good |
| **Neutral** | Moderate | Moderate | Moderate | Good |

### 4. Pattern Detection

The system detects specific patterns that may indicate:

#### Deception Indicators
- **Irregular Pauses**: Frequent hesitations may indicate dishonesty
- **Voice Instability**: Trembling or shaking voice can suggest nervousness
- **Elevated Volume**: Sudden volume changes when certain topics arise
- **High Pitch**: Pitch increases when under stress/lying

#### Fatigue Indicators
- **Low Energy + Low Pitch**: Combination suggests tiredness
- **Slow Speech Rate**: Slowed down speaking patterns
- **Voice Stability**: Inconsistent voice during fatigue

#### Sleep Detection
- **Very Low Energy**: Minimal sound detection
- **Slow Rate**: Very few sound changes
- **Low Pitch**: Deep, drowsy voice characteristics

#### Stress Indicators
- **Voice Instability**: Shaky voice
- **High Pitch**: Voice pitch increases
- **Elevated Volume**: Louder than baseline
- **Fast Rate**: Rapid speech patterns

## Usage in Application

### During Calls

```typescript
// Start capturing and analyzing voice
const analyser = audioContext.createAnalyser();
const result = await analyzeVoiceStream(audioContext, analyser);

// Result includes:
{
  emotionalState: 'happy',
  confidence: 0.85,
  patterns: {
    pitch: 250,
    energy: 120,
    rate: 0.45,
    stability: 0.88
  },
  detectedIndicators: [
    'elevated_volume',
    'high_pitch'
  ]
}
```

### Real-time Display

During calls, the UI shows:
- Current emotional state with confidence percentage
- Detected patterns and indicators
- Historical emotional state changes (chart)
- Recommendations (if confidence is low)

### Storing Analysis Results

Analysis results are stored in MongoDB for:
- Historical tracking
- Pattern recognition over time
- User insights and statistics
- Relationship analysis

## Confidence Scoring

The confidence score (0-1) indicates how certain the analysis is:

- **0.90+**: Very confident in the assessment
- **0.75-0.89**: Confident assessment
- **0.60-0.74**: Moderate confidence, some uncertainty
- **Below 0.60**: Low confidence, multiple possibilities

Factors affecting confidence:
- Audio quality
- Background noise
- Call duration
- Voice clarity

## Limitations

### Technical Limitations
1. **Background Noise**: Loud environments reduce accuracy
2. **Audio Quality**: Poor microphone/connection affects results
3. **Accent/Language**: Non-native speakers may have different patterns
4. **Individual Variations**: People express emotions differently
5. **Medical Conditions**: Voice disorders can affect analysis

### Ethical Considerations
1. **Privacy**: Audio analysis only on client-side (can be stored server-side)
2. **Consent**: Users should be informed about analysis
3. **Accuracy**: Results are probabilistic, not definitive
4. **Discrimination**: Should not be used for harmful decisions
5. **Transparency**: Users should understand how analysis works

## Best Practices

### For Accurate Analysis
1. Use good quality microphone
2. Minimize background noise
3. Speak naturally during calls
4. Allow at least 10-15 seconds for analysis to stabilize
5. Have longer calls for better pattern detection

### For Privacy
1. Review privacy settings before enabling
2. Understand what data is stored
3. Check retention policies
4. Use encrypted connections
5. Delete analysis history if desired

## Advanced Features (Future)

Planned enhancements:
- Machine learning model improvements
- Multi-language support
- Accent recognition
- Emotion intensity levels
- Personality trait detection
- Relationship pattern analysis
- Real-time recommendations
- Integration with external ML services

## API Integration

### Send Voice Analysis to Server

```typescript
const response = await voiceAnalysisService.analyzeVoice({
  callDuration: 180000, // milliseconds
  emotionalState: 'happy',
  confidence: 0.85,
  detectedPatterns: ['elevated_volume', 'high_pitch'],
  notes: 'User seems very happy during this call'
});
```

### Retrieve Analysis History

```typescript
const history = await voiceAnalysisService.getHistory();
// Returns array of analysis results with timestamps
```

### Get Statistics

```typescript
const stats = await voiceAnalysisService.getStatistics();
// Returns aggregated statistics about voice patterns over time
```

## Troubleshooting

### Analysis Not Working
1. Check microphone permissions
2. Verify microphone is working
3. Check browser console for errors
4. Try different browser
5. Check Audio Context is supported

### Inaccurate Results
1. Ensure good audio quality
2. Minimize background noise
3. Speak naturally
4. Wait for longer sample time
5. Review detected patterns

### High CPU Usage
1. Reduce analysis frequency
2. Lower FFT size
3. Process analysis less frequently
4. Check for other CPU-intensive tasks

## Research References

The voice analysis algorithms are based on:
- Prosody analysis techniques
- Paralinguistics research
- Acoustic feature extraction
- Emotion recognition studies
- Deception detection literature

---

For technical implementation details, see [voiceAnalysis.ts](../shared/voiceAnalysis.ts)
