declare const __DEV__: boolean;

export type Interaction = {
  elementId: string;
  route?: string;
  meta?: Record<string, unknown>;
};

export function logInteraction(event: Interaction): void {
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

  if (isDev) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', event);
  }
}
