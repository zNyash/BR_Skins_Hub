import { beforeNavigate, goto } from "$app/navigation";
import { askConfirm } from "$lib/confirm.svelte";

type Editor = { isDirty: () => boolean; discard: () => void };

// Every mounted editor with a guard. One prompt covers all of them, so two dirty editors
// don't ask twice, and "Discard" throws away every draft at once.
// A plain Set on purpose: nothing renders from it, so it doesn't need to be reactive.
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const editors = new Set<Editor>();
let asking = false;
let bypass = false;

/**
 * Asks (with our own dialog) before throwing away an editor's unsaved draft when navigating,
 * which includes switching profile tabs, since that goes through `goto`. Closing or reloading
 * the page can only use the browser's own dialog, via `beforeunload`.
 * `discard` throws the draft away when the user confirms. Call it while a component initializes.
 */
export function guardUnsaved(isDirty: () => boolean, discard: () => void) {
	const editor: Editor = { isDirty, discard };

	$effect(() => {
		editors.add(editor);
		return () => editors.delete(editor);
	});

	beforeNavigate((navigation) => {
		if (bypass || navigation.type === "leave" || !navigation.to) return;
		const dirty = [...editors].filter((e) => e.isDirty());
		if (dirty.length === 0) return;

		// The dialog is async, so stop this navigation now and redo it if the user confirms.
		navigation.cancel();
		if (asking) return; // another editor's guard already opened the dialog for this navigation
		asking = true;

		const target = navigation.to.url;
		// Same page with a new `?tab=` is a tab switch: redo it the way tabs navigate.
		const tabSwitch = navigation.from?.url.pathname === target.pathname;

		askConfirm({
			title: "Discard your unsaved changes?",
			description: "What you typed hasn't been saved yet.",
			confirmLabel: "Discard",
			cancelLabel: "Keep editing",
			destructive: true
		}).then(async (confirmed) => {
			asking = false;
			if (!confirmed) return;
			dirty.forEach((e) => e.discard());
			bypass = true;
			try {
				const options = tabSwitch ? { replaceState: true, noScroll: true, keepFocus: true } : {};
				// The target comes from SvelteKit's own navigation, so there's nothing to resolve().
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				await goto(target, options);
			} finally {
				bypass = false;
			}
		});
	});

	$effect(() => {
		if (!isDirty()) return;
		const warn = (event: BeforeUnloadEvent) => event.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	});
}
