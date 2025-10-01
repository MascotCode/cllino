import { TInvite } from '@/lib/provider/types';

// Returns remaining time in whole seconds for an invite countdown
export function getTimeRemaining(invite: Pick<TInvite, 'ttlMs' | 'createdAt'>, now: number = Date.now()): number {
  const elapsedMs = Math.max(0, now - invite.createdAt);
  const remainingMs = Math.max(0, invite.ttlMs - elapsedMs);
  return Math.ceil(remainingMs / 1000);
}
