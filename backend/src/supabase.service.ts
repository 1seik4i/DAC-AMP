import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  public client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('SUPABASE_URL and SUPABASE_KEY are not set. Database integration is disabled.');
    } else {
      this.client = createClient(supabaseUrl, supabaseKey);
      this.logger.log('Supabase client initialized.');
    }
  }
}
