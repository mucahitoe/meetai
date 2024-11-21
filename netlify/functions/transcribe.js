const axios = require('axios');
const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    const form = new FormData();
    form.append('file', audioData, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    form.append('model', 'whisper-1');

    // Make request to OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders()
        }
      }
    );

    // Update recording with transcription
    const { error: updateError } = await supabase
      .from('recordings')
      .update({
        transcript: response.data.text,
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
      body: JSON.stringify({ 
        error: error.response?.data?.error?.message || error.message 
      })
    };
  }
};