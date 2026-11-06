/**
 * An in-app replacement for the browser's `confirm()`. `askConfirm` opens the dialog rendered once
 * by `<ConfirmDialog />` in the root layout and resolves to true (confirmed) or false (cancelled,
 * Escape, or a click outside).
 */
export type ConfirmOptions = {
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
};

type Pending = ConfirmOptions & { resolve: (confirmed: boolean) => void };

export const confirmState = $state<{ pending: Pending | null }>({ pending: null });

export function askConfirm(options: ConfirmOptions): Promise<boolean> {
	// A newer question replaces one still open; the old one counts as cancelled.
	confirmState.pending?.resolve(false);
	return new Promise((resolve) => {
		confirmState.pending = { ...options, resolve };
	});
}

/** Answers the open question and closes the dialog. */
export function answerConfirm(confirmed: boolean) {
	const pending = confirmState.pending;
	confirmState.pending = null;
	pending?.resolve(confirmed);
}
