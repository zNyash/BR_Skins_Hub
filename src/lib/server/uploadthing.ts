import { createUploadthing } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";
import { verifyToken } from "./auth";
import { isAdminId } from "./admin";

const f = createUploadthing();

export const ourFileRouter = {
	imageUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 10
		}
	})
		.middleware(async ({ req }) => {
			const cookieHeader = req.headers.get("cookie") ?? "";
			const cookies = Object.fromEntries(
				cookieHeader.split(";").map((pair) => {
					const [k, ...v] = pair.trim().split("=");
					return [k.trim(), decodeURIComponent(v.join("="))];
				})
			);

			const payload = await verifyToken(cookies["session"] ?? "");
			if (!payload || !isAdminId(payload.osu_id)) throw new Error("Forbidden");

			return {};
		})

		.onUploadComplete(async ({ file }) => {
			return {
				url: file.ufsUrl
			};
		})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
