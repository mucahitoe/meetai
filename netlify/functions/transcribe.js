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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { recording_id } = JSON.parse(event.body);

    // Get recording from Supabase
    const { data: recording, error: recordingError } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recording_id)
      .single();

    if (recordingError) throw new Error('Recording not found');

    // Update status to processing
    await supabase
      .from('recordings')
      .update({ status: 'processing' })
      .eq('id', recording_id);

    // Fetch audio file
    const response = await fetch(recording.audio_url);
    if (!response.ok) throw new Error('Failed to fetch audio file');
    
    const audioBuffer = await response.buffer();

    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    formData.append('model', 'whisper-1');

    // Create transcription
    const transcription = await openai.audio.transcriptions.create({
      file: formData.get('file'),
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

    if (updateError) throw updateError;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Transcription error:', error);

    // Update error status if we have a recording_id
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
      body: JSON.stringify({ error: error.message })
    };
  }
};