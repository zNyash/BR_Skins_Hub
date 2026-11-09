// Test-only: a reactive stand-in for `$app/state`'s `page`, and an `openTab` that can either
// navigate (change `?tab=`) or behave like a cancelled navigation (change nothing).
import type { TabId } from "$lib/profile-tabs";

export const fakePage = $state({ url: new URL("http://localhost/player/1?tab=skins") });
export const navigation = $state({ cancelled: false });

export function fakeOpenTab(tab: TabId) {
	if (navigation.cancelled) return;
	const url = new URL(fakePage.url);
	url.searchParams.set("tab", tab);
	fakePage.url = url;
}
