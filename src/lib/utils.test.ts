import { describe, expect, it } from "vitest";
import { cn } from "./utils";
import { buttonVariants } from "$lib/components/ui/button/button.svelte";

describe("cn", () => {
	it("cn keeps a type utility next to a text color", () => {
		const out = cn("text-body-strong", "text-accent-color");
		expect(out).toContain("text-body-strong");
		expect(out).toContain("text-accent-color");
	});

	it("cn lets a later type utility win", () => {
		expect(cn("text-body", "text-caption")).toBe("text-caption");
	});

	it("cn lets shadow-none override the custom shadow-float", () => {
		expect(cn("shadow-float", "shadow-none")).toBe("shadow-none");
	});

	it("cn lets a numeric duration override duration-fast", () => {
		expect(cn("duration-fast", "duration-200")).toBe("duration-200");
	});

	it("buttonVariants keeps the type style with the variant color", () => {
		const out = buttonVariants({ variant: "default" });
		expect(out).toContain("text-body-strong");
		expect(out).toContain("text-on-accent");
	});

	it("xs button size has text-xs without text-body-strong", () => {
		const out = buttonVariants({ size: "xs" });
		expect(out).toContain("text-xs");
		expect(out).not.toContain("text-body-strong");
	});
});
