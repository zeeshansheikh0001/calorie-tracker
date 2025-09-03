export const LS_KEYS = {
	installedAt: 'review_installed_at',
	launches: 'review_launches',
	rated: 'review_done',
	snoozeUntil: 'review_snooze_until',
} as const;

const DAYS = (n: number) => n * 24 * 60 * 60 * 1000;

export type ReviewConfig = {
	minLaunches?: number; // default 5
	minDays?: number; // default 3
	snoozeDays?: number; // default 7
};

function safeGetItem(key: string): string | null {
	try {
		return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
	} catch {
		return null;
	}
}

function safeSetItem(key: string, value: string): void {
	try {
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(key, value);
		}
	} catch {
		// ignore
	}
}

export function markAppLaunch(): void {
	const installedAt = safeGetItem(LS_KEYS.installedAt);
	if (!installedAt) {
		safeSetItem(LS_KEYS.installedAt, String(Date.now()));
	}
	const launches = Number(safeGetItem(LS_KEYS.launches) || 0) + 1;
	safeSetItem(LS_KEYS.launches, String(launches));
}

export function shouldShowReview(config: ReviewConfig = {}): boolean {
	const { minLaunches = 5, minDays = 3 } = config;

	if (safeGetItem(LS_KEYS.rated) === '1') return false;

	const snoozeUntil = Number(safeGetItem(LS_KEYS.snoozeUntil) || 0);
	if (snoozeUntil && Date.now() < snoozeUntil) return false;

	const installedAt = Number(safeGetItem(LS_KEYS.installedAt) || 0);
	const launches = Number(safeGetItem(LS_KEYS.launches) || 0);
	if (!installedAt) return false;

	const enoughDays = Date.now() - installedAt >= DAYS(minDays);
	const enoughLaunches = launches >= minLaunches;
	return enoughDays && enoughLaunches;
}

export function markRated(): void {
	safeSetItem(LS_KEYS.rated, '1');
}

export function snooze(config: ReviewConfig = {}): void {
	const { snoozeDays = 7 } = config;
	safeSetItem(LS_KEYS.snoozeUntil, String(Date.now() + DAYS(snoozeDays)));
}
