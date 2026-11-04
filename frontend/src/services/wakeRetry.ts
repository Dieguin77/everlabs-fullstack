/**
 * Retry helper for backends on free hosting plans that "sleep" after inactivity.
 *
 * Waking up can take about a minute, during which requests hang or fail with a network
 * error / 502 / 503 / 504. Instead of showing an error right away, we keep trying with
 * exponential backoff until `totalBudgetMs` is spent, and tell the caller (once) that the
 * server seems to be waking up so the UI can explain the wait.
 */

export const DEFAULT_GIVE_UP_MESSAGE =
  'Não foi possível conectar ao servidor depois de cerca de 90 segundos. ' +
  'O backend gratuito pode estar fora do ar no momento. ' +
  'Aguarde alguns minutos e tente novamente; se o problema continuar, avise o desenvolvedor.';

export class ServerUnavailableError extends Error {
  constructor(message: string = DEFAULT_GIVE_UP_MESSAGE) {
    super(message);
    this.name = 'ServerUnavailableError';
  }
}

export interface WakeRetryOptions {
  /** Total time allowed across all attempts. Default: 90 s. */
  totalBudgetMs?: number;
  /** Maximum duration of one attempt. Default: 30 s. */
  attemptTimeoutMs?: number;
  /** First wait between attempts; doubles each time. Default: 2 s. */
  initialDelayMs?: number;
  /** Upper bound for the wait between attempts. Default: 10 s. */
  maxDelayMs?: number;
  /** Calls `onWaking` if the first attempt is still pending after this long. Default: 4 s. */
  noticeAfterMs?: number;
  /** Called at most once, when the server looks like it is waking up. */
  onWaking?: () => void;
  /** Decides whether a failure is worth retrying (network error, 502/503/504...). */
  isRetryable?: (error: unknown) => boolean;
  giveUpMessage?: string;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function retryWhileWakingUp<T>(
  attempt: (timeoutMs: number) => Promise<T>,
  options: WakeRetryOptions = {},
): Promise<T> {
  const {
    totalBudgetMs = 90_000,
    attemptTimeoutMs = 30_000,
    initialDelayMs = 2_000,
    maxDelayMs = 10_000,
    noticeAfterMs = 4_000,
    onWaking,
    isRetryable = () => true,
    giveUpMessage = DEFAULT_GIVE_UP_MESSAGE,
    sleep = defaultSleep,
    now = Date.now,
  } = options;

  const startedAt = now();
  let delay = initialDelayMs;
  let noticed = false;

  const notice = () => {
    if (!noticed) {
      noticed = true;
      onWaking?.();
    }
  };

  const noticeTimer = setTimeout(notice, noticeAfterMs);

  try {
    for (;;) {
      const remaining = totalBudgetMs - (now() - startedAt);

      try {
        return await attempt(Math.min(attemptTimeoutMs, Math.max(remaining, 1_000)));
      } catch (error) {
        if (!isRetryable(error)) throw error;

        notice();

        const left = totalBudgetMs - (now() - startedAt);
        if (left <= delay) throw new ServerUnavailableError(giveUpMessage);

        await sleep(delay);
        delay = Math.min(delay * 2, maxDelayMs);
      }
    }
  } finally {
    clearTimeout(noticeTimer);
  }
}
