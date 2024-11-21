import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { formatDuration } from '../utils/formatDuration';

interface AudioPlayerProps {
  url: string;
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [url]);

  const togglePlay = async () => {
    if (error || !audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError('Failed to play audio: File may be missing');
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(Math.floor(audioRef.current.duration));
      setError(null);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleError = () => {
    setError('Failed to load audio file');
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500 p-2">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
      />
      
      <button
        onClick={togglePlay}
        className="p-2 hover:bg-background-secondary rounded-full transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-text-primary" />
        ) : (
          <Play className="w-5 h-5 text-text-primary" />
        )}
      </button>

      <div className="flex-1 flex items-center space-x-2">
        <span className="text-sm text-text-secondary min-w-[40px]">
          {formatDuration(currentTime)}
        </span>
        
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 bg-background-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
        
        <span className="text-sm text-text-secondary min-w-[40px]">
          {formatDuration(duration)}
        </span>
      </div>

      <button
        onClick={toggleMute}
        className="p-2 hover:bg-background-secondary rounded-full transition-colors"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-text-secondary" />
        ) : (
          <Volume2 className="w-5 h-5 text-text-primary" />
        )}
      </button>
    </div>
  );
}