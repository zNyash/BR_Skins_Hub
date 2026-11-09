import { beforeNavigate } from "$app/navigation";
import { shouldBlock } from "./derive";

type Editor = { isDirty: () => boolean; reset: () => void; save: () => Promise<void> };

const SHAKE_MS = 600;

// Only one editor is mounted at a time; a new one replaces the previous.
let editor = $state.raw<Editor | null>(null);
let saving = $state(false);
let shaking = $state(false);
let shakeTimer: ReturnType<typeof setTimeout> | undefined;

export const unsaved = {
	get dirty() {
		return editor?.isDirty() ?? false;
	},
	get saving() {
		return saving;
	},
	get shaking() {
		return shaking;
	},
	/** Flashes the bar to say "deal with this first"; clears itself after 600ms. */
	shake() {
		clearTimeout(shakeTimer);
		shaking = true;
		shakeTimer = setTimeout(() => (shaking = false), SHAKE_MS);
	},
	reset() {
		editor?.reset();
	},
	async save() {
		if (!editor || saving) return; // a second click while the request is pending does nothing
		saving = true;
		try {
			await editor.save();
		} finally {
			saving = false;
		}
	}
};

/**
 * Registers the mounted editor so the bar can save/reset it and navigation is blocked while it
 * has unsaved changes (or is saving). Switching only the `?tab=` of the same page is allowed.
 * Call it while a component initializes.
 */
export function registerEditor(next: Editor) {
	$effect(() => {
		editor = next;
		return () => {
			if (editor === next) editor = null;
			clearTimeout(shakeTimer);
			shaking = false;
		};
	});

	beforeNavigate((navigation) => {
		const decision = shouldBlock({
			dirty: unsaved.dirty,
			saving,
			type: navigation.type,
			from: navigation.from?.url ?? null,
			to: navigation.to?.url ?? null
		});
		if (decision === "allow") return;
		navigation.cancel();
		if (decision === "block") unsaved.shake();
	});
}
