import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vtdhkbblrulniqimfwsj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZGhrYmJscnVsbmlxaW1md3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMzkyNjksImV4cCI6MjA0NzcxNTI2OX0.g9toYBTF2sMQWfP-oX8CzxaCIwvjwZThRFaGsWIVte4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);