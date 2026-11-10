import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check for an active session when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes (like logging in or out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // If no session exists, show the login screen
  if (!session) {
    return <Auth onLogin={(session) => setSession(session)} />;
  }

  // If logged in, show the main application
  return (
    <Dashboard session={session} />
  );
}

export default App;
