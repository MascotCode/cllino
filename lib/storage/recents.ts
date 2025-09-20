import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Place } from '../../types/places';

const KEY = 'route.recents.v1';

export async function getRecents(): Promise<Place[]> {
  try { 
    const raw = await AsyncStorage.getItem(KEY); 
    return raw ? JSON.parse(raw) : []; 
  } catch { 
    return []; 
  }
}

export async function addRecent(p: Place) {
  const all = await getRecents();
  const next = [p, ...all.filter(x => x.id !== p.id)].slice(0, 8);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

