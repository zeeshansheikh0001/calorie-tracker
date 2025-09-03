import { useEffect, useState } from 'react';
import { markAppLaunch, shouldShowReview, markRated, snooze, type ReviewConfig } from '@/lib/in-app-review-web';

export function useInAppReviewWeb(config: ReviewConfig = {}) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		markAppLaunch();
		const t = setTimeout(() => setOpen(shouldShowReview(config)), 500);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onRated = () => {
		markRated();
		setOpen(false);
	};

	const onSnooze = () => {
		snooze(config);
		setOpen(false);
	};

	return { open, setOpen, onRated, onSnooze };
}
