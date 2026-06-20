import React, { useState } from 'react';
import { 
  Search, 
  Upload, 
  Star, 
  ArrowDownToLine, 
  PlusCircle, 
  Map, 
  MessageSquare,
  ThumbsUp, 
  Check, 
  Headphones,
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { CommunityProfile, FeedPost } from '../types';
import { audioEngine } from '../audio';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

interface CommunityViewProps {
  volume: number;
  setCustomEq: (eq: number[]) => void;
  setActiveProfileId: (id: string) => void;
}

export default function CommunityView({
  volume,
  setCustomEq,
  setActiveProfileId
}: CommunityViewProps) {
  const [matchingBrand, setMatchingBrand] = useLocalStorageState('dac_community_brand', 'Sennheiser');
  const [matchingModel, setMatchingModel] = useLocalStorageState('dac_community_model', 'HD 600');
  const [didSearchMatches, setDidSearchMatches] = useState(true);
  const [searching, setSearching] = useState(false);
  const [appliedTarget, setAppliedTarget] = useState<string | null>(null);

  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);

  const brands = ['Sennheiser', 'Beyerdynamic', 'Audio-Technica', 'HIFIMAN', 'Audeze', 'Moondrop', 'FiiO', 'Truthear'];
  const modelsMap: Record<string, string[]> = {
    'Sennheiser': ['HD 600', 'HD 650', 'HD 800 S', 'HD 560S', 'IE 600', 'Momentum 4'],
    'Beyerdynamic': ['DT 770 PRO', 'DT 990 PRO', 'DT 1990 PRO', 'Amiron Home'],
    'Audio-Technica': ['ATH-M50x', 'ATH-R70x', 'ATH-AD900X'],
    'HIFIMAN': ['Sundara', 'Arya Stealth', 'Ananda Nano', 'Edition XS'],
    'Audeze': ['LCD-X', 'LCD-2 Classic', 'Maxwell'],
    'Moondrop': ['Aria', 'Blessing 3', 'Kato', 'Variations', 'Chu II'],
    'FiiO': ['FH3', 'FD5', 'FH9', 'FT3'],
    'Truthear': ['Hexa', 'Zero:Red', 'Nova']
  };

  const currentModels = modelsMap[matchingBrand] || [];

  // Update model when brand changes if current model is not in new brand's models
  React.useEffect(() => {
    if (!currentModels.includes(matchingModel) && currentModels.length > 0) {
      setMatchingModel(currentModels[0]);
    }
  }, [matchingBrand]);

  const [communityProfiles, setCommunityProfiles] = useState<CommunityProfile[]>([
    {
      id: 'cinematic-wider',
      title: 'Cinematic Wider',
      description: 'Optimized for soundstage expansion and sub-bass clarity. Highlights room expansion vectors.',
      category: 'High Fidelity',
      author: 'Alex River',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1aD1WW9OCwO7VMaLaOSIKjcdBgU6jjlsI2B1NqzjH-4R21_gop9jp23WVHXmZFoiG3-qNGk_PyIWV_RubJIg9xAByHULdWy_XXIwK_2Wd40ko1j_fFWYQbxtMxytUz8WtRLTShoeJwvyR8jutcDPgGlrDxjMVUYqAnCKXMYSzfqoBtdgVQ5bofz1eVJnEDMMdvCoWFKzsnmE44OeCEFJFE48vmTRgmlVcCfQLfAaqJbEy2JT4t1QE',
      downloads: '2.4k',
      rating: 4.9,
      eq: [4, 6, 4, 1, -1, -2, 1, 3, 5, 2]
    },
    {
      id: 'studio-flat',
      title: 'Studio Flat Reference',
      description: 'A custom neutral response target designed for pristine analytical acoustic monitor reviews.',
      category: 'Linear Response',
      author: 'Sarah Tone',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKNLh-Z0FPK-Flryq7jc4UTEyZJQsnSn5FVErl1nb1leeIx3dzl_pnFO9MbxABcsQGpDjYpJMVFn9662Qii4a8Kfkv26uPQM4Zoi6ozpVG1qS9LmDQh8zHafGIQYWnyfPVZWXRynKVQTvhrQtGUPYRghqIrV-_dYB7-o71S0oUzbmAJdlh_ae873eNHyt_wo8SkfS9_yeSQf61b5OUAAzDT5pEMp_C0FYZnjAwEvOQAKbRRWrNLeS0',
      downloads: '1.1k',
      rating: 4.7,
      eq: [0, 0, 1, 0, -1, 0, 1, 0, 0, -1]
    },
    {
      id: 'analog-heat',
      title: 'Analog Heat V2',
      description: 'Emulates the beautiful organic harmonic distortion and soft warmth typical of classic tube amps.',
      category: 'Warm Vinyl',
      author: 'Marco Beats',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVjeA1Txrv9uTxygVxsRWDOINp-WLjJmaL_YevUkov3CMrSnbB6Fg-l2BR5WB7HR6kkX9igiJPHrdNUREJQqhQfyeYTJWi-5LcIqwqXjZXb-eOBMEugc3gcaPjprm9iwoV8N664Z-XrVo9Dw3FHqvTv_zKKJ000knon0I5q_n-_kG2zfC___XX_Pn-dPZhddruGszBW9NreWwpBdZq-KpoiahZpVcxEey-9N2f-OI_YjmgN4owl3ha',
      downloads: '892',
      rating: 5.0,
      eq: [3, 4, 5, 2, 1, -1, -2, -3, -4, -5]
    }
  ]);

  const feedPosts: FeedPost[] = [
    {
      id: 'post-1',
      title: 'How to minimize distortion at high gain settings on DAC-X',
      category: 'Guide',
      time: '2 hours ago',
      likes: 42,
      comments: 18
    },
    {
      id: 'post-2',
      title: 'Why 192kHz might actually be detrimental to your listening experience',
      category: 'Tip',
      time: '5 hours ago',
      likes: 128,
      comments: 54
    },
    {
      id: 'post-3',
      title: 'The best EQ presets for gaming: footsteps vs. atmosphere spatial triggers',
      category: 'Discussion',
      time: '1 day ago',
      likes: 89,
      comments: 31
    }
  ];

  // Search Headphone correction targets
  const handleSearchMatches = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setDidSearchMatches(true);
      // Sweeping tone feedback
      audioEngine.playTest('vocal', [1, 2, 4, 5, 4, 2, 1, 0, 0, 0]);
    }, 1000);
  };

  const handleApplyTarget = (id: string, eq: number[]) => {
    setAppliedTarget(id);
    setActiveProfileId('custom');
    setCustomEq(eq);
    audioEngine.playTest('vocal', eq);
    setTimeout(() => {
      // Clear tag indicator
    }, 2800);
  };

  const handleDownloadProfile = (profile: CommunityProfile) => {
    setActiveProfileId('custom');
    setCustomEq([...profile.eq]);
    audioEngine.playTest(profile.title, profile.eq);
  };

  return (
    <div className="flex-1 animate-fade-in text-[#e5e2e1]">
      
      {/* Top section header */}
      <section className="mb-10 max-w-7xl">
        <h2 className="font-sans font-bold text-4xl text-[#e5e2e1] leading-tight mb-2">Community</h2>
        <p className="font-sans text-[#c1c6d7] text-sm md:text-base opacity-75">
          Share your custom EQs with audio reviewers, download high-fidelity target profiles, and configure corrections for specific headphones.
        </p>
      </section>

      {/* Featured Profiles Row */}
      <section className="mb-12 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-sans font-bold text-2xl text-white">Featured Profiles</h3>
          <span className="text-xs font-semibold text-[#adc6ff] hover:underline cursor-pointer">Explore All</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityProfiles.map((p) => (
            <div 
              key={p.id} 
              className="bg-[#121212]/80 border border-white/[0.08] p-6 rounded-3xl flex flex-col justify-between hover:border-[#adc6ff]/20 transition-all group hover:-translate-y-1 duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center text-[#adc6ff]">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] uppercase tracking-wider font-bold text-[#e9b3ff]">
                    {p.category}
                  </span>
                </div>

                <h4 className="font-sans font-bold text-lg text-white mb-1 group-hover:text-[#adc6ff] transition-colors">{p.title}</h4>
                <p className="text-xs text-[#c1c6d7] opacity-75 leading-relaxed mb-6">{p.description}</p>
              </div>

              {/* Author & downloads */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-white/[0.06] shrink-0 border border-white/[0.08]">
                    <img alt={p.author} referrerPolicy="no-referrer" src={p.avatar} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-semibold text-[#e5e2e1]">{p.author}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-3 text-xs text-[#8b90a0]">
                    <span className="flex items-center gap-1.5 text-[#adc6ff] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#adc6ff]/20" />
                      {p.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      {p.downloads}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleDownloadProfile(p)}
                    className="p-1 text-[#8b90a0] hover:text-[#adc6ff] transition-colors active:scale-95"
                    title="Install preset to Custom EQ"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Bento content row (Matching on Left, Feed posts on Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mb-12">
        
        {/* Headphone Matching Tool (Left Column, col span 8) */}
        <div className="lg:col-span-8 bg-[#121212]/80 border border-white/[0.08] p-8 rounded-3xl relative overflow-hidden backdrop-blur-md premium-shadow">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Headphones className="w-7 h-7 text-[#adc6ff]" />
              <h3 className="font-sans font-bold text-2xl text-white">Headphone Matcher</h3>
            </div>
            <p className="text-xs md:text-sm text-[#c1c6d7] opacity-80 mb-8 max-w-xl">
              Equip target corrections custom manufactured to flat out the frequency flaws on specific high-end monitor models.
            </p>

            {/* Selector boxes */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <div 
                  className={`bg-white/[0.03] rounded-2xl p-4 border transition-colors cursor-pointer ${isBrandOpen ? 'border-[#adc6ff]/50' : 'border-white/[0.06] hover:border-white/[0.12]'}`}
                  onClick={() => { setIsBrandOpen(!isBrandOpen); setIsModelOpen(false); }}
                >
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8b90a0] mb-1.5 cursor-pointer">Manufacturer Brand</label>
                  <div className="text-white font-bold text-sm select-none">{matchingBrand}</div>
                </div>
                
                {isBrandOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full max-h-64 overflow-y-auto bg-[#1e1e1e] border border-white/[0.08] rounded-xl z-20 shadow-2xl animate-fade-in custom-scrollbar">
                    {brands.map(brand => (
                      <div 
                        key={brand}
                        className={`px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${matchingBrand === brand ? 'bg-[#2563eb] text-white' : 'text-[#e5e2e1] hover:bg-white/[0.04]'}`}
                        onClick={() => { setMatchingBrand(brand); setIsBrandOpen(false); }}
                      >
                        {brand}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <div 
                  className={`bg-white/[0.03] rounded-2xl p-4 border transition-colors cursor-pointer ${isModelOpen ? 'border-[#adc6ff]/50' : 'border-white/[0.06] hover:border-white/[0.12]'}`}
                  onClick={() => { setIsModelOpen(!isModelOpen); setIsBrandOpen(false); }}
                >
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8b90a0] mb-1.5 cursor-pointer">Acoustic Model Name</label>
                  <div className="text-white font-bold text-sm select-none">{matchingModel}</div>
                </div>
                
                {isModelOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full max-h-64 overflow-y-auto bg-[#1e1e1e] border border-white/[0.08] rounded-xl z-20 shadow-2xl animate-fade-in custom-scrollbar">
                    {currentModels.map(model => (
                      <div 
                        key={model}
                        className={`px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${matchingModel === model ? 'bg-[#2563eb] text-white' : 'text-[#e5e2e1] hover:bg-white/[0.04]'}`}
                        onClick={() => { setMatchingModel(model); setIsModelOpen(false); }}
                      >
                        {model}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleSearchMatches}
                className="h-16 px-8 rounded-2xl bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#002e69] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
              >
                {searching ? 'Querying Database...' : 'Search Matches'}
              </button>
            </div>

            {/* Correction Target Suggestions list if searched */}
            {didSearchMatches && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#8b90a0] block">
                  RECOMMENDED TARGETS FOR {matchingBrand.toUpperCase()} {matchingModel.toUpperCase()}
                </span>
                
                <div className="flex flex-wrap gap-4">
                  
                  {/* Option 1 */}
                  <div 
                    onClick={() => handleApplyTarget('target-1', [-3, -1, 1, 2, 1, 0, -1, 2, 4, -1])}
                    className="bg-white/[0.03] hover:bg-white/[0.06] px-5 py-4 rounded-2xl border border-white/[0.06] flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#adc6ff]/10 flex items-center justify-center text-[#adc6ff]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Oratory1990 Harman Target</p>
                      <p className="text-[10px] text-[#8b90a0] mt-0.5">Professional Corrective Harman Curve</p>
                    </div>
                    {appliedTarget === 'target-1' && <Check className="w-4.5 h-4.5 text-emerald-400 ml-2" />}
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => handleApplyTarget('target-2', [-1, 2, 4, 1, -1, -2, 1, 3, 2, 0])}
                    className="bg-white/[0.03] hover:bg-white/[0.06] px-5 py-4 rounded-2xl border border-white/[0.06] flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#e9b3ff]/10 flex items-center justify-center text-[#e9b3ff]">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">HD600 Studio Clarity Mod</p>
                      <p className="text-[10px] text-[#8b90a0] mt-0.5">Custom User Tune: Audiophile_99</p>
                    </div>
                    {appliedTarget === 'target-2' && <Check className="w-4.5 h-4.5 text-emerald-400 ml-2" />}
                  </div>

                </div>
              </div>
            )}
          </div>

          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-1/4 translate-y-1/4">
            <Headphones className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Community Feed / Discussion Stream (Right Column, span 4) */}
        <div className="lg:col-span-4 bg-[#121212]/80 border border-white/[0.08] p-8 rounded-3xl flex flex-col backdrop-blur-md justify-between premium-shadow">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-sans font-bold text-lg text-white">Community Feed</h3>
              <RefreshCw className="w-4 h-4 text-[#8b90a0] cursor-pointer hover:text-white transition-colors" />
            </div>

            <div className="space-y-5">
              {feedPosts.map((post) => (
                <div key={post.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] uppercase tracking-wider font-bold text-[#adc6ff]">
                      {post.category}
                    </span>
                    <span className="text-[10px] text-[#8b90a0] font-medium font-mono">{post.time}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white leading-relaxed hover:text-[#adc6ff] cursor-pointer transition-colors line-clamp-2">
                    {post.title}
                  </h5>
                  <div className="flex items-center gap-3.5 text-[10px] text-[#8b90a0] font-semibold">
                    <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                      <ThumbsUp className="w-3 h-3" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                      <MessageSquare className="w-3 h-3" /> {post.comments}
                    </span>
                  </div>
                  {post.id !== 'post-3' && <hr className="border-white/[0.04] mt-3" />}
                </div>
              ))}
            </div>
          </div>

          <button className="w-full h-10 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white transition-colors rounded-xl text-[10px] uppercase font-bold tracking-wider text-[#c1c6d7] mt-8 shrink-0">
            Explore Discussions
          </button>
        </div>

      </section>

      {/* User shared presets list */}
      <section className="pb-10 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-sans font-bold text-xl text-white">My Uploaded Presets</h3>
          <span className="text-xs text-[#8b90a0] font-medium">3 active uploads</span>
        </div>

        <div className="overflow-x-auto pb-4 no-scrollbar">
          <div className="flex gap-6 min-w-max">
            
            {/* Template 1 */}
            <div className="w-80 bg-gradient-to-tr from-[#161616]/70 to-[#121212]/90 border border-white/[0.08] rounded-3xl p-6 border-l-4 border-l-[#adc6ff]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-sans font-bold text-base text-white">Late Night Jazz</h4>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#adc6ff]">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 font-mono text-center">
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                  <p className="text-[9px] text-[#8b90a0] uppercase tracking-wider font-semibold">Downloads</p>
                  <p className="text-sm font-bold text-white mt-0.5">142</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                  <p className="text-[9px] text-[#8b90a0] uppercase tracking-wider font-semibold">Rating</p>
                  <p className="text-sm font-bold text-[#adc6ff] mt-0.5">4.8 ★</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-[10px] uppercase font-bold tracking-wider bg-white/[0.03] hover:bg-white/[0.06] text-[#c1c6d7] hover:text-white rounded-lg transition-colors border border-white/[0.05]">Stats</button>
                <button className="flex-1 py-2 text-[10px] uppercase font-bold tracking-wider bg-white/[0.03] hover:bg-white/[0.06] text-[#c1c6d7] hover:text-white rounded-lg transition-colors border border-white/[0.05]">Edit</button>
              </div>
            </div>

            {/* Template 2 */}
            <div className="w-80 bg-gradient-to-tr from-[#161616]/70 to-[#121212]/90 border border-white/[0.08] rounded-3xl p-6 border-l-4 border-l-[#e9b3ff]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-sans font-bold text-base text-white">Competitive Gaming</h4>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#e9b3ff]">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 font-mono text-center">
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                  <p className="text-[9px] text-[#8b90a0] uppercase tracking-wider font-semibold">Downloads</p>
                  <p className="text-sm font-bold text-white mt-0.5">3,105</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                  <p className="text-[9px] text-[#8b90a0] uppercase tracking-wider font-semibold">Rating</p>
                  <p className="text-sm font-bold text-[#e9b3ff] mt-0.5">4.9 ★</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-[10px] uppercase font-bold tracking-wider bg-white/[0.03] hover:bg-white/[0.06] text-[#c1c6d7] hover:text-white rounded-lg transition-colors border border-white/[0.05]">Stats</button>
                <button className="flex-1 py-2 text-[10px] uppercase font-bold tracking-wider bg-white/[0.03] hover:bg-white/[0.06] text-[#c1c6d7] hover:text-white rounded-lg transition-colors border border-white/[0.05]">Edit</button>
              </div>
            </div>

            {/* Template 3 (Add target) */}
            <div className="w-80 border-2 border-dashed border-white/[0.08] hover:border-[#adc6ff]/50 rounded-3xl flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-white/[0.01] transition-all group">
              <Upload className="w-7 h-7 text-[#adc6ff] opacity-60 group-hover:opacity-100 transition-opacity mb-2" />
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Publish New EQ</h5>
              <p className="text-[10px] text-[#8b90a0] mt-1 max-w-[180px]">Share your unique acoustic profile with the world.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
