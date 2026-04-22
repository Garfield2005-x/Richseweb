'use client';

import { useState } from 'react';
import { updateClipStatus, deleteClip, updateChannelStatus, deleteChannel, createCampaign, updateCampaign, deleteCampaign, getCampaignDetailedStats, getGlobalAffiliateStats } from '../../actions/affiliate';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Clip {
  id: string;
  channel_name: string;
  clip_url: string;
  affiliate_url: string;
  status: string;
  created_at: Date;
  campaign_id?: string | null;
  campaign?: { name: string } | null;
}

interface Channel {
  id: string;
  name: string;
  status: string;
  created_at: Date;
}

interface Campaign {
  id: string;
  name: string;
  product_name?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: Date;
  _count?: {
    clips: number;
  };
}

interface CampaignStats {
  campaign: Campaign;
  contributors: {
    name: string;
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    latest: Date;
  }[];
  summary: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    uniqueCreators: number;
  };
}

export default function AffiliateDashboardClient({ 
  initialClips,
  initialChannels,
  initialCampaigns
}: { 
  initialClips: Clip[],
  initialChannels: Channel[],
  initialCampaigns: Campaign[]
}) {
  const [activeTab, setActiveTab] = useState<'clips' | 'channels' | 'campaigns' | 'overview'>('clips');
  const [clips, setClips] = useState(initialClips);
  const [channels, setChannels] = useState(initialChannels);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  
  const [campaignFilter, setCampaignFilter] = useState('all');
  
  // Campaign Form State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    product_name: '',
    description: ''
  });
  
  // Detailed Insight State
  const [viewingCampaignStats, setViewingCampaignStats] = useState<CampaignStats | null>(null);

  interface GlobalLeaderboardItem {
    name: string;
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    campaignsJoined: string[];
    campaignsCount: number;
    latest: Date | null;
  }

  interface GlobalOverviewData {
    leaderboard: GlobalLeaderboardItem[];
    summary: {
      totalClips: number;
      totalApproved: number;
      totalCreators: number;
      activeCreators: number;
    };
  }

  // Global Overview State
  const [globalOverviewStats, setGlobalOverviewStats] = useState<GlobalOverviewData | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  // Filter Logic for Clips
  const filteredClips = clips.filter(clip => {
    const matchesSearch = clip.channel_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || clip.status === statusFilter;
    const matchesDate = !dateFilter || format(new Date(clip.created_at), 'yyyy-MM-dd') === dateFilter;
    const matchesCampaign = campaignFilter === 'all' || clip.campaign_id === campaignFilter;
    return matchesSearch && matchesStatus && matchesDate && matchesCampaign;
  });

  // Filter Logic for Channels
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || channel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = async (channel?: string | unknown) => {
    setExporting(true);
    try {
      const channelName = typeof channel === 'string' ? channel : undefined;
      const url = channelName 
        ? `/api/admin/affiliate/export?channel=${encodeURIComponent(channelName)}`
        : '/api/admin/affiliate/export';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj;
      const date = new Date().toISOString().split('T')[0];
      a.download = channel 
        ? `richse-affiliate-${channel}-${date}.xlsx`
        : `richse-affiliate-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlObj);
      document.body.removeChild(a);
      toast.success(channel ? `ดาวน์โหลด Excel ของ ${channel} เรียบร้อยแล้ว` : 'ดาวน์โหลด Excel เรียบร้อยแล้ว');
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

  // Campaign Handlers
  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        const result = await updateCampaign(editingCampaign.id, campaignFormData);
        if (result.success) {
          setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? { ...c, ...campaignFormData } : c));
          toast.success('อัปเดตแคมเปญสำเร็จ');
          setIsCampaignModalOpen(false);
          setEditingCampaign(null);
        }
      } else {
        const result = await createCampaign(campaignFormData);
        if (result.success && 'campaign' in result) {
          setCampaigns(prev => [result.campaign as Campaign, ...prev]);
          toast.success('สร้างแคมเปญสำเร็จ');
          setIsCampaignModalOpen(false);
        }
      }
      setCampaignFormData({ name: '', product_name: '', description: '' });
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleCampaignDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแคมเปญนี้? ข้อมูลคลิปที่อยู่ในแคมเปญนี้จะกลายเป็นไม่มีแคมเปญ')) return;
    try {
      const result = await deleteCampaign(id);
      if (result.success) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        toast.success('ลบแคมเปญสำเร็จ');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleCampaignToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const result = await updateCampaign(id, { is_active: !currentStatus });
      if (result.success) {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
        toast.success(`เปลี่ยนสถานะแคมเปญแล้ว`);
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleFetchInsights = async (campaignId: string) => {
    try {
      const result = await getCampaignDetailedStats(campaignId);
      if (result.success && 'contributors' in result) {
        setViewingCampaignStats(result as CampaignStats);
      } else {
        toast.error((result as { error?: string }).error || 'Failed to fetch insights');
      }
    } catch {
      toast.error('Error fetching campaign data');
    }
  };

  const handleFetchGlobalStats = async () => {
    setLoadingGlobal(true);
    try {
      const result = await getGlobalAffiliateStats();
      if (result.success) {
        setGlobalOverviewStats({
          leaderboard: result.leaderboard || [],
          summary: result.summary
        });
      } else {
        toast.error(result.error || 'Failed to fetch global stats');
      }
    } catch {
      toast.error('Error fetching system overview');
    } finally {
      setLoadingGlobal(false);
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
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex-1 py-4 px-3 md:px-6 text-[11px] md:text-sm font-bold transition-all ${
            activeTab === 'campaigns' 
            ? 'text-[#c3a2ab] border-b-2 border-[#c3a2ab] bg-white' 
            : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          CAMPAIGNS
        </button>
        <button
          onClick={() => {
            setActiveTab('overview');
            handleFetchGlobalStats();
          }}
          className={`flex-1 py-4 px-3 md:px-6 text-[11px] md:text-sm font-bold transition-all ${
            activeTab === 'overview' 
            ? 'text-[#c3a2ab] border-b-2 border-[#c3a2ab] bg-white' 
            : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          OVERVIEW
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
            <select
              className="w-full lg:w-auto px-4 py-3 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none text-gray-600 appearance-none bg-[url('https://api.iconify.design/heroicons:chevron-down.svg')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {activeTab === 'clips' && (
            <button
              disabled={exporting}
              onClick={() => handleExport()}
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

          {activeTab === 'campaigns' && (
            <button
              onClick={() => {
                setEditingCampaign(null);
                setCampaignFormData({ name: '', product_name: '', description: '' });
                setIsCampaignModalOpen(true);
              }}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#c3a2ab] text-white rounded-xl md:rounded-2xl font-bold hover:bg-[#b08b96] transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-xs md:text-sm">NEW CAMPAIGN</span>
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
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-[#c3a2ab] uppercase tracking-widest bg-gray-50 inline-block px-2 py-0.5 rounded">
                        {channelCounts[clip.channel_name] || 0} CLIPS TOTAL
                      </p>
                      {clip.campaign && (
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 inline-block px-2 py-0.5 rounded">
                          {clip.campaign.name}
                        </p>
                      )}
                    </div>
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
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-widest">Channel / Campaign</th>
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
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-[#c3a2ab] uppercase tracking-wider">
                            {channelCounts[clip.channel_name] || 0} CLIPS
                          </span>
                          {clip.campaign && (
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-1 rounded">
                              {clip.campaign.name}
                            </span>
                          )}
                        </div>
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
      ) : activeTab === 'overview' ? (
        <div className="flex flex-col animate-in fade-in duration-700">
           {loadingGlobal ? (
             <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-4 border-[#c3a2ab]/30 border-t-[#c3a2ab] rounded-full animate-spin" />
                <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Fetching System Overview...</p>
             </div>
           ) : globalOverviewStats ? (
             <div className="space-y-10 p-6">
                {/* Global KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                   {[
                     { label: 'Total System Clips', value: globalOverviewStats.summary.totalClips, color: 'text-[#161314]', icon: 'equalizer' },
                     { label: 'Approved Clips', value: globalOverviewStats.summary.totalApproved, color: 'text-emerald-500', icon: 'fact_check' },
                     { label: 'Registered Creators', value: globalOverviewStats.summary.totalCreators, color: 'text-blue-500', icon: 'groups_3' },
                     { label: 'Active This Period', value: globalOverviewStats.summary.activeCreators, color: 'text-[#c3a2ab]', icon: 'bolt' }
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                           <span className={`material-symbols-outlined ${stat.color} text-[20px]`}>{stat.icon}</span>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                        </div>
                        <h2 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h2>
                     </div>
                   ))}
                </div>

                {/* Global Leaderboard Table */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
                   <div className="px-8 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                         <h3 className="font-bold text-2xl text-[#161314]">Creator Leaderboard</h3>
                         <p className="text-gray-400 text-sm font-medium">Ranked by total approved clips across all campaigns</p>
                      </div>
                      <button 
                         onClick={handleFetchGlobalStats}
                         className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all"
                      >
                         <span className="material-symbols-outlined text-[16px]">refresh</span>
                         Sync Data
                      </button>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-gray-50/50">
                               <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">Rank</th>
                               <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest">Creator Name</th>
                               <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">Approved</th>
                               <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">Campaigns</th>
                               <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">Total Lifetime</th>
                               <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-right">Latest Sub.</th>
                               <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-right">Export</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                            {globalOverviewStats.leaderboard.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50/30 transition-colors group">
                                 <td className="px-8 py-6 text-center">
                                    {index < 3 ? (
                                       <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-black mx-auto ${
                                          index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400/20' :
                                          index === 1 ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-400/20' :
                                          'bg-orange-100 text-orange-700 ring-2 ring-orange-400/20'
                                       }`}>
                                          {index === 0 ? '🏆' : index + 1}
                                       </span>
                                    ) : (
                                       <span className="text-gray-400 font-bold text-sm">#{index + 1}</span>
                                    )}
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                       <span className="font-bold text-[#161314] text-lg group-hover:text-[#c3a2ab] transition-colors">{item.name}</span>
                                       <div className="flex items-center gap-2 mt-0.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lifetime Active</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 text-center">
                                    <span className="text-xl font-black text-[#161314]">{item.approved}</span>
                                 </td>
                                 <td className="px-8 py-6 text-center">
                                    <span className="px-3 py-1 bg-[#c3a2ab]/10 text-[#c3a2ab] rounded-full font-bold text-[11px] uppercase tracking-wider">
                                       {item.campaignsCount} Campaigns
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 text-center">
                                    <span className="font-bold text-gray-400">{item.total} Clips</span>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <span className="text-xs text-gray-400 font-medium">
                                       {item.latest ? format(new Date(item.latest), 'dd MMM yyyy') : 'No submissions'}
                                    </span>
                                 </td>
                                  <td className="px-8 py-6 text-right">
                                     <button
                                        onClick={() => handleExport(item.name)}
                                        className="p-2 text-gray-400 hover:text-[#c3a2ab] hover:bg-[#c3a2ab]/5 rounded-xl transition-all"
                                        title="Export Individual Excel"
                                     >
                                        <span className="material-symbols-outlined text-[20px]">download</span>
                                     </button>
                                  </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
           ) : (
             <div className="py-20 text-center">
                <button onClick={handleFetchGlobalStats} className="px-8 py-3 bg-[#161314] text-white rounded-2xl font-bold hover:bg-[#252122] transition-all">
                   LOAD SYSTEM OVERVIEW
                </button>
             </div>
           )}
        </div>
      ) : activeTab === 'channels' ? (
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
                           onClick={() => handleExport(channel.name)}
                           className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                           title="Export Excel"
                         >
                           <span className="material-symbols-outlined text-[18px]">download</span>
                         </button>
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
                           onClick={() => handleExport(channel.name)}
                           className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                           title="Export Excel"
                         >
                           <span className="material-symbols-outlined text-[18px]">download</span>
                         </button>
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
      ) : (
        <div className="flex flex-col">
          {/* Campaigns Tab Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50/30">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <button 
                     onClick={() => handleCampaignToggleActive(campaign.id, campaign.is_active)}
                     className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                       campaign.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                     }`}
                   >
                     {campaign.is_active ? 'Active' : 'Paused'}
                   </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-[#161314] text-xl group-hover:text-[#c3a2ab] transition-colors">{campaign.name}</h3>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-1">
                      {campaign.product_name || 'No Product Assigned'}
                    </p>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px]">
                    {campaign.description || 'ไม่มีรายละเอียด'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-[#161314]">{campaign._count?.clips || 0}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Clips</span>
                    </div>
                    <div className="flex gap-2">
                       <button
                         onClick={() => handleFetchInsights(campaign.id)}
                         className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                         title="View Detailed Insights"
                       >
                         <span className="material-symbols-outlined text-[20px]">analytics</span>
                       </button>
                       <button
                         onClick={() => {
                           setEditingCampaign(campaign);
                           setCampaignFormData({
                             name: campaign.name,
                             product_name: campaign.product_name || '',
                             description: campaign.description || ''
                           });
                           setIsCampaignModalOpen(true);
                         }}
                         className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                       >
                         <span className="material-symbols-outlined text-[20px]">edit</span>
                       </button>
                       <button
                         onClick={() => handleCampaignDelete(campaign.id)}
                         className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                       >
                         <span className="material-symbols-outlined text-[20px]">delete</span>
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Detailed Insight Overlay */}
      {viewingCampaignStats && (
        <div className="fixed inset-0 z-[60] bg-white overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
             {/* Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-gray-100">
                <div className="space-y-2">
                   <button 
                     onClick={() => setViewingCampaignStats(null)}
                     className="flex items-center gap-2 text-gray-400 hover:text-[#c3a2ab] font-bold text-xs uppercase tracking-widest transition-all mb-4"
                   >
                     <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                     Back to Campaigns
                   </button>
                   <h1 className="text-3xl md:text-4xl font-bold text-[#161314]">{viewingCampaignStats.campaign.name}</h1>
                   <p className="text-gray-400 flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">inventory_2</span>
                     Product: <span className="font-bold text-[#c3a2ab]">{viewingCampaignStats.campaign.product_name || 'N/A'}</span>
                   </p>
                </div>
                <div className="flex gap-3">
                   <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                      <p className="font-bold text-[#161314]">{format(new Date(viewingCampaignStats.campaign.created_at), 'dd MMM yyyy')}</p>
                   </div>
                </div>
             </div>

             {/* Detailed KPI Stats */}
             <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                {[
                  { label: 'Total Clips', value: viewingCampaignStats.summary.total, color: 'text-gray-800', icon: 'movie' },
                  { label: 'Approved', value: viewingCampaignStats.summary.approved, color: 'text-emerald-500', icon: 'verified_user' },
                  { label: 'Pending', value: viewingCampaignStats.summary.pending, color: 'text-orange-400', icon: 'pending' },
                  { label: 'Rejected', value: viewingCampaignStats.summary.rejected, color: 'text-rose-400', icon: 'cancel' },
                  { label: 'Creators', value: viewingCampaignStats.summary.uniqueCreators, color: 'text-blue-500', icon: 'group' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <span className={`material-symbols-outlined ${stat.color} mb-3`}>{stat.icon}</span>
                    <h2 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
             </div>

             {/* Contributors Table */}
             <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                   <h3 className="font-bold text-xl text-[#161314]">Campaign Contributors</h3>
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{viewingCampaignStats.contributors.length} ACTIVE CHANNELS</span>
                </div>
                
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-gray-50/50">
                            <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest">Creator Channel</th>
                            <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">Approved</th>
                            <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">Pending</th>
                            <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">Total Clips</th>
                            <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest text-right">Latest Sub.</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {viewingCampaignStats.contributors.map((contrib, i) => (
                           <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                              <td className="px-8 py-6">
                                 <span className="font-bold text-[#161314] text-lg">{contrib.name}</span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full font-bold text-sm">
                                    {contrib.approved}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full font-bold text-sm">
                                    {contrib.pending}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className="font-bold text-gray-700">{contrib.total}</span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <span className="text-xs text-gray-400 font-medium">{format(new Date(contrib.latest), 'dd MMM HH:mm')}</span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
             
             <div className="mt-12 p-8 bg-gray-50 rounded-[40px] border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 text-sm font-medium italic mb-2">Detailed clip listings for this campaign are available via the main Clips filter.</p>
                <button 
                  onClick={() => {
                    setCampaignFilter(viewingCampaignStats.campaign.id);
                    setActiveTab('clips');
                    setViewingCampaignStats(null);
                  }}
                  className="px-6 py-2 bg-[#c3a2ab] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#b08b96] transition-all"
                >
                  View All Clips for this Campaign
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-[#161314] mb-6">
              {editingCampaign ? 'แก้ไขแคมเปญ' : 'สร้างแคมเปญใหม่'}
            </h2>
            <form onSubmit={handleCampaignSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Campaign Name / ชื่อแคมเปญ</label>
                <input
                  required
                  type="text"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none"
                  value={campaignFormData.name}
                  onChange={(e) => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                  placeholder="เช่น แคมเปญสะสมคลิปเดือนเมษายน"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Product Name / ชื่อสินค้า</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none"
                  value={campaignFormData.product_name}
                  onChange={(e) => setCampaignFormData({ ...campaignFormData, product_name: e.target.value })}
                  placeholder="เช่น Richse Serum"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Description / รายละเอียด</label>
                <textarea
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none min-h-[120px]"
                  value={campaignFormData.description}
                  onChange={(e) => setCampaignFormData({ ...campaignFormData, description: e.target.value })}
                  placeholder="รายละเอียดเงื่อนไขแคมเปญ..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#161314] text-white rounded-2xl font-bold hover:bg-[#252122] transition-all"
                >
                  {editingCampaign ? 'SAVE CHANGES' : 'CREATE CAMPAIGN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(activeTab === 'clips' ? filteredClips : activeTab === 'channels' ? filteredChannels : campaigns).length === 0 && (
        <div className="px-6 py-20 text-center text-gray-400">
          <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
          <p>No records found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
