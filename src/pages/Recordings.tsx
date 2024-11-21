import React from 'react';
import { Mic, Download, Loader2 } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { formatDuration } from '../utils/formatDuration';
import { useRecordings } from '../hooks/useRecordings';
import { AudioPlayer } from '../components/AudioPlayer';

export function Recordings() {
  const { 
    isRecording, 
    duration, 
    error, 
    startRecording, 
    stopRecording 
  } = useAudioRecorder();

  const { recordings, isLoading } = useRecordings();

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Recordings</h1>
        <p className="text-text-secondary">Manage your meeting recordings</p>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </header>

      <div className="mb-8">
        <button
          onClick={() => isRecording ? stopRecording() : startRecording()}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium ${
            isRecording
              ? 'bg-accent/20 text-accent hover:bg-accent/30'
              : 'bg-primary text-white hover:bg-primary-hover'
          } transition-colors`}
        >
          <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          <span>
            {isRecording 
              ? `Recording (${formatDuration(duration)})` 
              : 'Start Recording'}
          </span>
        </button>
      </div>

      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Recent Recordings
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : recordings.length === 0 ? (
            <p className="text-text-secondary text-center py-8">
              No recordings yet. Start by recording your first meeting!
            </p>
          ) : (
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="p-4 rounded-lg bg-secondary-hover"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-text-primary">
                        {recording.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-text-secondary">
                          {formatDuration(recording.duration)}
                        </p>
                        <span className="text-sm text-text-secondary">•</span>
                        <p className="text-sm">
                          {recording.status === 'processing' ? (
                            <span className="text-accent flex items-center space-x-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Processing</span>
                            </span>
                          ) : recording.status === 'completed' ? (
                            <span className="text-primary">Transcribed</span>
                          ) : (
                            <span className="text-red-500">Error</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button 
                      className="p-2 hover:bg-background-secondary rounded-full transition-colors"
                      onClick={() => window.open(recording.audio_url)}
                    >
                      <Download className="w-5 h-5 text-text-primary" />
                    </button>
                  </div>
                  
                  <AudioPlayer url={recording.audio_url} />

                  {recording.transcript && (
                    <div className="mt-4 p-4 rounded-lg bg-background-secondary">
                      <h4 className="text-sm font-medium text-text-primary mb-2">
                        Transcript
                      </h4>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">
                        {recording.transcript}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}