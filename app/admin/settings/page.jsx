"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Video, HelpCircle } from "lucide-react";

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videos, setVideos] = useState(["", "", "", "", ""]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/home_videos");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.value)) {
            setVideos(data.value);
          }
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "home_videos",
          value: videos,
        }),
      });

      if (res.ok) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const updateVideo = (index, value) => {
    const newVideos = [...videos];
    newVideos[index] = value;
    setVideos(newVideos);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 uppercase tracking-widest">Site Settings</h1>
        <p className="text-gray-500 mt-2">Manage global configurations and homepage content.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#c3a2ab]/10 text-[#c3a2ab] rounded-lg">
              <Video size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Homepage Creator Videos</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#161314] hover:bg-black text-white px-6 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
            <HelpCircle size={18} className="shrink-0" />
            <p>
              Enter the URLs for the TikTok creator videos shown on the homepage. 
              Leave blank to use the default videos (`/videos/tiktok-1.mp4`, etc.).
              Supports direct video URLs (e.g., from Firebase, Supabase Storage, or external CDNs).
            </p>
          </div>

          <div className="grid gap-6">
            {videos.map((vid, index) => (
              <div key={index} className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Video Slot {index + 1}
                </label>
                <input
                  type="text"
                  value={vid}
                  onChange={(e) => updateVideo(index, e.target.value)}
                  placeholder={`e.g. https://your-storage.com/tiktok-${index + 1}.mp4`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#c3a2ab] transition-colors font-mono text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
