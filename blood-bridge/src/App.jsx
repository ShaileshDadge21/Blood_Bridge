import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { MapPin, User } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import Profile from './components/Profile';

function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' or 'profile'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth onLogin={(session) => setSession(session)} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-xl overflow-hidden">
      
      {/* Active Tab Content */}
      <div className="h-full overflow-y-auto">
        {activeTab === 'radar' ? (
          <Dashboard session={session} />
        ) : (
          <Profile session={session} />
        )}
      </div>

      {/* App-Style Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center p-3 pb-6 z-50 rounded-t-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setActiveTab('radar')}
          className={`flex flex-col items-center transition-colors ${activeTab === 'radar' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <MapPin className={`w-6 h-6 ${activeTab === 'radar' ? 'fill-red-100' : ''}`} />
          <span className="text-[10px] font-bold mt-1 tracking-wide">RADAR</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center transition-colors ${activeTab === 'profile' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-red-100' : ''}`} />
          <span className="text-[10px] font-bold mt-1 tracking-wide">PROFILE</span>
        </button>
      </div>

    </div>
  );
}

export default App;
