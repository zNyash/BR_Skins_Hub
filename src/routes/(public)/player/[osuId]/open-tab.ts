import { goto } from "$app/navigation";
import { page } from "$app/state";
import type { TabId } from "$lib/profile-tabs";

/** Switches the profile tab by changing only `?tab=` on the current page, without a history entry. */
export function openTab(tab: TabId) {
	const url = new URL(page.url);
	url.searchParams.set("tab", tab);
	// Same page, only the query changes, so there's no route to resolve().
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	goto(url, { replaceState: true, noScroll: true, keepFocus: true });
}
