import { useEffect } from 'react';
import { useRouter } from 'next/router';

const TabSwitchHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Simulate session check (replace with an actual API call or logic)
        const isAuthenticated = !!localStorage.getItem('auth_token'); // Example check
        if (!isAuthenticated) {
          router.push('/login');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  return null;
};

export default TabSwitchHandler;
