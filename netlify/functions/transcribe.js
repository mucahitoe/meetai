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
    const { data: recording } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recording_id)
      .single();

    if (!recording) {
      throw new Error('Recording not found');
    }

    // Get the audio file
    const response = await fetch(recording.audio_url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create file object for OpenAI
    const file = {
      buffer,
      name: 'audio.webm',
      type: 'audio/webm'
    };

    // Transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1'
    });

    // Update recording
    await supabase
      .from('recordings')
      .update({
        transcript: transcription.text,
        status: 'completed'
      })
      .eq('id', recording_id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Error:', error);

    // Update error status
    if (event.body) {
      const { recording_id } = JSON.parse(event.body);
      await supabase
        .from('recordings')
        .update({
          status: 'error',
          transcript: `Error: ${error.message}`
        })
        .eq('id', recording_id);
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};