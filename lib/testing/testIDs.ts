export const tid = {
  provider: {
    // Home screen
    toggle: 'prov.home.toggle',

    // Invite cards
    invite: {
      card: (id: string) => `prov.invite.card-${id}`,
      view: (id: string) => `prov.invite.view-${id}`,
      accept: 'prov.invite.accept',
      decline: 'prov.invite.decline',
      expired: 'prov.invite.expired',
      price: (id: string) => `prov.invite.price-${id}`,
      eta: (id: string) => `prov.invite.eta-${id}`,
    },

    // Job screen
    job: {
      startDrive: 'prov.job.startDrive',
      startWork: 'prov.job.startWork',
      complete: 'prov.job.complete',
      steps: {
        assigned: 'prov.job.step-assigned',
        onTheWay: 'prov.job.step-onTheWay',
        working: 'prov.job.step-working',
        completed: 'prov.job.step-completed',
      },
    },

    // Complete screen
    complete: {
      cash: 'prov.complete.cash',
      finish: 'prov.complete.finish',
    },

    // Onboarding
    onboarding: {
      name: 'prov.onb.name',
      nameError: 'prov.onb.name.error',
      phone: 'prov.onb.phone',
      phoneError: 'prov.onb.phone.error',
      submit: 'prov.onb.submit',
    },

    // Profile
    profile: {
      name: 'prov.profile.name',
      phone: 'prov.profile.phone',
      toggle: 'prov.profile.toggle',
      signout: 'prov.profile.signout',
    },

    // Earnings
    earnings: {
      continue: 'prov.earnings.continue',
    },

    // Cash notice
    cashNotice: {
      home: 'prov.home.cashNotice',
      earnings: 'prov.earnings.cashNotice',
      learn: 'cash-notice.learn',
    },

    // Tabs
    tabs: {
      home: 'prov.tabs.home',
      earnings: 'prov.tabs.earnings',
      profile: 'prov.tabs.profile',
    },
  },

  // Customer testIDs can be added here later
  customer: {
    // Placeholder for customer flow testIDs
  },
} as const;

// Type helper for autocompletion
export type TestID = typeof tid;


