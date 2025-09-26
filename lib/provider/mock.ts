import { TActiveJob, TEarnings, TInvite, TProviderProfile } from './types';

// In-memory storage
let profile: TProviderProfile | null = null;
let invites: TInvite[] = [];
let activeJob: TActiveJob | null = null;
let earnings: TEarnings[] = [];
let isOnline = false;

// Invite subscription system
type InviteCallback = (invites: TInvite[]) => void;
let inviteCallbacks: InviteCallback[] = [];
let inviteInterval: ReturnType<typeof setTimeout> | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;

// Active job subscription system
type ActiveJobCallback = (job: TActiveJob | null) => void;
let activeJobCallbacks: ActiveJobCallback[] = [];

const mockCustomers = [
  {
    name: 'Ahmed Ben Ali',
    approxAddress: 'Hay Riad, Rabat',
    exactAddress: 'Apartment 12, Building C, Hay Riad, Rabat',
    rating: 4.8,
  },
  {
    name: 'Fatima El Fassi',
    approxAddress: 'Agdal, Rabat',
    exactAddress: 'Villa 45, Avenue Mohamed V, Agdal, Rabat',
    rating: 4.5,
  },
  {
    name: 'Youssef Benani',
    approxAddress: 'Hassan II, Casablanca',
    exactAddress: 'Floor 3, Office 8, Hassan II Boulevard, Casablanca',
    rating: 4.9,
  },
  {
    name: 'Aicha Alami',
    approxAddress: 'Gueliz, Marrakech',
    exactAddress: 'Riad Zitoun, Gueliz Quarter, Marrakech',
    rating: 4.3,
  },
];

// Profile management
export function getProfile(): TProviderProfile | null {
  return profile;
}

export function saveProfile(p: Partial<TProviderProfile>): TProviderProfile {
  const newProfile: TProviderProfile = {
    id: profile?.id || `prov_${Date.now()}`,
    name: p.name || profile?.name || '',
    phone: p.phone || profile?.phone || '',
    isOnline: p.isOnline ?? profile?.isOnline ?? false,
  };
  profile = newProfile;
  isOnline = newProfile.isOnline;
  return newProfile;
}

// Online/offline toggle
export function toggleOnline(online: boolean): void {
  isOnline = online;
  if (profile) {
    profile.isOnline = online;
  }

  if (online) {
    startInviteGeneration();
  } else {
    stopInviteGeneration();
    clearInvites();
  }
}

// Invite subscription
export function subscribeInvites(callback: InviteCallback): () => void {
  inviteCallbacks.push(callback);

  // Start generating invites if online
  if (isOnline && !inviteInterval) {
    startInviteGeneration();
  }

  // Return unsubscribe function
  return () => {
    inviteCallbacks = inviteCallbacks.filter((cb) => cb !== callback);
    if (inviteCallbacks.length === 0) {
      stopInviteGeneration();
    }
  };
}

function startInviteGeneration(): void {
  if (inviteInterval || activeJob) return; // Don't generate if already have active job

  // Generate invites every 60-90 seconds
  const generateInterval = () => Math.floor(Math.random() * 3000) + 6000; // 60-90s

  const scheduleNext = () => {
    inviteInterval = setTimeout(() => {
      if (isOnline && !activeJob && invites.length < 3) {
        generateRandomInvite();
      }
      scheduleNext();
    }, generateInterval());
  };

  scheduleNext();

  // Start countdown ticker
  if (!countdownInterval) {
    countdownInterval = setInterval(() => {
      tickInviteCountdowns();
    }, 1000);
  }
}

function stopInviteGeneration(): void {
  if (inviteInterval) {
    clearTimeout(inviteInterval);
    inviteInterval = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function generateRandomInvite(): void {
  const customer =
    mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
  const ttlMs = Math.floor(Math.random() * 30000) + 60000; // 60-90s TTL
  const price = Math.floor(Math.random() * 200) + 50; // 50-250 MAD
  const etaMinutes = Math.floor(Math.random() * 20) + 5; // 5-25 minutes

  const invite: TInvite = {
    id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customerName: customer.name,
    approxAddress: customer.approxAddress,
    etaMinutes,
    price,
    rating: customer.rating,
    ttlMs,
    createdAt: Date.now(),
  };

  invites.push(invite);
  notifyInviteCallbacks();
}

function tickInviteCountdowns(): void {
  const now = Date.now();
  let changed = false;

  // Remove expired invites (calculate remaining time without modifying original ttlMs)
  const beforeCount = invites.length;
  invites = invites.filter((invite) => {
    const elapsed = now - invite.createdAt;
    const remaining = Math.max(0, invite.ttlMs - elapsed);
    return remaining > 0;
  });

  if (invites.length < beforeCount) {
    changed = true;
  }

  if (changed || invites.length > 0) {
    notifyInviteCallbacks();
  }
}

function notifyInviteCallbacks(): void {
  inviteCallbacks.forEach((callback) => callback([...invites]));
}

function notifyActiveJobCallbacks(): void {
  activeJobCallbacks.forEach((callback) => callback(activeJob));
}

// Active job subscription
export function subscribeActiveJob(callback: ActiveJobCallback): () => void {
  activeJobCallbacks.push(callback);

  // Return unsubscribe function
  return () => {
    activeJobCallbacks = activeJobCallbacks.filter((cb) => cb !== callback);
  };
}

function clearInvites(): void {
  invites = [];
  notifyInviteCallbacks();
}

// Invite actions
export function acceptInvite(inviteId: string): TActiveJob | null {
  // Check capacity - only allow if no active job
  if (activeJob) {
    return null;
  }

  const invite = invites.find((inv) => inv.id === inviteId);
  if (!invite || invite.ttlMs <= 0) {
    return null;
  }

  // Find exact address for this customer
  const customer = mockCustomers.find((c) => c.name === invite.customerName);
  const exactAddress = customer?.exactAddress || invite.approxAddress;

  // Create active job
  const job: TActiveJob = {
    id: invite.jobId,
    customerName: invite.customerName,
    exactAddress,
    price: invite.price,
    status: 'assigned',
    startedAt: Date.now(),
  };

  activeJob = job;

  // Remove all invites
  invites = [];
  stopInviteGeneration(); // Stop generating new invites
  notifyInviteCallbacks();
  notifyActiveJobCallbacks(); // Notify active job subscribers

  return job;
}

export function declineInvite(inviteId: string): void {
  invites = invites.filter((inv) => inv.id !== inviteId);
  notifyInviteCallbacks();
}

// Job management
export function getActiveJob(): TActiveJob | null {
  return activeJob;
}

export function updateJobStatus(
  jobId: string,
  status: TActiveJob['status']
): TActiveJob | null {
  if (!activeJob || activeJob.id !== jobId) {
    return null;
  }

  activeJob = { ...activeJob, status };
  notifyActiveJobCallbacks(); // Notify active job subscribers
  return activeJob;
}

export function completeJob(
  jobId: string,
  completion: {
    cashReceived: boolean;
    rating?: number;
    chips?: string[];
  }
): void {
  if (!activeJob || activeJob.id !== jobId) {
    return;
  }

  // Add to earnings
  const earning: TEarnings = {
    id: `earn_${Date.now()}`,
    jobId: activeJob.id,
    customerName: activeJob.customerName,
    price: activeJob.price,
    rating: completion.rating,
    chips: completion.chips || [],
    completedAt: Date.now(),
    cashReceived: completion.cashReceived,
  };

  earnings.push(earning);

  // Clear active job
  activeJob = null;
  notifyActiveJobCallbacks(); // Notify active job subscribers

  // Resume invite generation if still online
  if (isOnline && inviteCallbacks.length > 0) {
    startInviteGeneration();
  }
}

// Earnings
export function getEarnings(): TEarnings[] {
  return [...earnings].sort((a, b) => b.completedAt - a.completedAt);
}

export function getTotalEarnings(): number {
  return earnings
    .filter((e) => e.cashReceived)
    .reduce((sum, e) => sum + e.price, 0);
}

// Utility functions
export function getRemainingTTL(invite: TInvite): number {
  const elapsed = Date.now() - invite.createdAt;
  const remainingMs = Math.max(0, invite.ttlMs - elapsed);
  return Math.floor(remainingMs / 1000);
}
