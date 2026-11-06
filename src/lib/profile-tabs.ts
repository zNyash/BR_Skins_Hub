export type ProfileTab = "skins" | "about" | "setup";

export const DEFAULT_TABS: readonly ProfileTab[] = ["skins", "about", "setup"];

/** Whether each tab has something to show to visitors. */
export type TabContent = Record<ProfileTab, boolean>;

const isTab = (value: string): value is ProfileTab => (DEFAULT_TABS as string[]).includes(value);

/**
 * The full tab order from what's stored. Stored data can be old or partial (a tab added later,
 * a duplicate), so keep the known tabs in their stored order and append whatever is missing.
 */
export function resolveTabs(stored?: readonly string[] | null): ProfileTab[] {
	const order = new Set<ProfileTab>();
	for (const tab of stored ?? []) if (isTab(tab)) order.add(tab);
	for (const tab of DEFAULT_TABS) order.add(tab);
	return [...order];
}

/** The owner sees every tab (to fill in empty ones); visitors only see tabs with content. */
export function visibleTabs(
	order: readonly ProfileTab[],
	content: TabContent,
	isOwner: boolean
): ProfileTab[] {
	return isOwner ? [...order] : order.filter((tab) => content[tab]);
}

export function hasDescription(description?: string | null): boolean {
	return Boolean(description?.trim());
}

/** The tab to open: the requested one when it's visible, otherwise the first visible tab. */
export function pickTab(requested: string | null, visible: readonly ProfileTab[]): ProfileTab {
	return requested !== null && (visible as string[]).includes(requested)
		? (requested as ProfileTab)
		: visible[0];
}
