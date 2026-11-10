import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, LogOut, User, Phone, Droplet } from 'lucide-react';

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { user } = session;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (data) {
          setFullName(data.full_name || '');
          setBloodGroup(data.blood_group || 'O+');
          setPhone(data.phone || '');
        }
        setLoading(false);
      }
    }
    getProfile();
    return () => { ignore = true; };
  }, [session]);

  async function updateProfile(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { user } = session;

    const updates = {
      id: user.id,
      full_name: fullName,
      blood_group: bloodGroup,
      phone: phone,
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Profile updated successfully!');
    }
    setLoading(false);
  }

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h2>
      
      <form onSubmit={updateProfile} className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-slate-400" /> Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block p-3"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
            <Droplet className="w-4 h-4 text-slate-400" /> Blood Group
          </label>
          <select 
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block p-3"
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-slate-400" /> Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block p-3"
            placeholder="+91 98765 43210"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white bg-slate-900 hover:bg-slate-800 font-bold rounded-xl text-sm px-5 py-3.5 flex justify-center items-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Profile'}
        </button>

        {message && (
          <p className={`text-sm text-center font-medium ${message.includes('success') ? 'text-emerald-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </form>

      <button 
        onClick={() => supabase.auth.signOut()}
        className="mt-8 w-full text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-xl text-sm px-5 py-3.5 flex justify-center items-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>
    </div>
  );
}
