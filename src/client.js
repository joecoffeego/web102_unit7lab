import { createClient } from '@supabase/supabase-js';

const URL = 'https://ngmldiddybmvslzrpusw.supabase.co';
const API_KEY = 'sb_publishable_9hfxEWGK9I8rKbv0RlpO0w_XaEMoQI4'

export const supabase = createClient(URL, API_KEY);
