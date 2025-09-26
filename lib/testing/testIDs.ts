export const tid = {
  provider: {
    // Home screen
    toggle: 'prov.home.toggle',

    // Invite cards
    inviteCard: (id: string) => `prov.invite.card-${id}`,
    viewInvite: (id: string) => `prov.invite.view-${id}`,

    // Invite detail screen
    accept: 'prov.invite.accept',
    decline: 'prov.invite.decline',
    expired: 'prov.invite.expired',

    // Job screen
    job: {
      startDrive: 'prov.job.startDrive',
      startWork: 'prov.job.startWork',
      complete: 'prov.job.complete',
    },

    // Complete screen
    complete: {
      cash: 'prov.complete.cash',
      finish: 'prov.complete.finish',
    },

    // Onboarding
    onboarding: {
      name: 'prov.onb.name',
      phone: 'prov.onb.phone',
      submit: 'prov.onb.submit',
    },
  },

  // Customer testIDs can be added here later
  customer: {
    // Placeholder for customer flow testIDs
  },
} as const;

// Type helper for autocompletion
export type TestID = typeof tid;


