import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const startTime = useRef<number>(0);
  const durationInterval = useRef<number>();
  
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const uploadRecording = useCallback(async (audioBlob: Blob) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Create recording entry first
      const { data: recording, error: dbError } = await supabase
        .from('recordings')
        .insert({
          title: `Recording ${new Date().toLocaleString()}`,
          audio_url: '', // Will update after upload
          duration: duration,
          user_id: user.id,
          status: 'processing'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Upload audio file
      const fileName = `${user.id}/${recording.id}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);

      // Update recording with URL
      const { error: updateError } = await supabase
        .from('recordings')
        .update({ audio_url: publicUrl })
        .eq('id', recording.id);

      if (updateError) throw updateError;

      // Start transcription
      await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recording_id: recording.id })
      });

      navigate('/recordings');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload recording');
    }
  }, [user, duration, navigate]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      startTime.current = Date.now();

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await uploadRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start(1000);
      setIsRecording(true);
      
      durationInterval.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000));
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      clearInterval(durationInterval.current);
      setDuration(0);
    }
  };

  return {
    isRecording,
    duration,
    error,
    startRecording,
    stopRecording,
  };
}