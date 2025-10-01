import { useCallback, useEffect, useState } from 'react';
import {
  acceptInvite,
  completeJob,
  declineInvite,
  getActiveJob,
  getEarnings,
  getProfile,
  getRemainingTTL,
  getTotalEarnings,
  saveProfile,
  subscribeActiveJob,
  subscribeEarnings,
  subscribeInvites,
  toggleOnline,
  updateJobStatus,
} from './mock';
import { TActiveJob, TEarnings, TInvite, TProviderProfile } from './types';

// Provider profile hook
export function useProviderProfile() {
  const [profile, setProfile] = useState<TProviderProfile | null>(getProfile);

  const updateProfile = useCallback((updates: Partial<TProviderProfile>) => {
    const updated = saveProfile(updates);
    setProfile(updated);
    return updated;
  }, []);

  const setOnlineStatus = useCallback((online: boolean) => {
    toggleOnline(online);
    const updated = saveProfile({ isOnline: online });
    setProfile(updated);
  }, []);

  return {
    profile,
    updateProfile,
    setOnlineStatus,
  };
}

// Invites hook
export function useInvites() {
  const [invites, setInvites] = useState<TInvite[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeInvites(setInvites);
    return unsubscribe;
  }, []);

  const accept = useCallback((inviteId: string) => {
    return acceptInvite(inviteId);
  }, []);

  const decline = useCallback((inviteId: string) => {
    declineInvite(inviteId);
  }, []);

  const getTimeRemaining = useCallback((invite: TInvite) => {
    return getRemainingTTL(invite);
  }, []);

  return {
    invites,
    acceptInvite: accept,
    declineInvite: decline,
    getTimeRemaining,
  };
}

// Active job hook
export function useActiveJob() {
  const [job, setJob] = useState<TActiveJob | null>(getActiveJob);

  // Subscribe to active job changes for immediate updates
  useEffect(() => {
    const unsubscribe = subscribeActiveJob(setJob);
    return unsubscribe;
  }, []);

  const updateStatus = useCallback(
    (jobId: string, status: TActiveJob['status']) => {
      const updated = updateJobStatus(jobId, status);
      return updated;
    },
    []
  );

  const complete = useCallback(
    (
      jobId: string,
      completion: {
        cashReceived: boolean;
        rating?: number;
        chips?: string[];
      }
    ) => {
      completeJob(jobId, completion);
    },
    []
  );

  // Refresh job state (useful after accepting an invite)
  const refresh = useCallback(() => {
    setJob(getActiveJob());
  }, []);

  return {
    activeJob: job,
    updateJobStatus: updateStatus,
    completeJob: complete,
    refreshJob: refresh,
  };
}

// Earnings hook
export function useEarnings() {
  const [earnings, setEarnings] = useState<TEarnings[]>(getEarnings);
  const [total, setTotal] = useState<number>(getTotalEarnings);

  const updateFromEntries = useCallback((entries: TEarnings[]) => {
    const paidTotal = entries
      .filter((entry) => entry.cashReceived)
      .reduce((sum, entry) => sum + entry.price, 0);
    setEarnings(entries);
    setTotal(paidTotal);
  }, []);

  const refresh = useCallback(() => {
    updateFromEntries(getEarnings());
  }, [updateFromEntries]);

  useEffect(() => {
    const unsubscribe = subscribeEarnings(updateFromEntries);
    return unsubscribe;
  }, [updateFromEntries]);

  return {
    earnings,
    totalEarnings: total,
    refreshEarnings: refresh,
  };
}

// Combined provider state hook for convenience
export function useProviderState() {
  const profile = useProviderProfile();
  const invites = useInvites();
  const activeJob = useActiveJob();
  const earnings = useEarnings();

  return {
    ...profile,
    ...invites,
    ...activeJob,
    ...earnings,
  };
}
