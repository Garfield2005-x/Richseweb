'use client';

import { useState } from 'react';
import { updateClipStatus, deleteClip, updateChannelStatus, deleteChannel } from '../../actions/affiliate';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Clip {
  id: string;
  channel_name: string;
  clip_url: string;
  affiliate_url: string;
  status: string;
  created_at: Date;
}

interface Channel {
  id: string;
  name: string;
  status: string;
  created_at: Date;
}

export default function AffiliateDashboardClient({ 
  initialClips,
  initialChannels
}: { 
  initialClips: Clip[],
  initialChannels: Channel[]
}) {
  const [activeTab, setActiveTab] = useState<'clips' | 'channels'>('clips');
  const [clips, setClips] = useState(initialClips);
  const [channels, setChannels] = useState(initialChannels);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  // Filter Logic for Clips
  const filteredClips = clips.filter(clip => {
    const matchesSearch = clip.channel_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || clip.status === statusFilter;
    const matchesDate = !dateFilter || format(new Date(clip.created_at), 'yyyy-MM-dd') === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filter Logic for Channels
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || channel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/admin/affiliate/export');
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `richse-affiliate-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('ดาวน์โหลด Excel เรียบร้อยแล้ว');
    } catch {
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลด');
    } finally {
      setExporting(false);
    }
  };

  const handleClipStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const result = await updateClipStatus(id, newStatus);
      if (result.success) {
        setClips(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        toast.success(`เปลี่ยนสถานะคลิปเป็น ${newStatus} แล้ว`);
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการอัปเดต');
    }
  };

  const handleClipDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลคลิปนี้?')) return;
    try {
      const result = await deleteClip(id);
      if (result.success) {
        setClips(prev => prev.filter(c => c.id !== id));
        toast.success('ลบข้อมูลคลิปสำเร็จแล้ว');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleChannelStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const result = await updateChannelStatus(id, newStatus);
      if (result.success) {
        setChannels(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        toast.success(`เปลี่ยนสถานะช่องเป็น ${newStatus} แล้ว`);
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleChannelDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลช่องนี้? ทั้งรายชื่อและการลงทะเบียนจะหายไป')) return;
    try {
      const result = await deleteChannel(id);
      if (result.success) {
        setChannels(prev => prev.filter(c => c.id !== id));
        toast.success('ลบข้อมูลช่องสำเร็จแล้ว');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const channelCounts = clips.reduce((acc: Record<string, number>, clip) => {
    acc[clip.channel_name] = (acc[clip.channel_name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button
          onClick={() => setActiveTab('clips')}
          className={`flex-1 py-4 px-3 md:px-6 text-[11px] md:text-sm font-bold transition-all ${
            activeTab === 'clips' 
            ? 'text-[#c3a2ab] border-b-2 border-[#c3a2ab] bg-white' 
            : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          SUBMISSION CLIPS
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-4 px-3 md:px-6 text-[11px] md:text-sm font-bold transition-all ${
            activeTab === 'channels' 
            ? 'text-[#c3a2ab] border-b-2 border-[#c3a2ab] bg-white' 
            : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          WHITELIST CHANNELS
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col xl:flex-row gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder={activeTab === 'clips' ? "Search channel name..." : "Search registered name..."}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none text-[#161314]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 md:gap-4 items-center">
          {activeTab === 'clips' && (
            <input
              type="date"
              className="w-full lg:w-auto px-4 py-3 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none text-gray-600"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          )}
          <select
            className="w-full lg:w-auto px-4 py-3 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none text-gray-600 appearance-none bg-[url('https://api.iconify.design/heroicons:chevron-down.svg')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {activeTab === 'clips' && (
            <button
              disabled={exporting}
              onClick={handleExport}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#161314] text-white rounded-xl md:rounded-2xl font-bold hover:bg-[#252122] transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              {exporting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[20px]">download</span>
              )}
              <span className="text-xs md:text-sm">EXPORT EXCEL</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'clips' ? (
        <div className="flex flex-col">
          {/* Mobile Card View (Clips) */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredClips.map((clip) => (
              <div key={clip.id} className="p-5 space-y-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold text-[#161314] text-lg">{clip.channel_name}</p>
                    <p className="text-[10px] font-bold text-[#c3a2ab] uppercase tracking-widest bg-gray-50 inline-block px-2 py-0.5 rounded">
                      {channelCounts[clip.channel_name] || 0} CLIPS TOTAL
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    clip.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    clip.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {clip.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-xl">
                    <span className="material-symbols-outlined text-gray-400 text-base">link</span>
                    <a href={clip.clip_url} target="_blank" rel="noopener noreferrer" className="text-[#c3a2ab] font-bold truncate">
                      View Clip Source
                    </a>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-xl">
                    <span className="material-symbols-outlined text-gray-400 text-base">code</span>
                    <span className="text-gray-600 font-mono truncate">{clip.affiliate_url}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 px-1">
                    <span className="material-symbols-outlined text-sm">event</span>
                    <span className="text-[11px] font-medium">{format(new Date(clip.created_at), 'dd MMM yyyy HH:mm')}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {clip.status !== 'approved' && (
                    <button
                      onClick={() => handleClipStatusUpdate(clip.id, 'approved')}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all"
                    >
                      Approve
                    </button>
                  )}
                  {clip.status !== 'rejected' && (
                    <button
                      onClick={() => handleClipStatusUpdate(clip.id, 'rejected')}
                      className="flex-1 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-50 transition-all"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleClipDelete(clip.id)}
                    className="p-3 text-rose-300 hover:text-rose-500 bg-rose-50 rounded-xl transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (Clips) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest">Channel</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest">Clip Link</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest">โค้ดเจน</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClips.map((clip) => (
                  <tr key={clip.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#161314]">{clip.channel_name}</span>
                        <span className="text-[10px] font-bold text-[#c3a2ab] uppercase tracking-wider mt-0.5">
                          {channelCounts[clip.channel_name] || 0} CLIPS TOTAL
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <a 
                        href={clip.clip_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#c3a2ab] hover:underline transition-opacity font-medium"
                      >
                        View Clip <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-[200px] truncate text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                        {clip.affiliate_url}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-500 text-sm">
                      {format(new Date(clip.created_at), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        clip.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        clip.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {clip.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <div className="flex items-center justify-end gap-2 text-nowrap">
                        {clip.status !== 'approved' && (
                          <button
                            onClick={() => handleClipStatusUpdate(clip.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
                          >
                            Approve
                          </button>
                        )}
                        {clip.status !== 'rejected' && (
                          <button
                            onClick={() => handleClipStatusUpdate(clip.id, 'rejected')}
                            className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-bold shadow-sm hover:bg-rose-50 transition-all active:scale-95"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleClipDelete(clip.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Mobile Card View (Channels) */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredChannels.map((channel) => (
              <div key={channel.id} className="p-5 space-y-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold text-[#161314] text-lg">{channel.name}</p>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      <span className="text-[11px] font-medium tracking-tight">Registered {format(new Date(channel.created_at), 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    channel.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    channel.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {channel.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {channel.status !== 'approved' && (
                    <button
                      onClick={() => handleChannelStatusUpdate(channel.id, 'approved')}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all"
                    >
                      Approve
                    </button>
                  )}
                  {channel.status !== 'rejected' && (
                    <button
                      onClick={() => handleChannelStatusUpdate(channel.id, 'rejected')}
                      className="flex-1 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-50 transition-all"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleChannelDelete(channel.id)}
                    className="p-3 text-rose-300 hover:text-rose-500 bg-rose-50 rounded-xl transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (Channels) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest">Channel Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest">Registration Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredChannels.map((channel) => (
                  <tr key={channel.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-semibold text-[#161314]">{channel.name}</span>
                    </td>
                    <td className="px-6 py-5 text-gray-500 text-sm">
                      {format(new Date(channel.created_at), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        channel.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        channel.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {channel.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2 text-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {channel.status !== 'approved' && (
                          <button
                            onClick={() => handleChannelStatusUpdate(channel.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
                          >
                            Approve
                          </button>
                        )}
                        {channel.status !== 'rejected' && (
                          <button
                            onClick={() => handleChannelStatusUpdate(channel.id, 'rejected')}
                            className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-bold shadow-sm hover:bg-rose-50 transition-all active:scale-95"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleChannelDelete(channel.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeTab === 'clips' ? filteredClips : filteredChannels).length === 0 && (
        <div className="px-6 py-20 text-center text-gray-400">
          <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
          <p>No records found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
