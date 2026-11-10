import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AlertTriangle, MapPin, Clock, Droplets, CheckCircle, Filter } from 'lucide-react';

export default function LiveFeed() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('ALL');

  const bloodGroups = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      const { data, error } = await supabase
        .from('emergency_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching emergency requests:', error.message);
      } else {
        setRequests(data || []);
      }
      setLoading(false);
    }

    fetchRequests();

    const subscription = supabase
      .channel('public:emergency_requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_requests' }, payload => {
        setRequests((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Filter requests based on selected blood group
  const filteredRequests = selectedGroup === 'ALL' 
    ? requests 
    : requests.filter(req => req.blood_group === selectedGroup);

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Live Feed</h2>
          <p className="text-xs text-slate-500">Active emergency blood requests</p>
        </div>
        <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          LIVE
        </div>
      </div>

      {/* Blood Group Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-0.5" />
        {bloodGroups.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedGroup === group
                ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading active emergencies...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900">No matching emergencies</h3>
          <p className="text-xs text-slate-500 mt-1">No active requests found for {selectedGroup}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id || req.created_at} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-red-50 text-red-700 font-extrabold text-sm px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />
                    {req.blood_group}
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-lg">
                    {req.units_needed} Unit(s)
                  </span>
                </div>
                <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {req.urgency_level}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1">{req.hospital_name}</h3>
              
              <div className="space-y-1.5 mb-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Lat: {req.lat.toFixed(4)}, Lng: {req.lng.toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <a 
                href={`geo:${req.lat},${req.lng}?q=${req.lat},${req.lng}(${encodeURIComponent(req.hospital_name)})`}
                onClick={(e) => {
                  if (!navigator.userAgent.match(/Android|iPhone|iPad|iPod/i)) {
                    e.preventDefault();
                    window.open(`https://www.google.com/maps/search/?api=1&query=${req.lat},${req.lng}`, '_blank');
                  }
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs py-2.5 flex justify-center items-center gap-2 transition-colors"
              >
                Navigate to Location
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
