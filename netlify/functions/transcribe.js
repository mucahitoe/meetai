const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { Readable } = require('stream');

// Initialize Supabase client with error checking
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client with error checking
const openaiKey = process.env.OPENAI_API_KEY;

if (!openaiKey) {
  throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
  apiKey: openaiKey
});

// Convert buffer to stream
function bufferToStream(buffer) {
  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });
}

exports.handler = async (event) => {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { recording_id } = JSON.parse(event.body);

    if (!recording_id) {
      throw new Error('Recording ID is required');
    }

    // Get recording from Supabase
    const { data: recording, error: recordingError } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recording_id)
      .single();

    if (recordingError || !recording) {
      throw new Error('Recording not found');
    }

    // Download audio file
    const response = await fetch(recording.audio_url);
    if (!response.ok) {
      throw new Error('Failed to fetch audio file');
    }

    // Get audio data as buffer
    const audioBuffer = await response.buffer();
    const audioStream = bufferToStream(audioBuffer);

    // Create transcription using OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      response_format: 'text',
      filename: 'audio.webm'
    });

    // Update recording with transcription
    const { error: updateError } = await supabase
      .from('recordings')
      .update({
        transcript: transcription,
        status: 'completed'
      })
      .eq('id', recording_id);

    if (updateError) {
      throw updateError;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        transcript: transcription
      })
    };

  } catch (error) {
    console.error('Transcription error:', error);

    // Update recording status to error
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
      body: JSON.stringify({
        error: error.message || 'Internal server error'
      })
    };
  }
};