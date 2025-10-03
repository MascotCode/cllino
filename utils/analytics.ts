declare const __DEV__: boolean;

export type AnalyticsEvent = {
  route: string;
  elementId: string;
  meta?: Record<string, any>;
};

export const logInteraction = (e: AnalyticsEvent) => {
  if (__DEV__) console.log('[ANALYTICS]', e);
};
