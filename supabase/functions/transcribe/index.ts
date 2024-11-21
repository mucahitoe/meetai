import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recording_id } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get recording details
    const { data: recording, error: recordingError } = await supabaseClient
      .from('recordings')
      .select('*')
      .eq('id', recording_id)
      .single()

    if (recordingError || !recording) {
      throw new Error('Recording not found')
    }

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Download the audio file
    const { data: audioData } = await supabaseClient
      .storage
      .from('recordings')
      .download(recording.audio_url.split('/').slice(-2).join('/'))

    if (!audioData) {
      throw new Error('Audio file not found')
    }

    // Convert audio to base64
    const audioBase64 = await audioData.arrayBuffer()
    const audioFile = new File([audioBase64], 'audio.webm', { type: 'audio/webm' })

    // Transcribe with Whisper
    const transcription = await openai.createTranscription(
      audioFile,
      'whisper-1',
      undefined,
      'text'
    )

    // Update recording with transcript
    const { error: updateError } = await supabaseClient
      .from('recordings')
      .update({
        transcript: transcription.data,
        status: 'completed'
      })
      .eq('id', recording_id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})