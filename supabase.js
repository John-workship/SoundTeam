import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://menaeypgdctjvvubckfh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SITLvhr3bBpJXza3uN5gIg_de2Z5raQ'; // Pega aquí tu Publishable key completa

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);;