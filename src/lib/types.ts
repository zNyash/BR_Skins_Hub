import type { FunctionReturnType } from "convex/server";
import type { api } from "$convex/_generated/api";
import type { Id } from "$convex/_generated/dataModel";

export type AuthUser = {
	osu_id: number;
	isAdmin: boolean;
	username: string | null;
	player_id: Id<"players"> | null;
	avatar_url: string;
};

/** A player with the skins they use (players.get). */
export type PlayerWithSkins = NonNullable<FunctionReturnType<typeof api.players.get>>;

/** A skin with the players using it (skins.listWithPlayers). */
export type SkinWithPlayers = FunctionReturnType<typeof api.skins.listWithPlayers>[number];
