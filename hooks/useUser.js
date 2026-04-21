import { useEffect, useState } from 'react';

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          setUser(json.user);
        }
      } catch (e) {
        // ignore
      } finally { setLoading(false); }
    })();
  }, []);

  return { user, loading, setUser };
}
