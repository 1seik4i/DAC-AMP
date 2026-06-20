export type View = 'dashboard' | 'profiles' | 'simple' | 'advanced' | 'animation' | 'community' | 'settings' | 'auth' | 'user-profile';

export interface SoundProfile {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  isDefault?: boolean;
  eq: number[]; // 10 gain values (-12 to 12 dB)
  created_at?: string;
  updated_at?: string;
  author?: string;
  tags?: string[];
  downloadCount?: number;
  likeCount?: number;
  favoriteCount?: number;
  rating?: number;
}

export interface EqBand {
  freq: number;
  gain: number;
  q: number;
}

export interface CommunityProfile {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  avatar: string;
  downloads: string;
  rating: number;
  eq: number[];
}

export interface FeedPost {
  id: string;
  title: string;
  category: 'Guide' | 'Tip' | 'Discussion';
  time: string;
  likes: number;
  comments: number;
}

export interface AnimationPreset {
  id: string;
  name: string;
  icon: string;
}

export interface UserState {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  isLoggedIn: boolean;
}
