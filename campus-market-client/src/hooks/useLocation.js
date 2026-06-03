import { useState } from 'react';

export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detect = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject('Geolocation not supported');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLoading(false);
        setError(err.message);
        reject(err);
      }
    );
  });

  return { detect, loading, error };
}
