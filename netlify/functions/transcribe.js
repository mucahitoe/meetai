const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
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

    // Fetch audio file
    const response = await fetch(recording.audio_url);
    if (!response.ok) {
      throw new Error('Failed to fetch audio file');
    }

    // Get the audio data as a buffer
    const audioBuffer = await response.buffer();

    // Create a file object that OpenAI's API can understand
    const file = {
      buffer: audioBuffer,
      name: 'audio.webm'
    };

    // Use OpenAI's SDK to create transcription
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1'
    });

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
      headers,
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
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};