import { beforeNavigate } from "$app/navigation";

/**
 * Asks before throwing away an editor's unsaved draft: on navigation (switching profile tabs goes
 * through `goto`, so it counts too) and when the page is closed or reloaded.
 * Call it while a component initializes.
 */
export function guardUnsaved(isDirty: () => boolean) {
	beforeNavigate((navigation) => {
		// Closing the tab or reloading is handled by `beforeunload` below, with the browser's own dialog.
		if (navigation.type === "leave" || !isDirty()) return;
		if (!confirm("Discard your unsaved changes?")) navigation.cancel();
	});

	$effect(() => {
		if (!isDirty()) return;
		const warn = (event: BeforeUnloadEvent) => event.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	});
}
