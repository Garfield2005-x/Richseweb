'use client';

import { useState } from 'react';
import { submitClip, registerChannel } from '../actions/affiliate';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmitClipPage() {
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [clips, setClips] = useState([
    { clip_url: '', affiliate_url: '' }
  ]);

  const addClip = () => {
    setClips([...clips, { clip_url: '', affiliate_url: '' }]);
  };

  const removeClip = (index: number) => {
    if (clips.length > 1) {
      setClips(clips.filter((_, i) => i !== index));
    }
  };

  const updateClip = (index: number, field: 'clip_url' | 'affiliate_url', value: string) => {
    const newClips = [...clips];
    newClips[index] = { ...newClips[index], [field]: value };
    setClips(newClips);
  };

  const handleRegister = async () => {
    if (!channelName) {
      toast.error('กรุณากรอกชื่อช่องที่ต้องการลงทะเบียน');
      return;
    }
    setRegistering(true);
    try {
      const result = await registerChannel(channelName);
      if (result.success) {
        toast.success('ส่งคำขอลงทะเบียนช่องแล้ว! กรุณารอแอดมินอนุมัติก่อนส่งคลิป');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await submitClip({
        channel_name: channelName,
        clips: clips
      });

      if (result.success) {
        toast.success('ส่งข้อมูลสำเร็จแล้ว! ขอบคุณที่ร่วมเป็นส่วนหนึ่งกับเรา');
        setChannelName('');
        setClips([{ clip_url: '', affiliate_url: '' }]);
      } else {
        // Specific error message as requested by user
        if (result.error?.includes('ไม่พบชื่อช่อง')) {
          toast.error(result.error, {
            duration: 5000,
            icon: '🚫'
          });
        } else {
          toast.error(result.error || 'เกิดข้อผิดพลาด');
        }
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center py-6 md:py-12 px-3 md:px-4 selection:bg-[#c3a2ab] selection:text-white">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#161314] via-[#c3a2ab] to-[#161314] z-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-[42px] font-display font-bold text-[#161314] tracking-tight mb-2">
            RICHSE <span className="text-[#c3a2ab] font-light italic">Affiliate</span>
          </h1>
          <p className="text-gray-400 uppercase tracking-[0.15em] md:tracking-[0.2em] text-[10px] md:text-sm font-semibold">
            Portal Submission
          </p>
        </div>

        <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-5 md:p-10 border border-gray-100 overflow-hidden relative">
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            {/* Channel Name Section */}
            <div className="space-y-4 pb-6 md:pb-8 border-b border-gray-100">
              <div className="flex items-center justify-between pl-1">
                <label className="block text-[11px] md:text-[13px] font-bold text-[#161314] uppercase tracking-widest leading-none">
                  Channel Name / ชื่อช่อง
                </label>
                <div className="text-[9px] md:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Needs Approval
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  required
                  type="text"
                  placeholder="เช่น TikTok @richse.official"
                  className="flex-1 px-5 md:px-6 py-3.5 md:py-4 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all duration-300 outline-none text-[#161314] placeholder:text-gray-400 font-semibold"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                />
                <button
                  type="button"
                  disabled={registering || !channelName}
                  onClick={handleRegister}
                  className="px-6 py-3.5 md:py-4 bg-[#c3a2ab] text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm tracking-widest hover:bg-[#b08b96] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {registering ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  )}
                  REGISTER
                </button>
              </div>
              <p className="text-[10px] md:text-[11px] text-gray-400 font-medium italic pl-1">
                * หากเป็นผู้ใช้ใหม่ กรุณากดปุ่ม Register เพื่อลงทะเบียนช่องก่อนส่งงานครับ
              </p>
            </div>

            {/* Clips Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[11px] md:text-[13px] font-bold text-[#161314] uppercase tracking-widest">
                  Clip Details / รายละเอียดคลิป
                </label>
                <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                  {clips.length} {clips.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {clips.map((clip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="relative p-5 md:p-6 bg-gray-50/50 rounded-[24px] border border-gray-100/50 hover:border-[#c3a2ab]/20 transition-colors group"
                    >
                      {/* Clip Header for Mobile/iPad */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-bold text-[#c3a2ab] uppercase tracking-widest">
                          Clip #{index + 1}
                        </span>
                        {clips.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeClip(index)}
                            className="w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] pl-1">
                            Clip URL
                          </label>
                          <input
                            required
                            type="url"
                            placeholder="https://tiktok.com/@..."
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c3a2ab]/50 transition-all duration-300 outline-none text-[#161314] text-sm"
                            value={clip.clip_url}
                            onChange={(e) => updateClip(index, 'clip_url', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] pl-1">
                            Affiliate Code
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="โค้ดเจน"
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c3a2ab]/50 transition-all duration-300 outline-none text-[#161314] text-sm"
                            value={clip.affiliate_url}
                            onChange={(e) => updateClip(index, 'affiliate_url', e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={addClip}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl md:rounded-2xl text-gray-400 font-bold text-xs md:text-sm hover:border-[#c3a2ab] hover:text-[#c3a2ab] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                เพิ่มคลิปถัดไป / ADD ANOTHER CLIP
              </motion.button>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 md:py-5 bg-[#161314] text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-[#252122] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 flex items-center justify-center gap-3 overflow-hidden relative group mt-4 md:mt-6"
            >
              <span className={loading ? 'opacity-0' : 'group-hover:translate-x-1 transition-transform'}>
                SUBMIT ALL CLIPS ({clips.length})
              </span>
              {!loading && (
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">
                  rocket_launch
                </span>
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 md:mt-12 text-gray-400 text-[10px] md:text-sm tracking-widest font-medium uppercase">
          &copy; 2024 RICHSE OFFICIAL &bull; Elite Affiliate Division
        </p>
      </motion.div>
    </div>
  );
}
