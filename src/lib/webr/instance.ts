import { WebR, ChannelType } from 'webr';

export type WebRStatus = 'uninitialized' | 'loading' | 'installing-packages' | 'loading-data' | 'ready' | 'error';

export interface WebRState {
  webR: WebR | null;
  status: WebRStatus;
  error: string | null;
}

let instance: WebR | null = null;
let initPromise: Promise<WebR> | null = null;

export function getWebR(): WebR | null {
  return instance;
}

export function resetWebR() {
  instance = null;
  initPromise = null;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s. Click "Retry" to try again.`));
    }, ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

export async function initWebR(
  onStatusChange?: (status: WebRStatus) => void
): Promise<WebR> {
  if (instance) return instance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      onStatusChange?.('loading');

      const webR = new WebR({
        channelType: ChannelType.PostMessage,
      });
      await withTimeout(webR.init(), 60_000, 'WebR initialization');

      // Install packages
      onStatusChange?.('installing-packages');
      await withTimeout(
        webR.installPackages(['dplyr', 'readr', 'ggplot2'], { quiet: true }),
        120_000,
        'Package installation'
      );

      // Load data into virtual filesystem
      onStatusChange?.('loading-data');
      const response = await fetch('/data/nfl_schedules.csv');
      const csvData = await response.arrayBuffer();
      await webR.FS.mkdir('/data').catch(() => {}); // ignore if exists
      await webR.FS.writeFile('/data/nfl_schedules.csv', new Uint8Array(csvData));

      instance = webR;
      onStatusChange?.('ready');
      return webR;
    } catch (err) {
      onStatusChange?.('error');
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}
