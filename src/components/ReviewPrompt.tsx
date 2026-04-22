"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/provider";

type Props = {
	open: boolean;
	onClose: () => void;
	onRated: () => void;
	onSnooze: () => void;
};

export function ReviewPrompt({ open, onClose, onRated, onSnooze }: Props) {
	const { t } = useLanguage();
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("reviewPrompt.title")}</DialogTitle>
					<DialogDescription>{t("reviewPrompt.description")}</DialogDescription>
				</DialogHeader>

				<div className="flex gap-2 justify-end">
					<Button variant="ghost" onClick={onSnooze}>{t("reviewPrompt.maybeLater")}</Button>
					<Button variant="secondary" onClick={onClose}>{t("reviewPrompt.noThanks")}</Button>
					<Button
						onClick={() => {
							onRated();
							// Example navigation to internal feedback form
							// window.location.href = "/profile";
							// Or open an external rating page
							// window.open("https://example.com/rate", "_blank");
						}}
					>
						{t("reviewPrompt.rateNow")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
