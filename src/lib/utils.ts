import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { createTV } from "tailwind-variants";

/** Teaches tailwind-merge our `text-*` type utilities (layout.css) are font sizes, not colors. */
export const twMergeConfig = {
	extend: {
		classGroups: {
			"font-size": [
				{
					text: [
						"page-title",
						"section-title",
						"card-title",
						"body",
						"body-strong",
						"label",
						"caption",
						"value-lg"
					]
				}
			]
		}
	}
};

const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** `tv` that merges with the same config as `cn`. Use this in ui components. */
export const tv = createTV({ twMergeConfig });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/** "Nov 4, 2026" in the viewer's locale. */
export function formatDate(ms: number) {
	return new Date(ms).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric"
	});
}
