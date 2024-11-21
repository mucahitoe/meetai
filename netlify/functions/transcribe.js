const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const FormData = require('form-data');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 204, 
      headers: corsHeaders 
    };
  }

  try {
    const { recording_id } = JSON.parse(event.body);

    // Get recording
    const { data: recording, error: recordingError } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recording_id)
      .single();

    if (recordingError || !recording) {
      throw new Error('Recording not found');
    }

    // Extract file path from audio_url
    // audio_url format: https://<bucket>.supabase.co/storage/v1/object/public/recordings/<user_id>/<recording_id>.webm
    const urlParts = recording.audio_url.split('/');
    const filePath = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;

    // Download file from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase
      .storage
      .from('recordings')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download audio: ${downloadError.message}`);
    }

    if (!audioData) {
      throw new Error('No audio data received');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', audioData, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    formData.append('model', 'whisper-1');

    // Make request to OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API Error:', error);
      throw new Error(error.error?.message || 'Transcription failed');
    }

    const transcription = await openaiResponse.json();

    // Update recording with transcription
    const { error: updateError } = await supabase
      .from('recordings')
      .update({
        transcript: transcription.text,
        status: 'completed'
      })
      .eq('id', recording_id);

    if (updateError) {
      throw updateError;
    }

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Error:', error);

    // Update error status
    if (event.body) {
      try {
        const { recording_id } = JSON.parse(event.body);
        await supabase
          .from('recordings')
          .update({
            status: 'error',
            transcript: `Error: ${error.message}`
          })
          .eq('id', recording_id);
      } catch (e) {
        console.error('Error updating recording status:', e);
      }
    }

    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};