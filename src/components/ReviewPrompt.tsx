"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
	open: boolean;
	onClose: () => void;
	onRated: () => void;
	onSnooze: () => void;
};

export function ReviewPrompt({ open, onClose, onRated, onSnooze }: Props) {
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Enjoying Calorie Tracker?</DialogTitle>
					<DialogDescription>Your feedback helps us improve.</DialogDescription>
				</DialogHeader>

				<div className="flex gap-2 justify-end">
					<Button variant="ghost" onClick={onSnooze}>Maybe later</Button>
					<Button variant="secondary" onClick={onClose}>No thanks</Button>
					<Button
						onClick={() => {
							onRated();
							// Example navigation to internal feedback form
							// window.location.href = "/profile";
							// Or open an external rating page
							// window.open("https://example.com/rate", "_blank");
						}}
					>
						Rate now
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
