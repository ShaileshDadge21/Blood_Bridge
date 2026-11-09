import { useState } from 'react';
import { AlertCircle, Activity, Droplets} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import DonorMap from './DonorMap';

export default function Dashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [sosActive, setSosActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSOS = async () => {
    // If it's already active, just turn it off locally
    if (sosActive) {
      setSosActive(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('emergency_requests')
        .insert([
          {
            hospital_name: 'KIMS Hospital, VV Puram',
            blood_group: 'O-',
            units_needed: 2,
            urgency_level: 'Critical',
            lat: 12.9546,
            lng: 77.5754
          }
        ]);

      if (error) throw error;
      
      // If successful, activate the pulsing UI
      setSosActive(true);
    } catch (error) {
      console.error("Error sending SOS:", error.message);
      alert("Failed to send alert. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm rounded-b-2xl z-10 relative">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <Droplets className="text-red-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Good morning,</p>
            <h1 className="text-lg font-bold text-slate-900">Alex Morgan</h1>
          </div>
        </div>
        <div className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full text-sm">
          O-
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* SOS Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
          <h2 className="font-bold text-slate-900 text-lg mb-1">Need blood urgently?</h2>
          <p className="text-sm text-slate-500 mb-6">Alert verified donors within your radius.</p>
          
          <button 
            onClick={handleSOS}
            disabled={isSubmitting}
            className={`relative group mx-auto flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 ${
              sosActive ? 'bg-red-700 scale-95' : 'bg-red-600 hover:bg-red-500'
            }${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {/* Pulsing ring effect */}
            {!sosActive && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20"></div>
            )}
            <div className="flex flex-col items-center text-white">
              <AlertCircle className="w-10 h-10 mb-1" />
              <span className="font-bold tracking-wider">{isSubmitting ? "SENDING..." : "SOS"}</span>
            </div>
          </button>
          
          <p className="text-xs text-red-500 mt-6 font-medium">
            {sosActive ? "🚨 EMERGENCY ALERT SENT TO NEARBY DONORS" : "Your location and blood type will be shared."}
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isAvailable ? 'bg-emerald-100' : 'bg-slate-100'}`}>
              <Activity className={isAvailable ? 'text-emerald-600 w-5 h-5' : 'text-slate-400 w-5 h-5'} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Available to Donate</h3>
              <p className="text-xs text-slate-500">Visible to nearby requests</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-14 h-8 rounded-full transition-colors relative ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${isAvailable ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
        
        {/* Interactive Radius Map */}
            <DonorMap />
      </div>
    </div>
  );
}