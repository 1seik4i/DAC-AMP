import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class ProfileManagerService {
  private readonly logger = new Logger(ProfileManagerService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async getProfiles() {
    if (!this.supabase.client) return [];
    const { data, error } = await this.supabase.client.from('profiles').select('*');
    if (error) this.logger.error(error.message);
    return data || [];
  }

  async saveProfile(profile: any) {
    if (!this.supabase.client) return;
    const { error } = await this.supabase.client.from('profiles').upsert(profile);
    if (error) this.logger.error(error.message);
  }
}
