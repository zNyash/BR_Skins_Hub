export type AuthUser = {
	osu_id: number;
	isAdmin: boolean;
	username: string | null;
	player_id: string | null;
	avatar_url: string;
};
