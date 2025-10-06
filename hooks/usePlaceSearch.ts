import { useEffect, useState } from 'react';
import { addRecent, getRecents } from '../lib/storage/recents';
import type { Place } from '../types/places';

const MOCK: Place[] = [
  { id: 'p1', title: 'Av. 2 Mars', subtitle: 'Casablanca', lat: 33.574, lng: -7.61 },
  { id: 'p2', title: 'PRIMO piatto', subtitle: 'BD MOULAY THAMI, Casablanca', lat: 33.56, lng: -7.60 },
  { id: 'p3', title: 'Caribou Coffee Bachkou', subtitle: 'Rte de Taddart, Casablanca', lat: 33.55, lng: -7.62 },
];

export function usePlaceSearch(query: string) {
  const [results, setResults] = useState<Place[]>([]);
  const [recent, setRecent] = useState<Place[]>([]);

  useEffect(() => { 
    getRecents().then(setRecent).catch(() => setRecent([])); 
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const q = query.trim().toLowerCase();
      if (!q) return setResults([]);
      setResults(MOCK.filter(p => (p.title + ' ' + (p.subtitle ?? '')).toLowerCase().includes(q)));
    }, 200);
    return () => clearTimeout(id);
  }, [query]);

  // expose helper for saving a chosen place
  const saveRecent = async (p: Place) => {
    await addRecent(p);
    setRecent(await getRecents());
  };

  return { results, recent, saveRecent };
}

