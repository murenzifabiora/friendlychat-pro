import React, { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import {
  FiSmile,
  FiSend,
  FiMic,
  FiMicOff,
  FiPaperclip,
  FiVideo,
  FiX,
} from 'react-icons/fi';

interface ChatInputProps {
  onSendMessage: (message: string, type?: 'text' | 'audio' | 'video' | 'note') => void;
  onSendFile?: (file: File, type: 'audio' | 'video' | 'note') => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendFile,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      setShowEmoji(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const sendAudioNote = () => {
    if (audioBlob && onSendFile) {
      const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
        type: 'audio/webm',
      });
      onSendFile(file, 'audio');
    }
    cancelAudio();
  };

  const cancelAudio = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'note' | 'video') => {
    const file = e.target.files?.[0];
    if (file && onSendFile) {
      onSendFile(file, type);
    }
    e.target.value = '';
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="relative bg-white border-t border-gray-200 p-3">
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-20 left-0 z-50">
          <EmojiPicker
            onEmojiClick={(e) => setMessage((m) => m + e.emoji)}
            height={350}
          />
        </div>
      )}

      {/* Audio preview */}
      {audioBlob && audioUrl && (
        <div className="flex items-center gap-3 mb-2 bg-blue-50 rounded-lg p-2 border border-blue-200">
          <audio src={audioUrl} controls className="flex-1 h-8" />
          <button
            onClick={sendAudioNote}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            title="Send voice note"
          >
            <FiSend size={16} />
          </button>
          <button
            onClick={cancelAudio}
            className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"
            title="Cancel"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 mb-2 bg-red-50 rounded-lg p-2 border border-red-200">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-600 text-sm font-medium">
            Recording... {formatTime(recordingTime)}
          </span>
          <button
            onClick={stopRecording}
            className="ml-auto p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition text-xs"
          >
            Stop
          </button>
        </div>
      )}

      {/* Main input row */}
      <div className="flex items-end gap-2">
        {/* Emoji */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-yellow-500 flex-shrink-0"
          title="Emoji"
          disabled={disabled}
        >
          <FiSmile size={20} />
        </button>

        {/* Attach file (note/document) */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-blue-500 flex-shrink-0"
          title="Attach file"
          disabled={disabled}
        >
          <FiPaperclip size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'note')}
        />

        {/* Video */}
        <button
          onClick={() => videoInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-purple-500 flex-shrink-0"
          title="Send video"
          disabled={disabled}
        >
          <FiVideo size={20} />
        </button>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'video')}
        />

        {/* Text area */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm max-h-32"
          rows={1}
          disabled={disabled || isRecording}
          style={{ minHeight: '40px' }}
        />

        {/* Mic / Send */}
        {message.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:bg-gray-400 flex-shrink-0 shadow"
            title="Send"
          >
            <FiSend size={18} />
          </button>
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || !!audioBlob}
            className={`p-2.5 rounded-full transition flex-shrink-0 shadow ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            } disabled:opacity-50`}
            title={isRecording ? 'Stop recording' : 'Record voice note'}
          >
            {isRecording ? <FiMicOff size={18} /> : <FiMic size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
