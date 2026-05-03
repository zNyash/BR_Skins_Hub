## User

Seeing the way I'm using the `convex.mutation` that means, the convex client, I'm not using the vue wrapper for convex in this case and just pure convex right?

## Assistant

<thinking>
The user is asking about how they're using the convex client in their project - specifically whether they're using the Vue wrapper for Convex or just the pure Convex client. Let me look at the project to understand how they're using it.
</thinking>

Let me look at how you're using the convex client in your project.

**Tool Call: List the `BR_Skins_Hub` directory's contents**
Status: Completed

# Folders:
BR_Skins_Hub/.nuxt
BR_Skins_Hub/.vscode
BR_Skins_Hub/app
BR_Skins_Hub/convex
BR_Skins_Hub/docs
BR_Skins_Hub/node_modules
BR_Skins_Hub/plugins
BR_Skins_Hub/public
BR_Skins_Hub/server

# Files:
BR_Skins_Hub/.gitattributes
BR_Skins_Hub/.gitignore
BR_Skins_Hub/.prettierrc
BR_Skins_Hub/Organization-Cheatsheet.md
BR_Skins_Hub/README.md
BR_Skins_Hub/agents.md
BR_Skins_Hub/bun.lock
BR_Skins_Hub/example.env
BR_Skins_Hub/nuxt.config.ts
BR_Skins_Hub/package.json
BR_Skins_Hub/tsconfig.json


**Tool Call: Search files for regex `convex`**
Status: Completed

Found 1 matches:

## Matches in BR_Skins_Hub/package.json

### dependencies › convex › L3-13
```
  "dependencies": {
    "@clerk/themes": "^2.4.55",
    "@nuxt/ui": "^4.4.0",
    "@pinia/nuxt": "0.11.3",
    "@tailwindcss/vite": "^4.1.18",
    "@types/node": "^25.6.0",
    "@uploadthing/nuxt": "^7.1.10",
    "@vueuse/core": "^14.1.0",
    "@vueuse/router": "^14.2.1",
    "convex": "^1.31.6",
    "convex-nuxt": "0.1.5",
```

11 lines remaining in ancestor node. Read the file to see all.


**Tool Call: Search files for regex `convex`**
Status: Completed

No matches found

**Tool Call: Search files for regex `convex",|convex-vue|convex-nuxt|useConvexMutation|useConvexQuery|convex\.mutation|convex\.query",`**
Status: Completed

No matches found

**Tool Call: List the `BR_Skins_Hub/plugins` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/plugins/force-dark.client.ts
BR_Skins_Hub/plugins/ssr-width.ts


**Tool Call: Search files for regex `convex",`**
Status: Completed

No matches found

**Tool Call: Search files for regex `convex`**
Status: Completed

No matches found

**Tool Call: Search files for regex `convex`**
Status: Completed

Showing matches 1-20 (there were more matches found; use offset: 20 to see next page):

## Matches in BR_Skins_Hub/app/components/MainPlayerCard.vue

### <script lang="ts" setup> › L23-32
```
import type { Doc } from "~~/convex/_generated/dataModel";

// ------ Local Types & Defaults ------
type Player = Doc<"players">;

// ------ Props & Emits ------
const props = defineProps<{
  player: Player;
}>();
</script>
```

## Matches in BR_Skins_Hub/app/components/PlayerCard.vue

### <script lang="ts" setup> › L58-68
```
import { TOOLTIP } from "~/types/constants";
import { ICONS } from "~/types/icons";
import type { Doc } from "~~/convex/_generated/dataModel";

// ------ Props & Emits ------
const props = defineProps<{
  player: Doc<"players">;
}>();

// ------ External Composables ------
const toast = useAppToast();
```

63 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/PlayerSkinSelector.vue

### <script lang="ts" setup> › L73-83
```
import Fuse from "fuse.js";
import { ICONS } from "~/types/icons";
import type { Id, Doc } from "~~/convex/_generated/dataModel";

// ------ Local Types & Defaults ------
type Skin = Doc<"skins">;

// ------ Props & Emits ------
const modelValue = defineModel<Id<"skins">[]>({ default: () => [] });
const { skins } = defineProps<{
  skins: Skin[];
```

49 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/SkinCard.vue

### <script setup lang="ts"> › L100-110
```
import type { ContextMenuItem } from "@nuxt/ui";
import { formatTimeAgo } from "@vueuse/core";
import { ICONS } from "~/types/icons";
import type { Doc } from "~~/convex/_generated/dataModel";

// ------ Local Types & Defaults ------
type Skin = Doc<"skins">;

// ------ Props & Emits ------
const props = defineProps<{
  skin?: Skin;
```

108 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/PlayerEditor.vue

### <script lang="ts" setup> › L39-51
```
import { api } from "~~/convex/_generated/api";
import { ICONS } from "~/types/icons";

// ------ External Composables ------
const store = useDashboardStore();
const toast = useAppToast();
const { syncPlayer, isLoading: isSyncing } = usePlayerSync();

const { data: allSkins, isPending: isLoadingSkins } = useConvexQuery(api.skins.listSkins);
const { data: playerSkins } = useConvexQuery(
  api.playerSkins.getSkinsByPlayer,
  computed(() => ({ player_id: store.selectedPlayer!._id })),
);
```

24 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/PlayerList.vue

### <script lang="ts" setup> › L33-47
```
import { useSorted } from "@vueuse/core";
import { api } from "~~/convex/_generated/api";
import type { Doc } from "~~/convex/_generated/dataModel";
import { ICONS } from "~/types/icons";

// ------ Props & Emits ------
const emit = defineEmits<{
  (e: "request-select", player: Doc<"players">): void;
}>();

// ------ External Composables ------
const store = useDashboardStore();
const { data: playersList, isPending: isLoading } = useConvexQuery(api.players.listPlayers);

// ------ Local State ------
```

21 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/PlayerSkinSelector.vue

### <script lang="ts" setup> › L84-94
```
import Fuse from "fuse.js";
import type { Doc, Id } from "~~/convex/_generated/dataModel";
import { ICONS } from "~/types/icons";

// ------ Local Types ------
type Skin = Doc<"skins">;

// ------ Props & Emits ------
const modelValue = defineModel<Id<"skins">[]>({ default: () => [] });
const { skins } = defineProps<{ skins: Skin[] }>();

```

35 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/SkinEditor.vue

### <script lang="ts" setup> › L20-30
```
import type { Doc } from "~~/convex/_generated/dataModel";

// ------ Local Types & Defaults ------
type Skin = Doc<"skins">;

// ------ Props & Emits ------
const { skin } = defineProps<{ skin: Skin }>();
defineExpose({
  submitSave,
  get isLoading() {
    return isLoading.value;
```

51 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/SkinList.vue

### <script lang="ts" setup> › L42-52
```
import { useSorted } from "@vueuse/core";
import { api } from "~~/convex/_generated/api";
import { ICONS } from "~/types/icons";

// ------ External Composables ------
const store = useDashboardStore();
const { data: skinsList, isPending: isLoading } = useConvexQuery(api.skins.listSkins);

// ------ Local State ------
const searchQuery = ref("");

```

10 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/SkinQuickEditModal.vue

### <script lang="ts" setup> › L29-39
```
import type { Doc } from "~~/convex/_generated/dataModel";

// ------ Local Types & Defaults ------
type Skin = Doc<"skins">;

// ------ Props & Emits ------
const { skin } = defineProps<{ skin: Skin }>();
const isOpen = defineModel<boolean>("open", { required: true });

// ------ External Composables ------
const toast = useAppToast();
```

54 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/SkinSelectorItem.vue

### <script lang="ts" setup> › L46-56
```
import type { Doc } from "~~/convex/_generated/dataModel";
import { ICONS } from "~/types/icons";

// ------ Props & Emits ------
const { skin, selected } = defineProps<{
  skin: Doc<"skins">;
  selected: boolean;
}>();
const emit = defineEmits<{
  (e: "toggle"): void;
  (e: "edit"): void;
```

2 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/modals/EditPlayer.vue

### <script lang="ts" setup> › L44-54
```
import { api } from "~~/convex/_generated/api";
import type { Doc, Id } from "~~/convex/_generated/dataModel";

// ------ Local Types & Defaults ------
const getDefaults = () => ({
  name: "",
  skinIds: [] as Id<"skins">[],
});

// ------ Props & Emits ------
const props = defineProps<{
```

141 lines remaining in ancestor node. Read the file to see all.

### <script lang="ts" setup> › L63-71
```
const { state: formState, reset: resetForm } = useResettableRef(getDefaults);

const { data: allSkins } = useConvexQuery(api.skins.listSkins, {});
const { data: playerSkinsRel, isPending: isLoadingPlayerSkins } = useConvexQuery(
  api.playerSkins.getSkinsByPlayer,
  {
    player_id: props.player._id,
  },
);
```

## Matches in BR_Skins_Hub/app/components/modals/EditSkin.vue

### <script lang="ts" setup> › L20-30
```
import type { Doc } from "~~/convex/_generated/dataModel";

// ------ Local Types & Defaults ------
type Skin = Doc<"skins">;

// ------ Props & Emits ------
const props = defineProps<{
  skin: Skin;
}>();
const isOpen = defineModel<boolean>("open", { required: true });

```

66 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/composables/usePlayerSync.ts

### L1-11
```
import type { UsersDetailsResponse } from "osu-api-extended/dist/types/v2/users_details";
import type { Doc } from "~~/convex/_generated/dataModel";

type PlayerFetchResult = {
  data: UsersDetailsResponse | null;
  error: string;
};
type SyncPlayerResult = {
  successMessage: string;
  errorMessage: string;
};
```

67 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/pages/dashboard/index.vue

### <script lang="ts" setup> › L163-173
```
import type { Doc } from "~~/convex/_generated/dataModel";
import { ICONS } from "~/types/icons";

// ------ Local Types & Defaults ------
type CreatePanelRef = {
  submitCreate: () => Promise<void>;
  isLoading: boolean;
};
type SkinEditorRef = {
  submitSave: () => Promise<void>;
  isLoading: boolean;
```

106 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/pages/index.vue

### <script lang="ts" setup> › L91-101
```
import { useIntersectionObserver } from "@vueuse/core";
import { ICONS } from "~/types/icons";
import { api } from "~~/convex/_generated/api";

// ------ Local Types & Defaults ------
type SortField = "name" | "_creationTime";
type SortDir = "asc" | "desc";

// ------ External Composables ------
const { data: playersList, isPending: isLoadingPlayers } = useConvexQuery(api.players.listPlayers);

```

58 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/pages/player/[playerId].vue

### <script lang="ts" setup> › L121-131
```
import { api } from "~~/convex/_generated/api";
import { useRouteParams } from "@vueuse/router";
import { ICONS } from "~/types/icons";
import Fuse from "fuse.js";
import type { AvatarProps, BadgeProps } from "@nuxt/ui";

// ------ Local Types & Defaults ------
type TabItem = {
  label?: string;
  icon?: string;
  avatar?: AvatarProps;
```

58 lines remaining in ancestor node. Read the file to see all.

### <script lang="ts" setup> › L145-147
```
const { data: player, isPending: isPlayerPending } = useConvexQuery(api.players.getPlayerByOsuId, {
  osu_id: playerId.value,
});
```

### <script lang="ts" setup> › L148-150
```
const { data: skins, isPending: isSkinsPending } = useConvexQuery(api.playerSkins.getSkinsByOsuId, {
  osu_id: playerId.value,
});
```


## Assistant

<thinking>
Now let me look for where `convex.mutation` is being used specifically.
</thinking>

Now let me find specifically where `convex.mutation` is being used (the raw client pattern):

**Tool Call: Search files for regex `convex\.mutation|convex\.query|useConvex\b`**
Status: Completed

No matches found

**Tool Call: Search files for regex `useConvexMutation|useConvexQuery`**
Status: Completed

Found 8 matches:

## Matches in BR_Skins_Hub/app/components/dashboard/PlayerEditor.vue

### <script lang="ts" setup> › L39-51
```
import { api } from "~~/convex/_generated/api";
import { ICONS } from "~/types/icons";

// ------ External Composables ------
const store = useDashboardStore();
const toast = useAppToast();
const { syncPlayer, isLoading: isSyncing } = usePlayerSync();

const { data: allSkins, isPending: isLoadingSkins } = useConvexQuery(api.skins.listSkins);
const { data: playerSkins } = useConvexQuery(
  api.playerSkins.getSkinsByPlayer,
  computed(() => ({ player_id: store.selectedPlayer!._id })),
);
```

24 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/PlayerList.vue

### <script lang="ts" setup> › L43-47
```
// ------ External Composables ------
const store = useDashboardStore();
const { data: playersList, isPending: isLoading } = useConvexQuery(api.players.listPlayers);

// ------ Local State ------
```

## Matches in BR_Skins_Hub/app/components/dashboard/SkinList.vue

### <script lang="ts" setup> › L42-52
```
import { useSorted } from "@vueuse/core";
import { api } from "~~/convex/_generated/api";
import { ICONS } from "~/types/icons";

// ------ External Composables ------
const store = useDashboardStore();
const { data: skinsList, isPending: isLoading } = useConvexQuery(api.skins.listSkins);

// ------ Local State ------
const searchQuery = ref("");

```

10 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/modals/EditPlayer.vue

### <script lang="ts" setup> › L63-71
```
const { state: formState, reset: resetForm } = useResettableRef(getDefaults);

const { data: allSkins } = useConvexQuery(api.skins.listSkins, {});
const { data: playerSkinsRel, isPending: isLoadingPlayerSkins } = useConvexQuery(
  api.playerSkins.getSkinsByPlayer,
  {
    player_id: props.player._id,
  },
);
```

## Matches in BR_Skins_Hub/app/pages/index.vue

### <script lang="ts" setup> › L91-101
```
import { useIntersectionObserver } from "@vueuse/core";
import { ICONS } from "~/types/icons";
import { api } from "~~/convex/_generated/api";

// ------ Local Types & Defaults ------
type SortField = "name" | "_creationTime";
type SortDir = "asc" | "desc";

// ------ External Composables ------
const { data: playersList, isPending: isLoadingPlayers } = useConvexQuery(api.players.listPlayers);

```

58 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/pages/player/[playerId].vue

### <script lang="ts" setup> › L145-147
```
const { data: player, isPending: isPlayerPending } = useConvexQuery(api.players.getPlayerByOsuId, {
  osu_id: playerId.value,
});
```

### <script lang="ts" setup> › L148-150
```
const { data: skins, isPending: isSkinsPending } = useConvexQuery(api.playerSkins.getSkinsByOsuId, {
  osu_id: playerId.value,
});
```

## Matches in BR_Skins_Hub/app/pages/skins.vue

### <script lang="ts" setup> › L92-94
```
const { data: skinsList, isPending: isLoadingSkins } = useConvexQuery(
  api.skins.listSkinsWithPlayers,
);
```


## Assistant

<thinking>
Now let me find where `convex.mutation` is used. The user said "the way I'm using `convex.mutation`" which implies it exists somewhere in their project. Let me search more broadly.
</thinking>

**Tool Call: Search files for regex `\.mutation\(|\.query\(`**
Status: Completed

No matches found

**Tool Call: Search files for regex `convex`**
Status: Completed

Found 1 matches:

## Matches in BR_Skins_Hub/app/composables/usePlayerSync.ts

### L1-11
```
import type { UsersDetailsResponse } from "osu-api-extended/dist/types/v2/users_details";
import type { Doc } from "~~/convex/_generated/dataModel";

type PlayerFetchResult = {
  data: UsersDetailsResponse | null;
  error: string;
};
type SyncPlayerResult = {
  successMessage: string;
  errorMessage: string;
};
```

67 lines remaining in ancestor node. Read the file to see all.


**Tool Call: Read file `app/composables/usePlayerSync.ts`**
Status: Completed

```json
{
  "Text": "import type { UsersDetailsResponse } from \"osu-api-extended/dist/types/v2/users_details\";\nimport type { Doc } from \"~~/convex/_generated/dataModel\";\n\ntype PlayerFetchResult = {\n  data: UsersDetailsResponse | null;\n  error: string;\n};\ntype SyncPlayerResult = {\n  successMessage: string;\n  errorMessage: string;\n};\n\nexport const usePlayerSync = () => {\n  const isLoading = ref(false);\n\n  async function fetchPlayerInfo(osuId: number): Promise<PlayerFetchResult> {\n    try {\n      isLoading.value = true;\n      const response = await $fetch<UsersDetailsResponse>(`/api/player/refresh`, {\n        method: \"GET\",\n        params: { osu_id: osuId },\n      });\n\n      if (!response) {\n        return { data: null, error: \"No data returned from API\" };\n      }\n\n      return { data: response, error: \"\" };\n    } catch (err) {\n      return { data: null, error: (err as Error).message };\n    } finally {\n      isLoading.value = false;\n    }\n  }\n\n  async function syncPlayer(player: Doc<\"players\">): Promise<SyncPlayerResult> {\n    try {\n      isLoading.value = true;\n      const { data: latestData, error } = await fetchPlayerInfo(player.osu_id);\n\n      if (error || !latestData) {\n        console.error(error);\n        return { successMessage: \"\", errorMessage: error };\n      }\n\n      const hasNameChanged = latestData.username !== player.name;\n      const hasCoverChanged = latestData.cover?.url !== player.cover_url;\n      const hasPreviousUsernamesChanged =\n        JSON.stringify(player.previous_usernames) !== JSON.stringify(latestData.previous_usernames);\n\n      if (hasNameChanged || hasCoverChanged || hasPreviousUsernamesChanged) {\n        await $fetch(`/api/players/${player._id}`, {\n          method: \"PATCH\",\n          body: {\n            name: latestData.username,\n            cover_url: latestData.cover?.url,\n            previous_usernames: latestData.previous_usernames,\n          },\n        });\n\n        return { successMessage: \"Player info updated successfully!\", errorMessage: \"\" };\n      }\n\n      return { successMessage: \"No changes detected!\", errorMessage: \"\" };\n    } catch (err) {\n      return { successMessage: \"\", errorMessage: (err as Error).message };\n    } finally {\n      isLoading.value = false;\n    }\n  }\n\n  return {\n    isLoading,\n    fetchPlayerInfo,\n    syncPlayer,\n  };\n};\n"
}
```

**Tool Call: Search files for regex `convex`**
Status: Completed

Found 20 matches:

## Matches in BR_Skins_Hub/server/api/auth/callback.ts

### L1-11
```
import { api } from "~~/convex/_generated/api";
import type { OsuTokenResponse } from "~~/server/types/osu-token";
import type { OsuUser } from "~~/server/types/me";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event);

  if (typeof code !== "string") {
    throw createError({ statusCode: 400, message: "Authorization code is missing" });
  }

```

35 lines remaining in ancestor node. Read the file to see all.

### L37-41
```

  // Upsert the user in the database and create a session token
  await convex.mutation(api.auth.upsertUser, { osu_id: me.id, username: me.username });

  const token = await createToken(me.id);
```

## Matches in BR_Skins_Hub/server/api/auth/me.ts

### L1-13
```
import { api } from "~~/convex/_generated/api";

export default defineEventHandler(async (event) => {
  const user = await getUser(event);

  if (!user) {
    return { osu_id: -1, isAdmin: false, username: null, avatar_url: null };
  }

  const authUser = await convex.query(api.auth.getAuthUser, { osu_id: user.osu_id });

  return {
    osu_id: user.osu_id,
```

6 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/server/api/player-skins/[playerId].put.ts

### L1-11
```
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const playerIdParam = getRouterParam(event, "playerId");
  if (!playerIdParam) {
    throw createError({ statusCode: 400, message: "Missing player id." });
  }

```

15 lines remaining in ancestor node. Read the file to see all.

### L19-23
```
  const playerId = playerIdParam as Id<"players">;

  return await convex.mutation(api.playerSkins.updatePlayerSkins, {
    player_id: playerId,
    skin_ids: skinIds as Id<"skins">[],
```

## Matches in BR_Skins_Hub/server/api/players/[id]/index.delete.ts

### L1-10
```
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id") as Id<"players">;

  return await convex.mutation(api.players.deletePlayer, { player_id: id });
});
```

1 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/server/api/players/[id]/index.patch.ts

### L1-11
```
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const idParam = getRouterParam(event, "id");
  if (!idParam) {
    throw createError({ statusCode: 400, message: "Missing player id." });
  }

```

28 lines remaining in ancestor node. Read the file to see all.

### L30-34
```
  const id = idParam as Id<"players">;

  return await convex.mutation(api.players.updatePlayer, {
    id,
    name: body.name,
```

## Matches in BR_Skins_Hub/server/api/players/[id]/profile.patch.ts

### L1-16
```
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";
import { isAdminId } from "~~/server/utils/requireAdmin";
import { getUser } from "~~/server/utils/getUser";

export default defineEventHandler(async (event) => {
  const user = await getUser(event);

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const id = getRouterParam(event, "id") as Id<"players">;
  const body = await readBody(event);
  const authUser = await convex.query(api.auth.getAuthUser, { osu_id: user.osu_id });
  const requesterOwnsProfile = authUser?.player_id === id;
```

14 lines remaining in ancestor node. Read the file to see all.

### L21-25
```
  }

  return await convex.mutation(api.players.updatePlayerProfile, {
    id,
    requester_osu_id: user.osu_id,
```

## Matches in BR_Skins_Hub/server/api/players/[id]/views.post.ts

### L1-19
```
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";
import { createRateLimiter } from "~~/server/utils/rateLimit";

const viewsRateLimiter = createRateLimiter({
  key: "players-views",
  maxRequests: 20,
  windowMs: 60_000,
});

export default defineEventHandler(async (event) => {
  viewsRateLimiter.check(event);

  const id = getRouterParam(event, "id") as Id<"players">;

  return await convex.mutation(api.players.incrementPlayerViews, {
    id,
  });
});
```

1 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/server/api/players/index.post.ts

### L1-11
```
import { api } from "~~/convex/_generated/api";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = (await readBody(event)) as Record<string, unknown>;

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, message: "Invalid player name." });
  }

```

24 lines remaining in ancestor node. Read the file to see all.

### L26-30
```
  }

  return await convex.mutation(api.players.createPlayer, {
    name: body.name,
    osu_id: body.osu_id,
```

## Matches in BR_Skins_Hub/server/api/skins/[id]/download.post.ts

### L1-15
```
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

// Public endpoint — no auth required. Only increments download count.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") as Id<"skins">;

  const skin = await convex.query(api.skins.getSkin, { id });

  if (!skin) {
    throw createError({ statusCode: 404, message: "Skin not found" });
  }

  await convex.mutation(api.skins.updateSkin, {
    _id: id,
```

4 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/server/api/skins/[id]/index.delete.ts

### L1-10
```
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id") as Id<"skins">;

  return await convex.mutation(api.skins.deleteSkin, { _id: id });
});
```

1 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/server/api/skins/[id]/index.patch.ts

### L1-11
```
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const idParam = getRouterParam(event, "id");
  if (!idParam) {
    throw createError({ statusCode: 400, message: "Missing skin id." });
  }

```

43 lines remaining in ancestor node. Read the file to see all.

### L43-47
```
  const id = idParam as Id<"skins">;

  return await convex.mutation(api.skins.updateSkin, {
    _id: id,
    name: body.name,
```

## Matches in BR_Skins_Hub/server/api/skins/index.post.ts

### L1-11
```
import { api } from "~~/convex/_generated/api";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = (await readBody(event)) as Record<string, unknown>;

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, message: "Invalid skin name." });
  }

```

24 lines remaining in ancestor node. Read the file to see all.

### L26-30
```
  }

  return await convex.mutation(api.skins.createSkin, {
    name: body.name,
    author: body.author,
```

## Matches in BR_Skins_Hub/server/utils/convex.ts

### L1-4
```
import { ConvexHttpClient } from "convex/browser";

export const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

```


## Assistant

<thinking>
Now I have a clear picture. Let me summarize:

1. In the **server** (Nitro API routes), they're using `convex.mutation()` and `convex.query()` via a plain `ConvexHttpClient` from `convex/browser`. This is instantiated in `server/utils/convex.ts`. This is indeed the **pure Convex client** — not any Vue/Nuxt wrapper.

2. In the **client-side** (Vue components and pages), they're using `useConvexQuery` which comes from `convex-nuxt` (the Nuxt wrapper for Convex).
   
So the architecture is clear: the server leverages the raw Convex HTTP client for mutations and queries, while the frontend relies on the Nuxt-specific composables for the same operations.
</thinking>

Yes, that's exactly right. Let me show you the full picture of what's happening in your project.

In `server/utils/convex.ts`, you're instantiating a plain `ConvexHttpClient` directly from `convex/browser`:

```BR_Skins_Hub/server/utils/convex.ts#L1-4
import { ConvexHttpClient } from "convex/browser";

export const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
```

That `convex` instance is then used all throughout your **Nitro server routes** like `convex.mutation(...)` and `convex.query(...)` — this is the **pure Convex client**, making straightforward one-shot HTTP calls with no reactivity.

On the other hand, in your **Vue components and pages**, you're using `useConvexQuery` (e.g. in `PlayerList.vue`, `SkinList.vue`, `index.vue`, etc.) — that's the `convex-nuxt` wrapper, which gives you the reactive `data` / `isPending` pattern.

So to summarize the split:

| Layer | Package | Usage |
|---|---|---|
| **Server** (Nitro API routes) | `convex/browser` → `ConvexHttpClient` | `convex.mutation(...)` / `convex.query(...)` — pure, imperative, one-shot |
| **Client** (Vue components) | `convex-nuxt` | `useConvexQuery(...)` — reactive, live-updating |

The reason you use the raw client on the server side makes perfect sense: Nitro handlers are not Vue components, so there's no reactivity system to hook into — you just want to fire off a request and get a result back.

## User

yes thats true. i want the reactivity on the query thing (the frontend). whenever i need to query and display data i need it to be reactive and live updates. unless this is a performance bottoneck beacuse i dont know if it fucks up with the caching on convex, i think it doesnt so it may be fine.

i want to use convex on my svelte project which would have a similar approach of everything that has to do with creating, deleting or updating should be handled on the backend (sveltekit for that) and everything that envolves just reading should be on the frontend itself, like we are doing right now. and making it reactive would be great of course. i can also build my own wrapper if necessary.

## Assistant

<thinking>
The user wants to use Convex in a SvelteKit project with a similar architecture to their Nuxt project:
- Frontend: reactive queries (like `useConvexQuery` in Vue)
- Backend (SvelteKit server): mutations/queries via pure ConvexHttpClient

They want to know how to set this up in SvelteKit, and whether they need to build their own wrapper or if there's already something available.

Let me think about this:

1. **Backend (SvelteKit server actions/API routes)**: Same as Nuxt - use `ConvexHttpClient` from `convex/browser` for mutations and queries in server-side code.


2. **Frontend (reactive queries)**: For Svelte, I should check what's available - there's `ConvexClient` from `convex/browser` that supports real-time subscriptions through `onUpdate` callbacks, and there might be a `convex-svelte` package on npm that provides a more integrated experience, though I'm not entirely certain about its official status.

Since Convex has official React bindings but the Svelte ecosystem is less clear, building a custom wrapper makes sense. With Svelte 5's runes system, I could create a reactive composable using `$state` and `$effect` that wraps the `ConvexClient` to handle subscriptions and state management.

Building the wrapper... is slightly different. Let me think...

`ConvexClient` from `convex/browser`:
- `client.query(queryFn, args)` - one-shot query
- `client.mutation(mutationFn, args)` - mutation
- `client.subscribe(queryFn, args, callback)` - reactive subscription, returns an unsubscribe function
- Actually it might be `client.watchQuery` or similar

Wait, let me think more carefully. The Convex browser client has:
- `ConvexHttpClient` - for one-shot HTTP calls (`.query()`, `.mutation()`, `.action()`)
- `ConvexClient` - for real-time subscriptions

The `ConvexClient` (real-time one) has:
- `.subscribe(query, args, { onUpdate, onError })` or similar

Actually I think the API might be different. Let me reconsider what I know from the Convex documentation. The real-time client likely uses `watchQuery` or a similar subscription mechanism, though I'm not entirely certain of the exact method names. I'm thinking about how `convex-nuxt` would use the underlying `ConvexClient` with subscriptions under the hood, and I'm trying to recall the vanilla JavaScript client API for setting up reactive updates. I'm uncertain about the exact Convex API for subscriptions, but I think the pattern involves either `subscribe()` or `watchQuery()` on the client. For a Svelte 5 wrapper, I'd create a singleton `ConvexClient` utility and then build a `useConvexQuery` composable using Svelte 5 runes to handle reactive subscriptions, similar to how I'd approach it with the `ConvexHttpClient` on the backend.

Setting up the Convex client utility... I'm second-guessing the Convex API here—I need to verify whether `ConvexClient` actually exposes a `subscribe` method or if it uses a different approach like `watchQuery` for real-time updates. Let me think through what I know about the Convex JavaScript client and how subscriptions actually work in their library. I need to clarify the actual ConvexClient API - it uses a subscription pattern with onUpdate and onError callbacks rather than the simpler approach I mentioned earlier, and you unsubscribe by calling the returned function. I'm realizing I should be upfront with the user about the uncertainty here rather than guessing at the exact API. I'll explain the conceptual architecture of how Convex subscriptions work and suggest they check the official documentation for the precise implementation details. I'm also wondering if Convex has released official Svelte bindings, though I'm not confident enough to claim that definitively.

The best path forward is to acknowledge the uncertainty about an official Svelte package, then walk through how to build a clean wrapper using Svelte 5's reactivity features alongside the ConvexClient. I should also address the SvelteKit-specific challenge around SSR—during server-side rendering, you'd need to handle the lack of WebSocket differently, either by using the HTTP client for initial data or deferring subscriptions until the client loads.

For the implementation, I'm setting up the ConvexClient initialization...

Setting up the client wrapper... I'm going to provide the best answer I can with what I know about Convex's architecture, making sure to flag where the user should verify the exact API details since I'm not entirely certain of the current implementation.

Looking at the workspace, I see they only have the Nuxt project, so they're asking about building something new with SvelteKit. I should focus on explaining the core architecture: using `ConvexClient` for reactive subscriptions on the frontend, wrapping it with Svelte 5's `$state` and `$effect`, and using `ConvexHttpClient` on the SvelteKit server for mutations. I'll also address their caching concern—Convex handles deduplication of subscriptions automatically—and mention checking if there's a community `convex-svelte` package that might already solve this.

Now I'm recalling the exact API for `ConvexClient` subscriptions. The client exposes a `subscribe` method that takes a query function, arguments, and callbacks for updates and errors, returning an unsubscribe function to clean up the connection. I'm settling on showing the ConvexClient subscription pattern and addressing their specific concerns about caching and Svelte integration. My approach will be to confirm their architecture works, explain that Convex handles subscription deduplication natively, note there's no official Svelte package but it's straightforward to build one with Svelte 5 runes, then walk through the file structure and a practical example.
</thinking>

Let me quickly check if there's already a `convex-svelte` or similar community package worth knowing about before I give you my full take on this.

**Tool Call: Fetch https://www.npmjs.com/search?q\=convex\+svelte**
Status: Completed

skip to:contentpackage searchsign innpm×SearchSign UpSign In 

# Search results

## 1000+ packages found

Sort by: Default
- Default
- Most downloaded this week
- Most downloaded this month
- Most dependents
- Recently published

### @mmailaender/convex-svelte

> **Community Fork**: This is a community-maintained fork of the official [`convex-svelte`](https://github.com/get-convex/convex-svelte) package, published as `@mmailaender/convex-svelte`. It includes additional features like paginated queries and other cmmailaender• 0.18.0 • a month ago •  0 dependents •  Apache-2.0published version 0.18.0, a month ago0 dependents licensed under $Apache-2.05,062

### convex-svelte

[Convex](https://www.convex.dev/) is the typesafe backend-as-a-service with realtime updates, server functions, crons and scheduled jobs, file storage, vector search, and more.ballingt• 0.0.12 • 6 months ago •  0 dependents •  Apache-2.0published version 0.0.12, 6 months ago0 dependents licensed under $Apache-2.079,302

### convex

Client for the Convex Cloud
- convex
- database
- react
- state
- serverless

nicolapps• 1.37.0 • 20 hours ago •  278 dependents •  Apache-2.0published version 1.37.0, 20 hours ago278 dependents licensed under $Apache-2.02,381,315

### @convex-dev/better-auth

A Better Auth component for Convex.
- convex
- component
- auth
- authentication
- better-auth
- convex-auth

erquhart• 0.12.1 • 3 days ago •  10 dependents •  Apache-2.0published version 0.12.1, 3 days ago10 dependents licensed under $Apache-2.0266,671

### @convex-dev/r2

A R2 component for Convex.
- convex
- component

erquhart• 0.10.1 • 8 days ago •  2 dependents •  Apache-2.0published version 0.10.1, 8 days ago2 dependents licensed under $Apache-2.084,305

### @mmailaender/convex-better-auth-svelte

A lightweight **Svelte/SvelteKit** adapter for [`get-convex/better-auth`](https://github.com/get-convex/better-auth).   It makes authentication **idiomatic**, **type-safe**, and **SSR-ready** in your Convex app.
- svelte

mmailaender• 0.7.3 • 22 days ago •  0 dependents •  MITpublished version 0.7.3, 22 days ago0 dependents licensed under $MIT8,781

### convex-test

A JS mock of the Convex backend for testing your Convex functions.
- test
- jest
- vitest
- convex

reece-convex• 0.0.51 • 20 hours ago •  1 dependents •  Apache-2.0published version 0.0.51, 20 hours ago1 dependents licensed under $Apache-2.0572,250

### @convex-dev/auth

Authentication for Convex
- authentication
- authorization
- auth
- login
- sign
- convex

erquhart• 0.0.92 • 2 days ago •  8 dependents •  Apache-2.0published version 0.0.92, 2 days ago8 dependents licensed under $Apache-2.0360,908

### @turf/convex

Creates a convex hull around points
- turf
- gis

GitHub Actions• 7.3.5 • 12 days ago •  32 dependents •  MITpublished version 7.3.5, 12 days ago32 dependents licensed under $MIT5,563,700

### @convex-dev/migrations

A migrations component for Convex. Define, run, and track your database migrations. Run from a CLI or Convex server function.
- convex
- component

ianatconvex• 0.3.4 • 7 days ago •  4 dependents •  Apache-2.0published version 0.3.4, 7 days ago4 dependents licensed under $Apache-2.0269,333

### @convex-dev/action-retrier

Convex component for retrying idempotent actions.
- convex
- retry
- idempotency

ianatconvex• 0.3.0 • 6 months ago •  5 dependents •  Apache-2.0published version 0.3.0, 6 months ago5 dependents licensed under $Apache-2.0163,034

### svelte

Cybernetically enhanced web apps
- svelte
- UI
- framework
- templates
- templating

GitHub Actions• 5.55.5 • 8 days ago •  2029 dependents •  MITpublished version 5.55.5, 8 days ago2029 dependents licensed under $MIT18,122,100

### @convex-dev/agent

A agent component for Convex.
- convex
- ai
- agent
- component

ianatconvex• 0.6.1 • a month ago •  4 dependents •  Apache-2.0published version 0.6.1, a month ago4 dependents licensed under $Apache-2.0215,384

### @convex-dev/resend

A resend component for Convex.
- convex
- component

ianatconvex• 0.2.3 • 4 months ago •  3 dependents •  Apache-2.0published version 0.2.3, 4 months ago3 dependents licensed under $Apache-2.0158,207

### @stickerdaniel/convex-autumn-svelte

Svelte 5 wrapper for Convex Autumn billing - reactive, type-safe, SSR-ready
- svelte
- svelte5
- sveltekit
- convex
- autumn
- billing
- stripe
- payments
- subscription
- saas

stickerdaniel• 0.1.3 • 5 months ago •  0 dependents •  MITpublished version 0.1.3, 5 months ago0 dependents licensed under $MIT2,822

### monotone-chain-convex-hull

Monotone Chain Convex Hull algorithm
- convex
- hull

cheminfo-bot• 1.1.0 • 4 years ago •  5 dependents •  MITpublished version 1.1.0, 4 years ago5 dependents licensed under $MIT171,119

### @convex-dev/workpool

A Convex component for managing async work.
- convex
- queue
- pool
- component
- async
- work

ianatconvex• 0.4.6 • a month ago •  10 dependents •  Apache-2.0published version 0.4.6, a month ago10 dependents licensed under $Apache-2.0515,489

### incremental-convex-hull

Incremental n-dimensional convex hull algorithm
- incremental
- n-dimensional
- convex
- hull
- algorithm

mikolalysenko• 1.0.1 • 12 years ago •  6 dependents •  MITpublished version 1.0.1, 12 years ago6 dependents licensed under $MIT218,460

### @convex-dev/workflow

Convex component for durably executing workflows.
- convex
- workflow
- durable-execution

ianatconvex• 0.3.12 • 4 days ago •  2 dependents •  Apache-2.0published version 0.3.12, 4 days ago2 dependents licensed under $Apache-2.0290,118

### @convex-dev/eslint-plugin

ESLint plugin for Convex to prevent common issues and enforce best practices for files in the `convex/` directory.nicolapps• 2.0.0 • 22 days ago •  3 dependents •  Apache-2.0published version 2.0.0, 22 days ago3 dependents licensed under $Apache-2.0473,689 

## Footer

### Support

- Help
- Advisories
- Status
- Contact npm

### Company

- About
- Blog
- Press

### Terms & Policies

- Policies
- Terms of Use
- Code of Conduct
- Privacy

**Tool Call: Fetch https://docs.convex.dev/client/javascript**
Status: Completed

Skip to main contentDocsCopy as MarkdownCopied!On this page

# Convex JavaScript Clients

Convex applications can be accessed from Node.js or any JavaScript runtime that implements `fetch` or `WebSocket`. The reactive Convex Client allows web applications and long-running Node.js servers to subscribe to updates on Convex queries, while the Convex HTTP clientis typically used for server-side rendering, migrations, administrative scripts, and serverless functions to run queries at a single point in time.

If you're using React, see the dedicated `ConvexReactClient` described in React.

## Convex Client​

The `ConvexClient` provides subscriptions to queries in Node.js and any JavaScript environment that supports WebSockets.script.ts

```
import { ConvexClient } from "convex/browser";import { api } from "../convex/_generated/api";const client = new ConvexClient(process.env.CONVEX_URL!);// subscribe to query resultsclient.onUpdate(api.messages.listAll, {}, (messages) =>  console.log(messages.map((msg) => msg.body)),);// execute a mutationfunction hello() {  client.mutation(api.messages.sendAnon, {    body: `hello at ${new Date()}`,  });}
```

The Convex client is open source and available on GitHub.

See the Script Tag Quickstart to get started.

## HTTP client​

The `ConvexHttpClient` works in the browser, Node.js, and any JavaScript environment with `fetch`.

See the Node.js Quickstart.script.ts

```
import { ConvexHttpClient } from "convex/browser";import { api } from "./convex/_generated/api";const client = new ConvexHttpClient(process.env["CONVEX_URL"]);// either thisconst count = await client.query(api.counter.get);// or thisclient.query(api.counter.get).then((count) => console.log(count));
```

## Using Convex without generated `convex/_generated/api.js`​

If the source code for your Convex function isn't located in the same project or in the same monorepos you can use the untyped `api` object called `anyApi`.script.ts

```
import { ConvexClient } from "convex/browser";import { anyApi } from "convex/server";const CONVEX_URL = "http://happy-otter-123";const client = new ConvexClient(CONVEX_URL);client.onUpdate(anyApi.messages.list, {}, (messages) =>  console.log(messages.map((msg) => msg.body)),);setInterval(  () =>    client.mutation(anyApi.messages.send, {      body: `hello at ${new Date()}`,      author: "me",    }),  5000,);
```

- Convex Client
- HTTP client
- Using Convex without generated `convex/_generated/api.js`

## Assistant

<thinking>
Now I have a clear picture of the Convex client API:

1. `ConvexClient` from `convex/browser` - real-time subscriptions via `client.onUpdate(query, args, callback)` 
2. `ConvexHttpClient` from `convex/browser` - one-shot HTTP queries/mutations

And there IS an official `convex-svelte` package (by `ballingt` who is a Convex team member - "ballingt" is Tom Ballinger who works at Convex). It's at version 0.0.12 and has 79,302 downloads. There's also a community fork `@mmailaender/convex-svelte` at 0.18.0 with more features.
 
For a Svelte 5 wrapper, the pattern would be straightforward: initialize a singleton `ConvexClient`, then leverage `$effect` to set up subscriptions via `client.onUpdate`, making sure to clean up with the returned unsubscribe function when the effect runs again or the component unmounts. I should check how the existing `convex-svelte` package handles this to see if there's a better approach.
</thinking>

**Tool Call: Fetch https://github.com/get\-convex/convex\-svelte**
Status: Completed

Skip to content                                                                         

## Navigation Menu

      Toggle navigation                                                                                                                Sign in                                         Appearance settings                                                                                                                         Search or jump to...                                                      

# Search code, repositories, users, issues, pull requests...

                                                           Search                                                                                                                                             Clear                                                                        

                                                                                  Search syntax tips                                                              

#         Provide feedback       

                                                                   

We read every piece of feedback, and take your input very seriously.                              Include my email address so I can be contacted                          Cancel              Submit feedback                          

#         Saved searches       

        

## Use saved searches to filter your results more quickly

                                                                                                          Name                                                                                    Query                                

            To see all available qualifiers, see our documentation.                                                                       Cancel              Create saved search                                                Sign in                                                         Sign up                                               Appearance settings                      Resetting focus                                                 You signed in with another tab or window. Reload to refresh your session.        You signed out in another tab or window. Reload to refresh your session.        You switched accounts on another tab or window. Reload to refresh your session.          Dismiss alert                                                                                                                                          get-convex        /    **      convex-svelte    **    Public                              
               -                     Notifications    You must be signed in to change notification settings  
  -                   Fork     21  
  -                                   Star          90  

                                                                          

# get-convex/convex-svelte

 mainBranchesTagsGo to fileCodeOpen more actions menu

## Folders and files

| Name | Name | Last commit message | Last commit date |
| --- | --- | --- | --- |
| 

## Latest commit

 

## History

61 Commits61 Commits |
| .github/workflows | .github/workflows |   |   |
| e2e | e2e |   |   |
| src | src |   |   |
| static | static |   |   |
| .eslintignore | .eslintignore |   |   |
| .eslintrc.cjs | .eslintrc.cjs |   |   |
| .gitignore | .gitignore |   |   |
| .npmrc | .npmrc |   |   |
| .nvmrc | .nvmrc |   |   |
| .prettierignore | .prettierignore |   |   |
| .prettierrc | .prettierrc |   |   |
| .stackblitzrc | .stackblitzrc |   |   |
| LICENSE | LICENSE |   |   |
| README.md | README.md |   |   |
| convex.json | convex.json |   |   |
| package-lock.json | package-lock.json |   |   |
| package.json | package.json |   |   |
| playwright.config.ts | playwright.config.ts |   |   |
| svelte.config.js | svelte.config.js |   |   |
| tsconfig.json | tsconfig.json |   |   |
| vite.config.ts | vite.config.ts |   |   |
| View all files |

## Repository files navigation

Convex is the typesafe backend-as-a-service with realtime updates, server functions, crons and scheduled jobs, file storage, vector search, and more.

Quickstart

# convex-svelte

Receive live updates to Convex query subscriptions and call mutations and actions from Svelte with `convex-svelte`.

To install:

```
npm install convex convex-svelte

```

Run `npx convex init` to get started with Convex.

See the example app live.

`convex-svelte` provides a `setupConvex()` function which takes a Convex deployment URL, a `useConvexClient()` which returns a ConvexClientused to set authentication credentials and run Convex mutations and actions, and a `useQuery()` function for subscribing to Convex queries.

### Example

Call `setupConvex()` in a component above the components that need to Convex queries and use `useQuery()` components where you need to listen to the query.

See +layout.svelte for `setupConvex()`

```
<script>
	import { PUBLIC_CONVEX_URL } from '$env/static/public';

	setupConvex(PUBLIC_CONVEX_URL);
</script>
```

and Chat.svelte for how to use `useQuery()`

```
<script>
	const query = useQuery(api.messages.list, () => ({ muteWords }), {
		useResultFromPreviousArguments: true
	});
</script>

...
{#if query.isLoading}
	Loading...
{:else if query.error != null}
	failed to load: {query.error.toString()}
{:else}
	<ul>
		{#each query.data as message}
			<li>
				<span>{message.author}</span>
				<span>{message.body}</span>
			</li>
		{/each}
	</ul>
{/if}
```

Running a mutation looks like

```
<script lang="ts">
	import { api } from '../../convex/_generated/api.js'; // depending on file location
	import { useConvexClient } from 'convex-svelte';
	const client = useConvexClient();

	let toSend = $state('');
	let author = $state('me');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const data = Object.fromEntries(new FormData(event.target as HTMLFormElement).entries());
		client.mutation(api.messages.send, {
			author: data.author as string,
			body: data.body as string
		});
	}
</script>

<form onsubmit={handleSubmit}>
	<input type="text" name="author" bind:value={author} />
	<input type="text" name="body" bind:value={toSend} />
	<button type="submit" disabled={!toSend}>Send</button>
</form>
```

### Conditionally skipping queries

You can conditionally skip a query by returning the string `'skip'` from the arguments function. This is useful when a query depends on some condition, like authentication state or user input.

```
<script lang="ts">
import { useQuery } from "convex-svelte";
import { api } from "../convex/_generated/api.js";

let auth = $state({ isAuthenticated: true });

const activeUserResponse = useQuery(
  api.users.queries.getActiveUser,
  () => (auth.isAuthenticated ? {} : 'skip')
);
</script>

{#if activeUserResponse.isLoading}
  Loading user...
{:else if activeUserResponse.error}
  Error: {activeUserResponse.error}
{:else if activeUserResponse.data}
  Welcome, {activeUserResponse.data.name}!
{/if}
```

When a query is skipped, `isLoading` will be `false`, `error` will be `null`, and `data` will be `undefined`.

### Server-side rendering

`useQuery()` accepts an `initialData` option in its third argument. By defining a `load()` function in a +page.server.ts file that uses the `ConvexHttpClient` to request the same query to get initial data and passing that through to the `initialData` option of a useQuery call you can avoid an initial loading state.

```
// +page.server.ts
import { ConvexHttpClient } from 'convex/browser';
import type { PageServerLoad } from './$types.js';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { api } from '../convex/_generated/api.js';

export const load = (async () => {
	const client = new ConvexHttpClient(PUBLIC_CONVEX_URL!);
	return {
		messages: await client.query(api.messages.list, { muteWords: [] })
	};
}) satisfies PageServerLoad;
```

```
<script lang="ts">
	// +page.svelte
	import type { PageData } from './$types.js';
	let { data }: { data: PageData } = $props();

	import { useQuery, useConvexClient } from '$lib/client.svelte.js';
	import { api } from '../convex/_generated/api.js';

	const messages = useQuery(
		api.messages.list,
		() => args,
		() => ({ initialData: data.messages })
	);
</script>
```

Combining specifying `initialData` and either setting the `keepPreviousData` option to true or never modifying the arguments passed to a query should be enough to avoid ever seeing a loading state for a `useQuery()`.

### Troubleshooting

#### effect_in_teardown Error

If you encounter `effect_in_teardown` errors when using `useQuery` in components that can be conditionally rendered (like dialogs, modals, or popups), this is caused by wrapping `useQuery` in a `$derived` block that depends on reactive state.

When `useQuery` is wrapped in `$derived`, state changes during component cleanup can trigger re-evaluation of the `$derived`, which attempts to create a new `useQuery` instance. Since `useQuery` internally creates a `$effect`, and effects cannot be created during cleanup, this throws an error.

Use Conditionally skipping queries instead. By calling `useQuery` unconditionally at the top level and passing a function that returns `'skip'`, the function is evaluated inside `useQuery`'s own effect tracking, preventing query recreation during cleanup.

### Deploying a Svelte App

In production build pipelines use the build command

```
npx convex deploy --cmd-url-env-var-name PUBLIC_CONVEX_URL --cmd 'npm run build'
```

to build your Svelte app and deploy Convex functions.

# Trying out this library

Clone this repo and install dependencies with `npm install` then start a development server:

```
npm run dev
```

This will run you through creating a Convex account and a deployment.

Everything inside `src/lib` is part of the library, everything inside `src/routes` is an example app.

# Developing this library

To build the library:

```
npm run package
```

To create a production version of the showcase app:

```
npm run build
```

You can preview the production build with `npm run preview`.

To deploy your app, you may need to install an adapter for your target environment.

## Publishing

Go into the `package.json` and give your package the desired name through the `"name"` option. Also consider adding a `"license"` field and point it to a `LICENSE` file which you can create from a template (one popular option is the MIT license).

To publish your library to npm:

```
npm publish
```
              

## About

                                    convex-svelte.vercel.app                  

### Resources

                              Readme           

### License

                     Apache-2.0 license                                       

###         Uh oh!

      

        

There was an error while loading. Please reload this page.

                          Activity                          Custom properties        

### Stars

                      **90**        stars        

### Watchers

                      **6**        watching        

### Forks

                      **21**        forks                        Report repository                                     

##   Releases

    No releases published                                                    

##   Packages       0

                                                                                                                 

###         Uh oh!

      

        

There was an error while loading. Please reload this page.

                                                                           

###         Uh oh!

      

        

There was an error while loading. Please reload this page.

                                            

##     Contributors  

  
      -               
      -               
      -               
  
                          

###         Uh oh!

      

        

There was an error while loading. Please reload this page.

                                         

## Languages

                  
    -                                 TypeScript          50.0%            
    -                                 Svelte          32.3%            
    -                                 JavaScript          16.7%            
    -                                 HTML          1.0%            

                                            

## Footer

                                           © 2026 GitHub, Inc.                                                     You can’t perform that action at this time.

## Assistant

<thinking>
Now I have a very clear picture. There IS an official `convex-svelte` package from the Convex team (`get-convex/convex-svelte`), and it:

1. Uses Svelte 5 runes internally
2. Provides `setupConvex()`, `useQuery()`, `useConvexClient()` 
3. The `useConvexClient()` returns a `ConvexClient` where you can call `.mutation()` directly from the client
4. Has SSR support through `initialData` option in `useQuery()`
5. Supports conditional skipping of queries


6. Mirrors their Nuxt architecture perfectly—mutations run server-side through SvelteKit API routes using `ConvexHttpClient` for security, while the frontend uses `useQuery()` for reactive reads

, and they won't need `useConvexClient()` for mutations since auth happens on the server.

The `convex-svelte` library is officially maintained by the Convex team and currently at 0.0.12, though there's also a community fork with more features like pagination if they need it. For their performance concerns about multiple components querying the same data, Convex already handles this elegantly—it deduplicates subscriptions at the WebSocket level, so they'll get the same efficient behavior they have with their Nuxt setup.
</thinking>

There's actually an **official `convex-svelte` package** from the Convex team themselves (`get-convex/convex-svelte`). And it maps almost perfectly to your existing architecture. Let me break it all down:

---

## The caching concern — you're fine

Convex's `ConvexClient` deduplicates subscriptions at the WebSocket level. If 5 components call `useQuery(api.skins.listSkins, {})` with the same args, only **one** subscription is maintained on the wire. Results are shared in-memory. This is the same behavior you have in your Nuxt project — no perf concern.

---

## The architecture maps 1:1 to your Nuxt setup

| Nuxt | SvelteKit |
|---|---|
| `convex-nuxt` → `useConvexQuery()` in Vue components | `convex-svelte` → `useQuery()` in Svelte components |
| `ConvexHttpClient` in Nitro server routes | `ConvexHttpClient` in `+server.ts` API routes |
| `convex.mutation(...)` on the server | `convex.mutation(...)` on the server |

---

## How it looks in practice

**Setup** — call `setupConvex()` in your root layout:

```BR_Skins_Hub/app/app.vue#L1-1
// src/routes/+layout.svelte
<script>
  import { setupConvex } from 'convex-svelte';
  import { PUBLIC_CONVEX_URL } from '$env/static/public';

  setupConvex(PUBLIC_CONVEX_URL);
</script>
```

**Reactive reads** — `useQuery()` in any component, reactive and live-updating:

```/dev/null/PlayerList.svelte#L1-15
<script lang="ts">
  import { useQuery } from 'convex-svelte';
  import { api } from '$lib/convex/_generated/api';

  const players = useQuery(api.players.listPlayers, () => ({}));
</script>

{#if players.isLoading}
  <Spinner />
{:else}
  {#each players.data as player}
    <PlayerCard {player} />
  {/each}
{/if}
```

**Reactive with dynamic args** (passes a function, just like your `computed()` in Vue):

```/dev/null/PlayerSkins.svelte#L1-8
<script lang="ts">
  const { playerId } = $props();

  const skins = useQuery(
    api.playerSkins.getSkinsByPlayer,
    () => ({ player_id: playerId })  // re-evaluates reactively when playerId changes
  );
</script>
```

**Conditional/skip** (equivalent to passing `null` in `convex-nuxt`):

```/dev/null/AuthenticatedView.svelte#L1-8
<script lang="ts">
  const activeUser = useQuery(
    api.users.getActiveUser,
    () => (isLoggedIn ? {} : 'skip')  // 'skip' pauses the subscription
  );
</script>
```

**Server-side mutations** — exactly like your Nitro routes, just SvelteKit `+server.ts`:

```/dev/null/src/routes/api/players/+server.ts#L1-15
import { ConvexHttpClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { api } from '$lib/convex/_generated/api';
import { requireAdmin } from '$lib/server/auth';

const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);

export const POST = async ({ request, locals }) => {
  await requireAdmin(locals);
  const body = await request.json();

  const result = await convex.mutation(api.players.createPlayer, { name: body.name, osu_id: body.osu_id });
  return Response.json(result);
};
```

---

## SSR bonus

`convex-svelte` also has a neat SSR integration — you can pre-fetch data in a `+page.server.ts` load function using `ConvexHttpClient` and pass it as `initialData` to `useQuery()`, so there's zero loading flash on first render. That's something you don't get for free with the Nuxt setup.

---

## Summary

- Install `convex` + `convex-svelte`
- `setupConvex()` in `+layout.svelte`
- `useQuery()` in components for all reactive reads
- `ConvexHttpClient` in `+server.ts` for all mutations — your auth/admin checks live there, same as Nuxt
- You **don't** need to build your own wrapper — the official one already uses Svelte 5 runes under the hood

## User

ok im thinking right now of alot o things.

- About the Public Conver URL. I usually just use the CONVEX_URL that is default (of course on production i use the one for production etc) that is usually something like `https://expert-turtles-222.convex.cloud`
- Im wondering if i really need the front end to be reactive and not just fetch one single time (which probably would be more efficient because i dont really need this to be reactive and live all the time, i barely update the database anyway) which i also think that it would be SSR friendly too because the data doesn't change frequently. Of course, if it changed it should update right away on the server so the next requests gets the more up to date results.
-

## Assistant

<thinking>
The user is thinking about their architecture and raising some good points:

1. **CONVEX_URL vs PUBLIC_CONVEX_URL**: In SvelteKit, env variables prefixed with `PUBLIC_` are exposed to the client. Since `CONVEX_URL` doesn't have the `PUBLIC_` prefix, it wouldn't be available in the browser. But if they're only using Convex on the server side (SSR/server routes), they don't need it public. This is actually an interesting point - if they go with the "no reactivity, just SSR fetch" approach, they only ever need the Convex URL on the server, so it stays private.


2. **Do they really need reactivity?** They're questioning whether live reactive queries are necessary given they barely update the database. If data changes infrequently, a pure SSR approach with one-shot fetches in load functions is simpler and more efficient than maintaining WebSocket connections, and SvelteKit's built-in cache invalidation can handle any refreshes they need.

Now I'm thinking through the actual implementation choice: they could go with real-time reactive subscriptions, but for a skin hub with minimal updates, server-side data loading with on-demand refresh via `invalidate()` makes more sense—it's lighter on resources and still gets them the data they need. On the environment variable side, if they're only using Convex server-side, they just need the private `CONVEX_URL` in their server code without exposing anything to the client. need for `PUBLIC_CONVEX_URL` at all. This is actually cleaner.

Let me think about this more carefully:

**Option A: Full SSR, no reactivity**
- `+page.server.ts` load functions use `ConvexHttpClient` to fetch data
- Server routes (`+server.ts`) handle mutations
- SvelteKit's `invalidate()` refreshes data after mutations
- `CONVEX_URL` stays private, never exposed to client
- No WebSocket, no `convex-svelte` needed

**Option B: Hybrid (SSR initial + reactive client)**
- `+page.server.ts` provides `initialData`
- `convex-svelte` `useQuery()` takes over on the client for live updates
- `PUBLIC_CONVEX_URL` needed for client-side WebSocket
- Good for frequently changing data

For a skin hub where data changes infrequently, Option A makes more sense. SvelteKit's `load()` and `invalidate()` pattern handles the workflow well enough: data loads server-side, mutations trigger a refresh, and subsequent visits fetch fresh data. Real-time reactivity only matters if multiple users are collaborating simultaneously, which doesn't seem to be the case here.

So my recommendation is to skip `convex-svelte` entirely, keep the Convex client on the server, use `+server.ts` for mutations, and rely on `invalidate()` for data freshness. It's simpler than their current Nuxt setup and doesn't require exposing the Convex URL to the browser.
</thinking>

These are really good observations and honestly point you toward a simpler and better architecture for your specific use case.

## On the `CONVEX_URL` / `PUBLIC_CONVEX_URL` thing

In SvelteKit, env variables prefixed with `PUBLIC_` are the ones that get exposed to the browser bundle. If you never ship Convex to the client, you just use `CONVEX_URL` as a **private** server-only env var. It never touches the client, same as how it works in your Nuxt project today with Nitro.

## On the reactivity question — you probably don't need it

Think about what "reactive live queries" actually buys you: it keeps a persistent WebSocket open so that if someone else changes the database, your UI updates without a page refresh. For a skin hub where data changes rarely, that's complete overkill. You'd be maintaining a WebSocket connection for every visitor 24/7 for an event that almost never happens.

The better fit for your case is **SvelteKit's own data flow**:

- `+page.server.ts` `load()` functions fetch data via `ConvexHttpClient` — **SSR, cacheable, no client JS needed**
- Mutations go through `+server.ts` routes (same as your Nitro routes)
- After a mutation, you call SvelteKit's `invalidate()` on the client, which re-runs the relevant `load()` and gives you fresh data

```/dev/null/src/routes/players/+page.server.ts#L1-10
import { ConvexHttpClient } from 'convex/browser';
import { CONVEX_URL } from '$env/static/private';
import { api } from '$lib/convex/_generated/api';

const convex = new ConvexHttpClient(CONVEX_URL);

export const load = async () => {
  const players = await convex.query(api.players.listPlayers);
  return { players };
};
```

```/dev/null/src/routes/players/+page.svelte#L1-15
<script lang="ts">
  import { invalidate } from '$app/navigation';
  let { data } = $props();

  async function deletePlayer(id: string) {
    await fetch(`/api/players/${id}`, { method: 'DELETE' });
    await invalidate('convex:players'); // re-runs the load function, gets fresh data
  }
</script>

{#each data.players as player}
  <PlayerCard {player} onDelete={() => deletePlayer(player._id)} />
{/each}
```

## What you actually gain from this

- `CONVEX_URL` stays **fully private** — never in the client bundle
- **No `convex-svelte` needed at all** — just the base `convex` package
- Pages are **SSR'd with real data** — good for SEO, fast first paint, works without JS
- SvelteKit can cache `load()` results aggressively
- When *you* make a change through the dashboard, `invalidate()` immediately reflects it for the current session
- Other visitors get fresh data on their next navigation naturally

The only thing you give up is: if user A edits something, user B's already-open browser tab won't update in real time. For a skin hub, that's completely acceptable — they'll see it on next navigation. That's exactly the tradeoff you described wanting.

So the short version: **keep everything on the server, `CONVEX_URL` stays private, skip `convex-svelte` entirely, use `load()` + `invalidate()`**. It's actually a simpler setup than your Nuxt project.

## User

i dont know much about svelte, can you tell me more about these load() and invalidade() functions? where are they used? how are they used? how does it work?

## Assistant

<thinking>
The user wants to learn about SvelteKit's `load()` functions and `invalidate()`. Let me explain these core SvelteKit concepts clearly. I should fetch the SvelteKit documentation to give accurate information, and also use the svelte documentation tool.
</thinking>

**Tool Call: list-sections**
Status: Completed

List of available Svelte documentation sections with their intended use cases. The "use_cases" field describes WHEN each section would be useful - analyze these carefully to determine which sections match the user's query:

- title: Overview, use_cases: use title and path to estimate use case, path: ai/overview
- title: Local setup, use_cases: use title and path to estimate use case, path: ai/local-setup
- title: Remote setup, use_cases: use title and path to estimate use case, path: ai/remote-setup
- title: Tools, use_cases: use title and path to estimate use case, path: ai/tools
- title: Resources, use_cases: use title and path to estimate use case, path: ai/resources
- title: Prompts, use_cases: use title and path to estimate use case, path: ai/prompts
- title: Overview, use_cases: use title and path to estimate use case, path: ai/plugin
- title: Subagent, use_cases: use title and path to estimate use case, path: ai/subagent
- title: Overview, use_cases: use title and path to estimate use case, path: ai/opencode-plugin
- title: Subagent, use_cases: use title and path to estimate use case, path: ai/opencode-subagent
- title: Overview, use_cases: use title and path to estimate use case, path: ai/skills
- title: Overview, use_cases: project setup, creating new svelte apps, scaffolding, cli tools, initializing projects, path: cli/overview
- title: Frequently asked questions, use_cases: project setup, initializing new svelte projects, troubleshooting cli installation, package manager configuration, path: cli/faq
- title: sv create, use_cases: project setup, starting new sveltekit app, initializing project, creating from playground, choosing project template, path: cli/sv-create
- title: sv add, use_cases: project setup, adding features to existing projects, integrating tools, testing setup, styling setup, authentication, database setup, deployment adapters, path: cli/sv-add
- title: sv check, use_cases: code quality, ci/cd pipelines, error checking, typescript projects, pre-commit hooks, finding unused css, accessibility auditing, production builds, path: cli/sv-check
- title: sv migrate, use_cases: migration, upgrading svelte versions, upgrading sveltekit versions, modernizing codebase, svelte 3 to 4, svelte 4 to 5, sveltekit 1 to 2, adopting runes, refactoring deprecated apis, path: cli/sv-migrate
- title: better-auth, use_cases: use title and path to estimate use case, path: cli/better-auth
- title: drizzle, use_cases: database setup, sql queries, orm integration, data modeling, postgresql, mysql, sqlite, server-side data access, database migrations, type-safe queries, path: cli/drizzle
- title: eslint, use_cases: code quality, linting, error detection, project setup, code standards, team collaboration, typescript projects, path: cli/eslint
- title: mcp, use_cases: use title and path to estimate use case, path: cli/mcp
- title: mdsvex, use_cases: blog, content sites, markdown rendering, documentation sites, technical writing, cms integration, article pages, path: cli/mdsvex
- title: paraglide, use_cases: internationalization, multi-language sites, i18n, translation, localization, language switching, global apps, multilingual content, path: cli/paraglide
- title: playwright, use_cases: browser testing, e2e testing, integration testing, test automation, quality assurance, ci/cd pipelines, testing user flows, path: cli/playwright
- title: prettier, use_cases: code formatting, project setup, code style consistency, team collaboration, linting configuration, path: cli/prettier
- title: storybook, use_cases: component development, design systems, ui library, isolated component testing, documentation, visual testing, component showcase, path: cli/storybook
- title: sveltekit-adapter, use_cases: deployment, production builds, hosting setup, choosing deployment platform, configuring adapters, static site generation, node server, vercel, cloudflare, netlify, path: cli/sveltekit-adapter
- title: tailwindcss, use_cases: project setup, styling, css framework, rapid prototyping, utility-first css, design systems, responsive design, adding tailwind to svelte, path: cli/tailwind
- title: vitest, use_cases: testing, unit tests, component testing, test setup, quality assurance, ci/cd pipelines, test-driven development, path: cli/vitest
- title: [create your own], use_cases: use title and path to estimate use case, path: cli/community
- title: sv, use_cases: use title and path to estimate use case, path: cli/sv
- title: sv-utils, use_cases: use title and path to estimate use case, path: cli/sv-utils
- title: Introduction, use_cases: learning sveltekit, project setup, understanding framework basics, choosing between svelte and sveltekit, getting started with full-stack apps, path: kit/introduction
- title: Creating a project, use_cases: project setup, starting new sveltekit app, initial development environment, first-time sveltekit users, scaffolding projects, path: kit/creating-a-project
- title: Project types, use_cases: deployment, project setup, choosing adapters, ssg, spa, ssr, serverless, mobile apps, desktop apps, pwa, offline apps, browser extensions, separate backend, docker containers, path: kit/project-types
- title: Project structure, use_cases: project setup, understanding file structure, organizing code, starting new project, learning sveltekit basics, path: kit/project-structure
- title: Web standards, use_cases: always, any sveltekit project, data fetching, forms, api routes, server-side rendering, deployment to various platforms, path: kit/web-standards
- title: Routing, use_cases: routing, navigation, multi-page apps, project setup, file structure, api endpoints, data loading, layouts, error pages, always, path: kit/routing
- title: Loading data, use_cases: data fetching, api calls, database queries, dynamic routes, page initialization, loading states, authentication checks, ssr data, form data, content rendering, path: kit/load
- title: Form actions, use_cases: forms, user input, data submission, authentication, login systems, user registration, progressive enhancement, validation errors, path: kit/form-actions
- title: Page options, use_cases: prerendering static sites, ssr configuration, spa setup, client-side rendering control, url trailing slash handling, adapter deployment config, build optimization, path: kit/page-options
- title: State management, use_cases: sveltekit, server-side rendering, ssr, state management, authentication, data persistence, load functions, context api, navigation, component lifecycle, path: kit/state-management
- title: Remote functions, use_cases: data fetching, server-side logic, database queries, type-safe client-server communication, forms, user input, mutations, authentication, crud operations, optimistic updates, path: kit/remote-functions
- title: Building your app, use_cases: production builds, deployment preparation, build process optimization, adapter configuration, preview before deployment, path: kit/building-your-app
- title: Adapters, use_cases: deployment, production builds, hosting setup, choosing deployment platform, configuring adapters, path: kit/adapters
- title: Zero-config deployments, use_cases: deployment, production builds, hosting setup, choosing deployment platform, ci/cd configuration, path: kit/adapter-auto
- title: Node servers, use_cases: deployment, production builds, node.js hosting, custom server setup, environment configuration, reverse proxy setup, docker deployment, systemd services, path: kit/adapter-node
- title: Static site generation, use_cases: static site generation, ssg, prerendering, deployment, github pages, spa mode, blogs, documentation sites, marketing sites, path: kit/adapter-static
- title: Single-page apps, use_cases: spa mode, single-page apps, client-only rendering, static hosting, mobile app wrappers, no server-side logic, adapter-static setup, fallback pages, path: kit/single-page-apps
- title: Cloudflare, use_cases: deployment, cloudflare workers, cloudflare pages, hosting setup, production builds, serverless deployment, edge computing, path: kit/adapter-cloudflare
- title: Cloudflare Workers, use_cases: deploying to cloudflare workers, cloudflare workers sites deployment, legacy cloudflare adapter, wrangler configuration, cloudflare platform bindings, path: kit/adapter-cloudflare-workers
- title: Netlify, use_cases: deployment, netlify hosting, production builds, serverless functions, edge functions, static site hosting, path: kit/adapter-netlify
- title: Vercel, use_cases: deployment, vercel hosting, production builds, serverless functions, edge functions, isr, image optimization, environment variables, path: kit/adapter-vercel
- title: Writing adapters, use_cases: custom deployment, building adapters, unsupported platforms, adapter development, custom hosting environments, path: kit/writing-adapters
- title: Advanced routing, use_cases: advanced routing, dynamic routes, file viewers, nested paths, custom 404 pages, url validation, route parameters, multi-level navigation, path: kit/advanced-routing
- title: Hooks, use_cases: authentication, logging, error tracking, request interception, api proxying, custom routing, internationalization, database initialization, middleware logic, session management, path: kit/hooks
- title: Errors, use_cases: error handling, custom error pages, 404 pages, api error responses, production error logging, error tracking, type-safe errors, path: kit/errors
- title: Link options, use_cases: routing, navigation, multi-page apps, performance optimization, link preloading, forms with get method, search functionality, focus management, scroll behavior, path: kit/link-options
- title: Service workers, use_cases: offline support, pwa, caching strategies, performance optimization, precaching assets, network resilience, progressive web apps, path: kit/service-workers
- title: Server-only modules, use_cases: api keys, environment variables, sensitive data protection, backend security, preventing data leaks, server-side code isolation, path: kit/server-only-modules
- title: Snapshots, use_cases: forms, user input, preserving form data, multi-step forms, navigation state, preventing data loss, textarea content, input fields, comment systems, surveys, path: kit/snapshots
- title: Shallow routing, use_cases: modals, dialogs, image galleries, overlays, history-driven ui, mobile-friendly navigation, photo viewers, lightboxes, drawer menus, path: kit/shallow-routing
- title: Observability, use_cases: performance monitoring, debugging, observability, tracing requests, production diagnostics, analyzing slow requests, finding bottlenecks, monitoring server-side operations, path: kit/observability
- title: Packaging, use_cases: building component libraries, publishing npm packages, creating reusable svelte components, library development, package distribution, path: kit/packaging
- title: Auth, use_cases: authentication, login systems, user management, session handling, jwt tokens, protected routes, user credentials, authorization checks, path: kit/auth
- title: Performance, use_cases: performance optimization, slow loading pages, production deployment, debugging performance issues, reducing bundle size, improving load times, path: kit/performance
- title: Icons, use_cases: icons, ui components, styling, css frameworks, tailwind, unocss, performance optimization, dependency management, path: kit/icons
- title: Images, use_cases: image optimization, responsive images, performance, hero images, product photos, galleries, cms integration, cdn setup, asset management, path: kit/images
- title: Accessibility, use_cases: always, any sveltekit project, screen reader support, keyboard navigation, multi-page apps, client-side routing, internationalization, multilingual sites, path: kit/accessibility
- title: SEO, use_cases: seo optimization, search engine ranking, content sites, blogs, marketing sites, public-facing apps, sitemaps, amp pages, meta tags, performance optimization, path: kit/seo
- title: Frequently asked questions, use_cases: troubleshooting package imports, library compatibility issues, client-side code execution, external api integration, middleware setup, database configuration, view transitions, yarn configuration, path: kit/faq
- title: Integrations, use_cases: project setup, css preprocessors, postcss, scss, sass, less, stylus, typescript setup, adding integrations, tailwind, testing, auth, linting, formatting, path: kit/integrations
- title: Breakpoint Debugging, use_cases: debugging, breakpoints, development workflow, troubleshooting issues, vscode setup, ide configuration, inspecting code execution, path: kit/debugging
- title: Migrating to SvelteKit v2, use_cases: migration, upgrading from sveltekit 1 to 2, breaking changes, version updates, path: kit/migrating-to-sveltekit-2
- title: Migrating from Sapper, use_cases: migrating from sapper, upgrading legacy projects, sapper to sveltekit conversion, project modernization, path: kit/migrating
- title: Additional resources, use_cases: troubleshooting, getting help, finding examples, learning sveltekit, project templates, common issues, community support, path: kit/additional-resources
- title: Glossary, use_cases: rendering strategies, performance optimization, deployment configuration, seo requirements, static sites, spas, server-side rendering, prerendering, edge deployment, pwa development, path: kit/glossary
- title: @sveltejs/kit, use_cases: forms, form actions, server-side validation, form submission, error handling, redirects, json responses, http errors, server utilities, path: kit/@sveltejs-kit
- title: @sveltejs/kit/hooks, use_cases: middleware, request processing, authentication chains, logging, multiple hooks, request/response transformation, path: kit/@sveltejs-kit-hooks
- title: @sveltejs/kit/node/polyfills, use_cases: node.js environments, custom servers, non-standard runtimes, ssr setup, web api compatibility, polyfill requirements, path: kit/@sveltejs-kit-node-polyfills
- title: @sveltejs/kit/node, use_cases: node.js adapter, custom server setup, http integration, streaming files, node deployment, server-side rendering with node, path: kit/@sveltejs-kit-node
- title: @sveltejs/kit/vite, use_cases: project setup, vite configuration, initial sveltekit setup, build tooling, path: kit/@sveltejs-kit-vite
- title: $app/environment, use_cases: always, conditional logic, client-side code, server-side code, build-time logic, prerendering, development vs production, environment detection, path: kit/$app-environment
- title: $app/forms, use_cases: forms, user input, data submission, progressive enhancement, custom form handling, form validation, path: kit/$app-forms
- title: $app/navigation, use_cases: routing, navigation, multi-page apps, programmatic navigation, data reloading, preloading, shallow routing, navigation lifecycle, scroll handling, view transitions, path: kit/$app-navigation
- title: $app/paths, use_cases: static assets, images, fonts, public files, base path configuration, subdirectory deployment, cdn setup, asset urls, links, navigation, path: kit/$app-paths
- title: $app/server, use_cases: remote functions, server-side logic, data fetching, form handling, api endpoints, client-server communication, prerendering, file reading, batch queries, path: kit/$app-server
- title: $app/state, use_cases: routing, navigation, multi-page apps, loading states, url parameters, form handling, error states, version updates, page metadata, shallow routing, path: kit/$app-state
- title: $app/stores, use_cases: legacy projects, sveltekit pre-2.12, migration from stores to runes, maintaining older codebases, accessing page data, navigation state, app version updates, path: kit/$app-stores
- title: $app/types, use_cases: routing, navigation, type safety, route parameters, dynamic routes, link generation, pathname validation, multi-page apps, path: kit/$app-types
- title: $env/dynamic/private, use_cases: api keys, secrets management, server-side config, environment variables, backend logic, deployment-specific settings, private data handling, path: kit/$env-dynamic-private
- title: $env/dynamic/public, use_cases: environment variables, client-side config, runtime configuration, public api keys, deployment-specific settings, multi-environment apps, path: kit/$env-dynamic-public
- title: $env/static/private, use_cases: server-side api keys, backend secrets, database credentials, private configuration, build-time optimization, server endpoints, authentication tokens, path: kit/$env-static-private
- title: $env/static/public, use_cases: environment variables, public config, client-side data, api endpoints, build-time configuration, public constants, path: kit/$env-static-public
- title: $lib, use_cases: project setup, component organization, importing shared components, reusable ui elements, code structure, path: kit/$lib
- title: $service-worker, use_cases: offline support, pwa, service workers, caching strategies, progressive web apps, offline-first apps, path: kit/$service-worker
- title: Configuration, use_cases: project setup, configuration, adapters, deployment, build settings, environment variables, routing customization, prerendering, csp security, csrf protection, path configuration, typescript setup, path: kit/configuration
- title: Command Line Interface, use_cases: project setup, typescript configuration, generated types, ./$types imports, initial project configuration, path: kit/cli
- title: Types, use_cases: typescript, type safety, route parameters, api endpoints, load functions, form actions, generated types, jsconfig setup, path: kit/types
- title: Overview, use_cases: always, any svelte project, getting started, learning svelte, introduction, project setup, understanding framework basics, path: svelte/overview
- title: Getting started, use_cases: project setup, starting new svelte project, initial installation, choosing between sveltekit and vite, editor configuration, path: svelte/getting-started
- title: .svelte files, use_cases: always, any svelte project, component creation, project setup, learning svelte basics, path: svelte/svelte-files
- title: .svelte.js and .svelte.ts files, use_cases: shared reactive state, reusable reactive logic, state management across components, global stores, custom reactive utilities, path: svelte/svelte-js-files
- title: What are runes?, use_cases: always, any svelte 5 project, understanding core syntax, learning svelte 5, migration from svelte 4, path: svelte/what-are-runes
- title: $state, use_cases: always, any svelte project, core reactivity, state management, counters, forms, todo apps, interactive ui, data updates, class-based components, path: svelte/$state
- title: $derived, use_cases: always, any svelte project, computed values, reactive calculations, derived data, transforming state, dependent values, path: svelte/$derived
- title: $effect, use_cases: canvas drawing, third-party library integration, dom manipulation, side effects, intervals, timers, network requests, analytics tracking, path: svelte/$effect
- title: $props, use_cases: always, any svelte project, passing data to components, component communication, reusable components, component props, path: svelte/$props
- title: $bindable, use_cases: forms, user input, two-way data binding, custom input components, parent-child communication, reusable form fields, path: svelte/$bindable
- title: $inspect, use_cases: debugging, development, tracking state changes, reactive state monitoring, troubleshooting reactivity issues, path: svelte/$inspect
- title: $host, use_cases: custom elements, web components, dispatching custom events, component library, framework-agnostic components, path: svelte/$host
- title: Basic markup, use_cases: always, any svelte project, basic markup, html templating, component structure, attributes, events, props, text rendering, path: svelte/basic-markup
- title: {#if ...}, use_cases: always, conditional rendering, showing/hiding content, dynamic ui, user permissions, loading states, error handling, form validation, path: svelte/if
- title: {#each ...}, use_cases: always, lists, arrays, iteration, product listings, todos, tables, grids, dynamic content, shopping carts, user lists, comments, feeds, path: svelte/each
- title: {#key ...}, use_cases: animations, transitions, component reinitialization, forcing component remount, value-based ui updates, resetting component state, path: svelte/key
- title: {#await ...}, use_cases: async data fetching, api calls, loading states, promises, error handling, lazy loading components, dynamic imports, path: svelte/await
- title: {#snippet ...}, use_cases: reusable markup, component composition, passing content to components, table rows, list items, conditional rendering, reducing duplication, path: svelte/snippet
- title: {@render ...}, use_cases: reusable ui patterns, component composition, conditional rendering, fallback content, layout components, slot alternatives, template reuse, path: svelte/@render
- title: {@html ...}, use_cases: rendering html strings, cms content, rich text editors, markdown to html, blog posts, wysiwyg output, sanitized html injection, dynamic html content, path: svelte/@html
- title: {@attach ...}, use_cases: tooltips, popovers, dom manipulation, third-party libraries, canvas drawing, element lifecycle, interactive ui, custom directives, wrapper components, path: svelte/@attach
- title: {@const ...}, use_cases: computed values in loops, derived calculations in blocks, local variables in each iterations, complex list rendering, path: svelte/@const
- title: {@debug ...}, use_cases: debugging, development, troubleshooting, tracking state changes, monitoring variables, reactive data inspection, path: svelte/@debug
- title: bind:, use_cases: forms, user input, two-way data binding, interactive ui, media players, file uploads, checkboxes, radio buttons, select dropdowns, contenteditable, dimension tracking, path: svelte/bind
- title: use:, use_cases: custom directives, dom manipulation, third-party library integration, tooltips, click outside, gestures, focus management, element lifecycle hooks, path: svelte/use
- title: transition:, use_cases: animations, interactive ui, modals, dropdowns, notifications, conditional content, show/hide elements, smooth state changes, path: svelte/transition
- title: in: and out:, use_cases: animation, transitions, interactive ui, conditional rendering, independent enter/exit effects, modals, tooltips, notifications, path: svelte/in-and-out
- title: animate:, use_cases: sortable lists, drag and drop, reorderable items, todo lists, kanban boards, playlist editors, priority queues, animated list reordering, path: svelte/animate
- title: style:, use_cases: dynamic styling, conditional styles, theming, dark mode, responsive design, interactive ui, component styling, path: svelte/style
- title: class, use_cases: always, conditional styling, dynamic classes, tailwind css, component styling, reusable components, responsive design, path: svelte/class
- title: await, use_cases: async data fetching, loading states, server-side rendering, awaiting promises in components, async validation, concurrent data loading, path: svelte/await-expressions
- title: Scoped styles, use_cases: always, styling components, scoped css, component-specific styles, preventing style conflicts, animations, keyframes, path: svelte/scoped-styles
- title: Global styles, use_cases: global styles, third-party libraries, css resets, animations, styling body/html, overriding component styles, shared keyframes, base styles, path: svelte/global-styles
- title: Custom properties, use_cases: theming, custom styling, reusable components, design systems, dynamic colors, component libraries, ui customization, path: svelte/custom-properties
- title: Nested <style> elements, use_cases: component styling, scoped styles, dynamic styles, conditional styling, nested style tags, custom styling logic, path: svelte/nested-style-elements
- title: <svelte:boundary>, use_cases: error handling, async data loading, loading states, error recovery, flaky components, error reporting, resilient ui, path: svelte/svelte-boundary
- title: <svelte:window>, use_cases: keyboard shortcuts, scroll tracking, window resize handling, responsive layouts, online/offline detection, viewport dimensions, global event listeners, path: svelte/svelte-window
- title: <svelte:document>, use_cases: document events, visibility tracking, fullscreen detection, pointer lock, focus management, document-level interactions, path: svelte/svelte-document
- title: <svelte:body>, use_cases: mouse tracking, hover effects, cursor interactions, global body events, drag and drop, custom cursors, interactive backgrounds, body-level actions, path: svelte/svelte-body
- title: <svelte:head>, use_cases: seo optimization, page titles, meta tags, social media sharing, dynamic head content, multi-page apps, blog posts, product pages, path: svelte/svelte-head
- title: <svelte:element>, use_cases: dynamic content, cms integration, user-generated content, configurable ui, runtime element selection, flexible components, path: svelte/svelte-element
- title: <svelte:options>, use_cases: migration, custom elements, web components, legacy mode compatibility, runes mode setup, svg components, mathml components, css injection control, path: svelte/svelte-options
- title: Stores, use_cases: shared state, cross-component data, reactive values, async data streams, manual control over updates, rxjs integration, extracting logic, path: svelte/stores
- title: Context, use_cases: shared state, avoiding prop drilling, component communication, theme providers, user context, authentication state, configuration sharing, deeply nested components, path: svelte/context
- title: Lifecycle hooks, use_cases: component initialization, cleanup tasks, timers, subscriptions, dom measurements, chat windows, autoscroll features, migration from svelte 4, path: svelte/lifecycle-hooks
- title: Imperative component API, use_cases: project setup, client-side rendering, server-side rendering, ssr, hydration, testing, programmatic component creation, tooltips, dynamic mounting, path: svelte/imperative-component-api
- title: Hydratable data, use_cases: use title and path to estimate use case, path: svelte/hydratable
- title: Best practices, use_cases: use title and path to estimate use case, path: svelte/best-practices
- title: Testing, use_cases: testing, quality assurance, unit tests, integration tests, component tests, e2e tests, vitest setup, playwright setup, test automation, path: svelte/testing
- title: TypeScript, use_cases: typescript setup, type safety, component props typing, generic components, wrapper components, dom type augmentation, project configuration, path: svelte/typescript
- title: Custom elements, use_cases: web components, custom elements, component library, design system, framework-agnostic components, embedding svelte in non-svelte apps, shadow dom, path: svelte/custom-elements
- title: Svelte 4 migration guide, use_cases: upgrading svelte 3 to 4, version migration, updating dependencies, breaking changes, legacy project maintenance, path: svelte/v4-migration-guide
- title: Svelte 5 migration guide, use_cases: migrating from svelte 4 to 5, upgrading projects, learning svelte 5 syntax changes, runes migration, event handler updates, path: svelte/v5-migration-guide
- title: Frequently asked questions, use_cases: getting started, learning svelte, beginner setup, project initialization, vs code setup, formatting, testing, routing, mobile apps, troubleshooting, community support, path: svelte/faq
- title: svelte, use_cases: migration from svelte 4 to 5, upgrading legacy code, component lifecycle hooks, context api, mounting components, event dispatchers, typescript component types, path: svelte/svelte
- title: svelte/action, use_cases: typescript types, actions, use directive, dom manipulation, element lifecycle, custom behaviors, third-party library integration, path: svelte/svelte-action
- title: svelte/animate, use_cases: animated lists, sortable items, drag and drop, reordering elements, todo lists, kanban boards, playlist management, smooth position transitions, path: svelte/svelte-animate
- title: svelte/attachments, use_cases: library development, component libraries, programmatic element manipulation, migrating from actions to attachments, spreading props onto elements, path: svelte/svelte-attachments
- title: svelte/compiler, use_cases: build tools, custom compilers, ast manipulation, preprocessors, code transformation, migration scripts, syntax analysis, bundler plugins, dev tools, path: svelte/svelte-compiler
- title: svelte/easing, use_cases: animations, transitions, custom easing, smooth motion, interactive ui, modals, dropdowns, carousels, page transitions, scroll effects, path: svelte/svelte-easing
- title: svelte/events, use_cases: window events, document events, global event listeners, event delegation, programmatic event handling, cleanup functions, media queries, path: svelte/svelte-events
- title: svelte/legacy, use_cases: migration from svelte 4 to svelte 5, upgrading legacy code, event modifiers, class components, imperative component instantiation, path: svelte/svelte-legacy
- title: svelte/motion, use_cases: animation, smooth transitions, interactive ui, sliders, counters, physics-based motion, drag gestures, accessibility, reduced motion, path: svelte/svelte-motion
- title: svelte/reactivity/window, use_cases: responsive design, viewport tracking, scroll effects, window resize handling, online/offline detection, zoom level tracking, path: svelte/svelte-reactivity-window
- title: svelte/reactivity, use_cases: reactive data structures, state management with maps/sets, game boards, selection tracking, url manipulation, query params, real-time clocks, media queries, responsive design, path: svelte/svelte-reactivity
- title: svelte/server, use_cases: server-side rendering, ssr, static site generation, seo optimization, initial page load, pre-rendering, node.js server, custom server setup, path: svelte/svelte-server
- title: svelte/store, use_cases: state management, shared data, reactive stores, cross-component communication, global state, computed values, data synchronization, legacy svelte projects, path: svelte/svelte-store
- title: svelte/transition, use_cases: animations, transitions, interactive ui, modals, dropdowns, tooltips, notifications, svg animations, list animations, page transitions, path: svelte/svelte-transition
- title: Compiler errors, use_cases: animation, transitions, keyed each blocks, list animations, path: svelte/compiler-errors
- title: Compiler warnings, use_cases: accessibility, a11y compliance, wcag standards, screen readers, keyboard navigation, aria attributes, semantic html, interactive elements, path: svelte/compiler-warnings
- title: Runtime errors, use_cases: debugging errors, error handling, troubleshooting runtime issues, migration to svelte 5, component binding, effects and reactivity, path: svelte/runtime-errors
- title: Runtime warnings, use_cases: debugging state proxies, console logging reactive values, inspecting state changes, development troubleshooting, path: svelte/runtime-warnings
- title: Overview, use_cases: migrating from svelte 3/4 to svelte 5, maintaining legacy components, understanding deprecated features, gradual upgrade process, path: svelte/legacy-overview
- title: Reactive let/var declarations, use_cases: migration, legacy svelte projects, upgrading from svelte 4, understanding old reactivity, maintaining existing code, learning runes differences, path: svelte/legacy-let
- title: Reactive $: statements, use_cases: legacy mode, migration from svelte 4, reactive statements, computed values, derived state, side effects, path: svelte/legacy-reactive-assignments
- title: export let, use_cases: legacy mode, migration from svelte 4, maintaining older projects, component props without runes, exporting component methods, renaming reserved word props, path: svelte/legacy-export-let
- title: $$props and $$restProps, use_cases: legacy mode migration, component wrappers, prop forwarding, button components, reusable ui components, spreading props to child elements, path: svelte/legacy-$$props-and-$$restProps
- title: on:, use_cases: legacy mode, event handling, button clicks, forms, user interactions, component communication, event forwarding, event modifiers, path: svelte/legacy-on
- title: <slot>, use_cases: legacy mode, migrating from svelte 4, component composition, reusable components, passing content to components, modals, layouts, wrappers, path: svelte/legacy-slots
- title: $$slots, use_cases: legacy mode, conditional slot rendering, optional content sections, checking if slots provided, migrating from legacy to runes, path: svelte/legacy-$$slots
- title: <svelte:fragment>, use_cases: named slots, component composition, layout systems, avoiding wrapper divs, legacy svelte projects, slot content organization, path: svelte/legacy-svelte-fragment
- title: <svelte:component>, use_cases: dynamic components, component switching, conditional rendering, legacy mode migration, tabbed interfaces, multi-step forms, path: svelte/legacy-svelte-component
- title: <svelte:self>, use_cases: recursive components, tree structures, nested menus, file explorers, comment threads, hierarchical data, path: svelte/legacy-svelte-self
- title: Imperative component API, use_cases: migration from svelte 3/4 to 5, legacy component api, maintaining old projects, understanding deprecated patterns, path: svelte/legacy-component-api

Carefully analyze the use_cases field for each section to identify which documentation is relevant for the user's specific query. The use_cases contain keywords for project types, features, components, and development stages. After identifying relevant sections, use the get-documentation tool with ALL relevant section titles or paths at once (can pass multiple sections as an array).

## Assistant

<thinking>
The user wants to learn about `load()` and `invalidate()` functions in SvelteKit. The relevant sections are:
- `kit/load` - Loading data
- `kit/$app-navigation` - has invalidate()
- `kit/routing` - routing basics

Let me fetch the load and navigation docs.
</thinking>

**Tool Call: get-documentation**
Status: Completed

## Loading data

Before a [`+page.svelte`](routing#page-page.svelte) component (and its containing [`+layout.svelte`](routing#layout-layout.svelte) components) can be rendered, we often need to get some data. This is done by defining `load` functions.

## Page data

A `+page.svelte` file can have a sibling `+page.js` that exports a `load` function, the return value of which is available to the page via the `data` prop:

```js
/// file: src/routes/blog/[slug]/+page.js
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return {
		post: {
			title: `Title for ${params.slug} goes here`,
			content: `Content for ${params.slug} goes here`
		}
	};
}
```

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>
```

> [!LEGACY]
> Before version 2.16.0, the props of a page and layout had to be typed individually:
> ```js
> /// file: +page.svelte
> /** @type {{ data: import('./$types').PageData }} */
> let { data } = $props();
> ```
>
> In Svelte 4, you'd use `export let data` instead.

Thanks to the generated `$types` module, we get full type safety.

A `load` function in a `+page.js` file runs both on the server and in the browser (unless combined with `export const ssr = false`, in which case it will [only run in the browser](page-options#ssr)). If your `load` function should _always_ run on the server (because it uses private environment variables, for example, or accesses a database) then it would go in a `+page.server.js` instead.

A more realistic version of your blog post's `load` function, that only runs on the server and pulls data from a database, might look like this:

```js
/// file: src/routes/blog/[slug]/+page.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPost(slug: string): Promise<{ title: string, content: string }>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		post: await db.getPost(params.slug)
	};
}
```

Notice that the type changed from `PageLoad` to `PageServerLoad`, because server `load` functions can access additional arguments. To understand when to use `+page.js` and when to use `+page.server.js`, see [Universal vs server](load#Universal-vs-server).

## Layout data

Your `+layout.svelte` files can also load data, via `+layout.js` or `+layout.server.js`.

```js
/// file: src/routes/blog/[slug]/+layout.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPostSummaries(): Promise<Array<{ title: string, slug: string }>>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return {
		posts: await db.getPostSummaries()
	};
}
```

```svelte
<!--- file: src/routes/blog/[slug]/+layout.svelte --->
<script>
	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();
</script>

<main>
	<!-- +page.svelte is `@render`ed here -->
	{@render children()}
</main>

<aside>
	<h2>More posts</h2>
	<ul>
		{#each data.posts as post}
			<li>
				<a href="/blog/{post.slug}">
					{post.title}
				</a>
			</li>
		{/each}
	</ul>
</aside>
```

> [!LEGACY]
> `LayoutProps` was added in 2.16.0. In earlier versions, properties had to be typed individually:
> ```js
> /// file: +layout.svelte
> /** @type {{ data: import('./$types').LayoutData, children: Snippet }} */
> let { data, children } = $props();
> ```

Data returned from layout `load` functions is available to child `+layout.svelte` components and the `+page.svelte` component as well as the layout that it 'belongs' to.

```svelte
/// file: src/routes/blog/[slug]/+page.svelte
<script>
	+++import { page } from '$app/state';+++

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

+++	// we can access `data.posts` because it's returned from
	// the parent layout `load` function
	let index = $derived(data.posts.findIndex(post => post.slug === page.params.slug));
	let next = $derived(data.posts[index + 1]);+++
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>

+++{#if next}
	<p>Next post: <a href="/blog/{next.slug}">{next.title}</a></p>
{/if}+++
```

> [!NOTE] If multiple `load` functions return data with the same key, the last one 'wins' — the result of a layout `load` returning `{ a: 1, b: 2 }` and a page `load` returning `{ b: 3, c: 4 }` would be `{ a: 1, b: 3, c: 4 }`.

## page.data

The `+page.svelte` component, and each `+layout.svelte` component above it, has access to its own data plus all the data from its parents.

In some cases, we might need the opposite — a parent layout might need to access page data or data from a child layout. For example, the root layout might want to access a `title` property returned from a `load` function in `+page.js` or `+page.server.js`. This can be done with `page.data`:

```svelte
<!--- file: src/routes/+layout.svelte --->
<script>
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.data.title}</title>
</svelte:head>
```

Type information for `page.data` is provided by `App.PageData`.

> [!LEGACY]
> `$app/state` was added in SvelteKit 2.12. If you're using an earlier version or are using Svelte 4, use `$app/stores` instead.
> It provides a `page` store with the same interface that you can subscribe to, e.g. `$page.data.title`.

## Universal vs server

As we've seen, there are two types of `load` function:

* `+page.js` and `+layout.js` files export _universal_ `load` functions that run both on the server and in the browser
* `+page.server.js` and `+layout.server.js` files export _server_ `load` functions that only run server-side

Conceptually, they're the same thing, but there are some important differences to be aware of.

### When does which load function run?

Server `load` functions _always_ run on the server.

By default, universal `load` functions run on the server during SSR when the user first visits your page. They will then run again during hydration, reusing any responses from [fetch requests](#Making-fetch-requests). All subsequent invocations of universal `load` functions happen in the browser. You can customize the behavior through [page options](page-options). If you disable [server-side rendering](page-options#ssr), you'll get an SPA and universal `load` functions _always_ run on the client.

If a route contains both universal and server `load` functions, the server `load` runs first.

A `load` function is invoked at runtime, unless you [prerender](page-options#prerender) the page — in that case, it's invoked at build time.

### Input

Both universal and server `load` functions have access to properties describing the request (`params`, `route` and `url`) and various functions (`fetch`, `setHeaders`, `parent`, `depends` and `untrack`). These are described in the following sections.

Server `load` functions are called with a `ServerLoadEvent`, which inherits `clientAddress`, `cookies`, `locals`, `platform` and `request` from `RequestEvent`.

Universal `load` functions are called with a `LoadEvent`, which has a `data` property. If you have `load` functions in both `+page.js` and `+page.server.js` (or `+layout.js` and `+layout.server.js`), the return value of the server `load` function is the `data` property of the universal `load` function's argument.

### Output

A universal `load` function can return an object containing any values, including things like custom classes and component constructors.

A server `load` function must return data that can be serialized with [devalue](https://github.com/rich-harris/devalue) — anything that can be represented as JSON plus things like `BigInt`, `Date`, `Map`, `Set` and `RegExp`, or repeated/cyclical references — so that it can be transported over the network. Your data can include [promises](#Streaming-with-promises), in which case it will be streamed to browsers. If you need to serialize/deserialize custom types, use [transport hooks](hooks#Universal-hooks-transport).

### When to use which

Server `load` functions are convenient when you need to access data directly from a database or filesystem, or need to use private environment variables.

Universal `load` functions are useful when you need to `fetch` data from an external API and don't need private credentials, since SvelteKit can get the data directly from the API rather than going via your server. They are also useful when you need to return something that can't be serialized, such as a Svelte component constructor.

In rare cases, you might need to use both together — for example, you might need to return an instance of a custom class that was initialised with data from your server. When using both, the server `load` return value is _not_ passed directly to the page, but to the universal `load` function (as the `data` property):

```js
/// file: src/routes/+page.server.js
/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		serverMessage: 'hello from server load function'
	};
}
```

```js
/// file: src/routes/+page.js
// @errors: 18047
/** @type {import('./$types').PageLoad} */
export async function load({ data }) {
	return {
		serverMessage: data.serverMessage,
		universalMessage: 'hello from universal load function'
	};
}
```

## Using URL data

Often the `load` function depends on the URL in one way or another. For this, the `load` function provides you with `url`, `route` and `params`.

### url

An instance of [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL), containing properties like the `origin`, `hostname`, `pathname` and `searchParams` (which contains the parsed query string as a [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object). `url.hash` cannot be accessed during `load`, since it is unavailable on the server.

> [!NOTE] In some environments this is derived from request headers during server-side rendering. If you're using [adapter-node](adapter-node), for example, you may need to configure the adapter in order for the URL to be correct.

### route

Contains the name of the current route directory, relative to `src/routes`:

```js
/// file: src/routes/a/[b]/[...c]/+page.js
/** @type {import('./$types').PageLoad} */
export function load({ route }) {
	console.log(route.id); // '/a/[b]/[...c]'
}
```

### params

`params` is derived from `url.pathname` and `route.id`.

Given a `route.id` of `/a/[b]/[...c]` and a `url.pathname` of `/a/x/y/z`, the `params` object would look like this:

```json
{
	"b": "x",
	"c": "y/z"
}
```

## Making fetch requests

To get data from an external API or a `+server.js` handler, you can use the provided `fetch` function, which behaves identically to the [native `fetch` web API](https://developer.mozilla.org/en-US/docs/Web/API/fetch) with a few additional features:

- It can be used to make credentialed requests on the server, as it inherits the `cookie` and `authorization` headers for the page request.
- It can make relative requests on the server (ordinarily, `fetch` requires a URL with an origin when used in a server context).
- Internal requests (e.g. for `+server.js` routes) go directly to the handler function when running on the server, without the overhead of an HTTP call.
- During server-side rendering, the response will be captured and inlined into the rendered HTML by hooking into the `text`, `json` and `arrayBuffer` methods of the `Response` object. Note that headers will _not_ be serialized, unless explicitly included via [`filterSerializedResponseHeaders`](hooks#Server-hooks-handle).
- During hydration, the response will be read from the HTML, guaranteeing consistency and preventing an additional network request - if you received a warning in your browser console when using the browser `fetch` instead of the `load` `fetch`, this is why.

```js
/// file: src/routes/items/[id]/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	const res = await fetch(`/api/items/${params.id}`);
	const item = await res.json();

	return { item };
}
```

## Cookies

A server `load` function can get and set [`cookies`](@sveltejs-kit#Cookies).

```js
/// file: src/routes/+layout.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getUser(sessionid: string | undefined): Promise<{ name: string, avatar: string }>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	const sessionid = cookies.get('sessionid');

	return {
		user: await db.getUser(sessionid)
	};
}
```

Cookies will only be passed through the provided `fetch` function if the target host is the same as the SvelteKit application or a more specific subdomain of it.

For example, if SvelteKit is serving my.domain.com:
- domain.com WILL NOT receive cookies
- my.domain.com WILL receive cookies
- api.domain.com WILL NOT receive cookies
- sub.my.domain.com WILL receive cookies

Other cookies will not be passed when `credentials: 'include'` is set, because SvelteKit does not know which domain which cookie belongs to (the browser does not pass this information along), so it's not safe to forward any of them. Use the [handleFetch hook](hooks#Server-hooks-handleFetch) to work around it.

## Headers

Both server and universal `load` functions have access to a `setHeaders` function that, when running on the server, can set headers for the response. (When running in the browser, `setHeaders` has no effect.) This is useful if you want the page to be cached, for example:

```js
// @errors: 2322 1360
/// file: src/routes/products/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, setHeaders }) {
	const url = `https://cms.example.com/products.json`;
	const response = await fetch(url);

	// Headers are only set during SSR, caching the page's HTML
	// for the same length of time as the underlying data.
	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control')
	});

	return response.json();
}
```

Setting the same header multiple times (even in separate `load` functions) is an error. You can only set a given header once using the `setHeaders` function. You cannot add a `set-cookie` header with `setHeaders` — use `cookies.set(name, value, options)` instead.

## Using parent data

Occasionally it's useful for a `load` function to access data from a parent `load` function, which can be done with `await parent()`:

```js
/// file: src/routes/+layout.js
/** @type {import('./$types').LayoutLoad} */
export function load() {
	return { a: 1 };
}
```

```js
/// file: src/routes/abc/+layout.js
/** @type {import('./$types').LayoutLoad} */
export async function load({ parent }) {
	const { a } = await parent();
	return { b: a + 1 };
}
```

```js
/// file: src/routes/abc/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
	const { a, b } = await parent();
	return { c: a + b };
}
```

```svelte
<!--- file: src/routes/abc/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<!-- renders `1 + 2 = 3` -->
<p>{data.a} + {data.b} = {data.c}</p>
```

> [!NOTE] Notice that the `load` function in `+page.js` receives the merged data from both layout `load` functions, not just the immediate parent.

Inside `+page.server.js` and `+layout.server.js`, `parent` returns data from parent `+layout.server.js` files.

In `+page.js` or `+layout.js` it will return data from parent `+layout.js` files. However, a missing `+layout.js` is treated as a `({ data }) => data` function, meaning that it will also return data from parent `+layout.server.js` files that are not 'shadowed' by a `+layout.js` file

Take care not to introduce waterfalls when using `await parent()`. Here, for example, `getData(params)` does not depend on the result of calling `parent()`, so we should call it first to avoid a delayed render.

```js
/// file: +page.js
// @filename: ambient.d.ts
declare function getData(params: Record<string, string>): Promise<{ meta: any }>

// @filename: index.js
// ---cut---
/** @type {import('./$types').PageLoad} */
export async function load({ params, parent }) {
	---const parentData = await parent();---
	const data = await getData(params);
	+++const parentData = await parent();+++

	return {
		...data,
		meta: { ...parentData.meta, ...data.meta }
	};
}
```

## Errors

If an error is thrown during `load`, the nearest [`+error.svelte`](routing#error) will be rendered. For [_expected_](errors#Expected-errors) errors, use the `error` helper from `@sveltejs/kit` to specify the HTTP status code and an optional message:

```js
/// file: src/routes/admin/+layout.server.js
// @filename: ambient.d.ts
declare namespace App {
	interface Locals {
		user?: {
			name: string;
			isAdmin: boolean;
		}
	}
}

// @filename: index.js
// ---cut---
import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	if (!locals.user) {
		error(401, 'not logged in');
	}

	if (!locals.user.isAdmin) {
		error(403, 'not an admin');
	}
}
```

Calling `error(...)` will throw an exception, making it easy to stop execution from inside helper functions.

If an [_unexpected_](errors#Unexpected-errors) error is thrown, SvelteKit will invoke [`handleError`](hooks#Shared-hooks-handleError) and treat it as a 500 Internal Error.

> [!NOTE] [In SvelteKit 1.x](migrating-to-sveltekit-2#redirect-and-error-are-no-longer-thrown-by-you) you had to `throw` the error yourself

## Redirects

To redirect users, use the `redirect` helper from `@sveltejs/kit` to specify the location to which they should be redirected alongside a `3xx` status code. Like `error(...)`, calling `redirect(...)` will throw an exception, making it easy to stop execution from inside helper functions.

```js
/// file: src/routes/user/+layout.server.js
// @filename: ambient.d.ts
declare namespace App {
	interface Locals {
		user?: {
			name: string;
		}
	}
}

// @filename: index.js
// ---cut---
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	if (!locals.user) {
		redirect(307, '/login');
	}
}
```

> [!NOTE] Don't use `redirect()` inside a `try {...}` block, as the redirect will immediately trigger the catch statement.

In the browser, you can also navigate programmatically outside of a `load` function using [`goto`]($app-navigation#goto) from [`$app.navigation`]($app-navigation).

> [!NOTE] [In SvelteKit 1.x](migrating-to-sveltekit-2#redirect-and-error-are-no-longer-thrown-by-you) you had to `throw` the `redirect` yourself

## Streaming with promises

When using a server `load`, promises will be streamed to the browser as they resolve. This is useful if you have slow, non-essential data, since you can start rendering the page before all the data is available:

```js
/// file: src/routes/blog/[slug]/+page.server.js
// @filename: ambient.d.ts
declare global {
	const loadPost: (slug: string) => Promise<{ title: string, content: string }>;
	const loadComments: (slug: string) => Promise<{ content: string }>;
}

export {};

// @filename: index.js
// ---cut---
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		// make sure the `await` happens at the end, otherwise we
		// can't start loading comments until we've loaded the post
		comments: loadComments(params.slug),
		post: await loadPost(params.slug)
	};
}
```

This is useful for creating skeleton loading states, for example:

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>

{#await data.comments}
	Loading comments...
{:then comments}
	{#each comments as comment}
		<p>{comment.content}</p>
	{/each}
{:catch error}
	<p>error loading comments: {error.message}</p>
{/await}
```

When streaming data, be careful to handle promise rejections correctly. More specifically, the server could crash with an "unhandled promise rejection" error if a lazy-loaded promise fails before rendering starts (at which point it's caught) and isn't handling the error in some way. When using SvelteKit's `fetch` directly in the `load` function, SvelteKit will handle this case for you. For other promises, it is enough to attach a noop-`catch` to the promise to mark it as handled.

```js
/// file: src/routes/+page.server.js
/** @type {import('./$types').PageServerLoad} */
export function load({ fetch }) {
	const ok_manual = Promise.reject();
	ok_manual.catch(() => {});

	return {
		ok_manual,
		ok_fetch: fetch('/fetch/that/could/fail'),
		dangerous_unhandled: Promise.reject()
	};
}
```

> [!NOTE] On platforms that do not support streaming, such as AWS Lambda or Firebase, responses will be buffered. This means the page will only render once all promises resolve. If you are using a proxy (e.g. NGINX), make sure it does not buffer responses from the proxied server.

> [!NOTE] Streaming data will only work when JavaScript is enabled. You should avoid returning promises from a universal `load` function if the page is server rendered, as these are _not_ streamed — instead, the promise is recreated when the function reruns in the browser.

> [!NOTE] The headers and status code of a response cannot be changed once the response has started streaming, therefore you cannot `setHeaders` or throw redirects inside a streamed promise.

> [!NOTE] [In SvelteKit 1.x](migrating-to-sveltekit-2#Top-level-promises-are-no-longer-awaited) top-level promises were automatically awaited, only nested promises were streamed.

## Parallel loading

When rendering (or navigating to) a page, SvelteKit runs all `load` functions concurrently, avoiding a waterfall of requests. During client-side navigation, the result of calling multiple server `load` functions are grouped into a single response. Once all `load` functions have returned, the page is rendered.

## Rerunning load functions

SvelteKit tracks the dependencies of each `load` function to avoid rerunning it unnecessarily during navigation.

For example, given a pair of `load` functions like these...

```js
/// file: src/routes/blog/[slug]/+page.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPost(slug: string): Promise<{ title: string, content: string }>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		post: await db.getPost(params.slug)
	};
}
```

```js
/// file: src/routes/blog/[slug]/+layout.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPostSummaries(): Promise<Array<{ title: string, slug: string }>>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return {
		posts: await db.getPostSummaries()
	};
}
```

...the one in `+page.server.js` will rerun if we navigate from `/blog/trying-the-raw-meat-diet` to `/blog/i-regret-my-choices` because `params.slug` has changed. The one in `+layout.server.js` will not, because the data is still valid. In other words, we won't call `db.getPostSummaries()` a second time.

A `load` function that calls `await parent()` will also rerun if a parent `load` function is rerun.

Dependency tracking does not apply _after_ the `load` function has returned — for example, accessing `params.x` inside a nested [promise](#Streaming-with-promises) will not cause the function to rerun when `params.x` changes. (Don't worry, you'll get a warning in development if you accidentally do this.) Instead, access the parameter in the main body of your `load` function.

Search parameters are tracked independently from the rest of the url. For example, accessing `event.url.searchParams.get("x")` inside a `load` function will make that `load` function re-run when navigating from `?x=1` to `?x=2`, but not when navigating from `?x=1&y=1` to `?x=1&y=2`.

### Untracking dependencies

In rare cases, you may wish to exclude something from the dependency tracking mechanism. You can do this with the provided `untrack` function:

```js
/// file: src/routes/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ untrack, url }) {
	// Untrack url.pathname so that path changes don't trigger a rerun
	if (untrack(() => url.pathname === '/')) {
		return { message: 'Welcome!' };
	}
}
```

### Manual invalidation

You can also rerun `load` functions that apply to the current page using [`invalidate(url)`]($app-navigation#invalidate), which reruns all `load` functions that depend on `url`, and [`invalidateAll()`]($app-navigation#invalidateAll), which reruns every `load` function. Server load functions will never automatically depend on a fetched `url` to avoid leaking secrets to the client.

A `load` function depends on `url` if it calls `fetch(url)` or `depends(url)`. Note that `url` can be a custom identifier that starts with `[a-z]:`:

```js
/// file: src/routes/random-number/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, depends }) {
	// load reruns when `invalidate('https://api.example.com/random-number')` is called...
	const response = await fetch('https://api.example.com/random-number');

	// ...or when `invalidate('app:random')` is called
	depends('app:random');

	return {
		number: await response.json()
	};
}
```

```svelte
<!--- file: src/routes/random-number/+page.svelte --->
<script>
	import { invalidate, invalidateAll } from '$app/navigation';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	function rerunLoadFunction() {
		// any of these will cause the `load` function to rerun
		invalidate('app:random');
		invalidate('https://api.example.com/random-number');
		invalidate(url => url.href.includes('random-number'));
		invalidateAll();
	}
</script>

<p>random number: {data.number}</p>
<button onclick={rerunLoadFunction}>Update random number</button>
```

### When do load functions rerun?

To summarize, a `load` function will rerun in the following situations:

- It references a property of `params` whose value has changed
- It references a property of `url` (such as `url.pathname` or `url.search`) whose value has changed. Properties in `request.url` are _not_ tracked
- It calls `url.searchParams.get(...)`, `url.searchParams.getAll(...)` or `url.searchParams.has(...)` and the parameter in question changes. Accessing other properties of `url.searchParams` will have the same effect as accessing `url.search`.
- It calls `await parent()` and a parent `load` function reran
- A child `load` function calls `await parent()` and is rerunning, and the parent is a server load function
- It declared a dependency on a specific URL via [`fetch`](#Making-fetch-requests) (universal load only) or [`depends`](@sveltejs-kit#LoadEvent), and that URL was marked invalid with [`invalidate(url)`]($app-navigation#invalidate)
- All active `load` functions were forcibly rerun with [`invalidateAll()`]($app-navigation#invalidateAll)

`params` and `url` can change in response to a `<a href="..">` link click, a [`<form>` interaction](form-actions#GET-vs-POST), a [`goto`]($app-navigation#goto) invocation, or a [`redirect`](@sveltejs-kit#redirect).

Note that rerunning a `load` function will update the `data` prop inside the corresponding `+layout.svelte` or `+page.svelte`; it does _not_ cause the component to be recreated. As a result, internal state is preserved. If this isn't what you want, you can reset whatever you need to reset inside an [`afterNavigate`]($app-navigation#afterNavigate) callback, and/or wrap your component in a [`{#key ...}`](../svelte/key) block.

## Implications for authentication

A couple features of loading data have important implications for auth checks:
- Layout `load` functions do not run on every request, such as during client side navigation between child routes. [(When do load functions rerun?)](load#Rerunning-load-functions-When-do-load-functions-rerun)
- Layout and page `load` functions run concurrently unless `await parent()` is called. If a layout `load` throws, the page `load` function runs, but the client will not receive the returned data.

There are a few possible strategies to ensure an auth check occurs before protected code.

To prevent data waterfalls and preserve layout `load` caches:
- Use [hooks](hooks) to protect multiple routes before any `load` functions run
- Use auth guards directly in `+page.server.js` `load` functions for route specific protection

Putting an auth guard in `+layout.server.js` requires all child pages to call `await parent()` before protected code. Unless every child page depends on returned data from `await parent()`, the other options will be more performant.

## Using `getRequestEvent`

When running server `load` functions, the `event` object passed to the function as an argument can also be retrieved with [`getRequestEvent`]($app-server#getRequestEvent). This allows shared logic (such as authentication guards) to access information about the current request without it needing to be passed around.

For example, you might have a function that requires users to be logged in, and redirects them to `/login` if not:

```js
/// file: src/lib/server/auth.js
// @filename: ambient.d.ts
interface User {
	name: string;
}

declare namespace App {
	interface Locals {
		user?: User;
	}
}

// @filename: index.ts
// ---cut---
import { redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';

export function requireLogin() {
	const { locals, url } = getRequestEvent();

	// assume `locals.user` is populated in `handle`
	if (!locals.user) {
		const redirectTo = url.pathname + url.search;
		const params = new URLSearchParams({ redirectTo });

		redirect(303, `/login?${params}`);
	}

	return locals.user;
}
```

Now, you can call `requireLogin` in any `load` function (or [form action](form-actions), for example) to guarantee that the user is logged in:

```js
/// file: +page.server.js
// @filename: ambient.d.ts

declare module '$lib/server/auth' {
	interface User {
		name: string;
	}

	export function requireLogin(): User;
}

// @filename: index.ts
// ---cut---
import { requireLogin } from '$lib/server/auth';

export function load() {
	const user = requireLogin();

	// `user` is guaranteed to be a user object here, because otherwise
	// `requireLogin` would throw a redirect and we wouldn't get here
	return {
		message: `hello ${user.name}!`
	};
}
```

## Further reading

- [Tutorial: Loading data](/tutorial/kit/page-data)
- [Tutorial: Errors and redirects](/tutorial/kit/error-basics)
- [Tutorial: Advanced loading](/tutorial/kit/await-parent)

---

## $app/navigation

```js
// @noErrors
import {
	afterNavigate,
	beforeNavigate,
	disableScrollHandling,
	goto,
	invalidate,
	invalidateAll,
	onNavigate,
	preloadCode,
	preloadData,
	pushState,
	refreshAll,
	replaceState
} from '$app/navigation';
```

## afterNavigate

A lifecycle function that runs the supplied `callback` when the current component mounts, and also whenever we navigate to a URL.

`afterNavigate` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```dts
function afterNavigate(
	callback: (
		navigation: import('@sveltejs/kit').AfterNavigate
	) => void
): void;
```

</div>



## beforeNavigate

A navigation interceptor that triggers before we navigate to a URL, whether by clicking a link, calling `goto(...)`, or using the browser back/forward controls.

Calling `cancel()` will prevent the navigation from completing. If `navigation.type === 'leave'` — meaning the user is navigating away from the app (or closing the tab) — calling `cancel` will trigger the native browser unload confirmation dialog. In this case, the navigation may or may not be cancelled depending on the user's response.

When a navigation isn't to a SvelteKit-owned route (and therefore controlled by SvelteKit's client-side router), `navigation.to.route.id` will be `null`.

If the navigation will (if not cancelled) cause the document to unload — in other words `'leave'` navigations and `'link'` navigations where `navigation.to.route === null` — `navigation.willUnload` is `true`.

`beforeNavigate` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```dts
function beforeNavigate(
	callback: (
		navigation: import('@sveltejs/kit').BeforeNavigate
	) => void
): void;
```

</div>



## disableScrollHandling

If called when the page is being updated following a navigation (in `onMount` or `afterNavigate` or an action, for example), this disables SvelteKit's built-in scroll handling.
This is generally discouraged, since it breaks user expectations.

<div class="ts-block">

```dts
function disableScrollHandling(): void;
```

</div>



## goto

Allows you to navigate programmatically to a given route, with options such as keeping the current element focused.
Returns a Promise that resolves when SvelteKit navigates (or fails to navigate, in which case the promise rejects) to the specified `url`.

For external URLs, use `window.location = url` instead of calling `goto(url)`.

<div class="ts-block">

```dts
function goto(
	url: string | URL,
	opts?: {
		replaceState?: boolean | undefined;
		noScroll?: boolean | undefined;
		keepFocus?: boolean | undefined;
		invalidateAll?: boolean | undefined;
		invalidate?:
			| (string | URL | ((url: URL) => boolean))[]
			| undefined;
		state?: App.PageState | undefined;
	}
): Promise<void>;
```

</div>



## invalidate

Causes any `load` functions belonging to the currently active page to re-run if they depend on the `url` in question, via `fetch` or `depends`. Returns a `Promise` that resolves when the page is subsequently updated.

If the argument is given as a `string` or `URL`, it must resolve to the same URL that was passed to `fetch` or `depends` (including query parameters).
To create a custom identifier, use a string beginning with `[a-z]+:` (e.g. `custom:state`) — this is a valid URL.

The `function` argument can be used define a custom predicate. It receives the full `URL` and causes `load` to rerun if `true` is returned.
This can be useful if you want to invalidate based on a pattern instead of a exact match.

```ts
// Example: Match '/path' regardless of the query parameters
import { invalidate } from '$app/navigation';

invalidate((url) => url.pathname === '/path');
```

<div class="ts-block">

```dts
function invalidate(
	resource: string | URL | ((url: URL) => boolean)
): Promise<void>;
```

</div>



## invalidateAll

Causes all `load` and `query` functions belonging to the currently active page to re-run. Returns a `Promise` that resolves when the page is subsequently updated.

<div class="ts-block">

```dts
function invalidateAll(): Promise<void>;
```

</div>



## onNavigate

A lifecycle function that runs the supplied `callback` immediately before we navigate to a new URL except during full-page navigations.

If you return a `Promise`, SvelteKit will wait for it to resolve before completing the navigation. This allows you to — for example — use `document.startViewTransition`. Avoid promises that are slow to resolve, since navigation will appear stalled to the user.

If a function (or a `Promise` that resolves to a function) is returned from the callback, it will be called once the DOM has updated.

`onNavigate` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```dts
function onNavigate(
	callback: (
		navigation: import('@sveltejs/kit').OnNavigate
	) => MaybePromise<(() => void) | void>
): void;
```

</div>



## preloadCode

Programmatically imports the code for routes that haven't yet been fetched.
Typically, you might call this to speed up subsequent navigation.

You can specify routes by any matching pathname such as `/about` (to match `src/routes/about/+page.svelte`) or `/blog/*` (to match `src/routes/blog/[slug]/+page.svelte`).

Unlike `preloadData`, this won't call `load` functions.
Returns a Promise that resolves when the modules have been imported.

<div class="ts-block">

```dts
function preloadCode(pathname: string): Promise<void>;
```

</div>



## preloadData

Programmatically preloads the given page, which means
 1. ensuring that the code for the page is loaded, and
 2. calling the page's load function with the appropriate options.

This is the same behaviour that SvelteKit triggers when the user taps or mouses over an `<a>` element with `data-sveltekit-preload-data`.
If the next navigation is to `href`, the values returned from load will be used, making navigation instantaneous.
Returns a Promise that resolves with the result of running the new route's `load` functions once the preload is complete.

<div class="ts-block">

```dts
function preloadData(href: string): Promise<
	| {
			type: 'loaded';
			status: number;
			data: Record<string, any>;
	  }
	| {
			type: 'redirect';
			location: string;
	  }
>;
```

</div>



## pushState

Programmatically create a new history entry with the given `page.state`. To use the current URL, you can pass `''` as the first argument. Used for [shallow routing](/docs/kit/shallow-routing).

<div class="ts-block">

```dts
function pushState(
	url: string | URL,
	state: App.PageState
): void;
```

</div>



## refreshAll

Causes all currently active remote functions to refresh, and all `load` functions belonging to the currently active page to re-run (unless disabled via the option argument).
Returns a `Promise` that resolves when the page is subsequently updated.

<div class="ts-block">

```dts
function refreshAll({
	includeLoadFunctions
}?: {
	includeLoadFunctions?: boolean;
}): Promise<void>;
```

</div>



## replaceState

Programmatically replace the current history entry with the given `page.state`. To use the current URL, you can pass `''` as the first argument. Used for [shallow routing](/docs/kit/shallow-routing).

<div class="ts-block">

```dts
function replaceState(
	url: string | URL,
	state: App.PageState
): void;
```

</div>

---

## Routing

At the heart of SvelteKit is a _filesystem-based router_. The routes of your app — i.e. the URL paths that users can access — are defined by the directories in your codebase:

- `src/routes` is the root route
- `src/routes/about` creates an `/about` route
- `src/routes/blog/[slug]` creates a route with a _parameter_, `slug`, that can be used to load data dynamically when a user requests a page like `/blog/hello-world`

> [!NOTE] You can change `src/routes` to a different directory by editing the [project config](configuration).

Each route directory contains one or more _route files_, which can be identified by their `+` prefix.

We'll introduce these files in a moment in more detail, but here are a few simple rules to help you remember how SvelteKit's routing works:

* All files can run on the server
* All files run on the client except `+server` files
* `+layout` and `+error` files apply to subdirectories as well as the directory they live in

## +page

### +page.svelte

A `+page.svelte` component defines a page of your app. By default, pages are rendered both on the server ([SSR](glossary#SSR)) for the initial request and in the browser ([CSR](glossary#CSR)) for subsequent navigation.

```svelte
<!--- file: src/routes/+page.svelte --->
<h1>Hello and welcome to my site!</h1>
<a href="/about">About my site</a>
```

```svelte
<!--- file: src/routes/about/+page.svelte --->
<h1>About this site</h1>
<p>TODO...</p>
<a href="/">Home</a>
```

> [!NOTE] SvelteKit uses `<a>` elements to navigate between routes, rather than a framework-specific `<Link>` component.

Pages can receive data from `load` functions via the `data` prop.

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1>{data.title}</h1>
<div>{@html data.content}</div>
```

As of 2.24, pages also receive a `params` prop which is typed based on the route parameters. This is particularly useful alongside [remote functions](remote-functions):

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	import { getPost } from '../blog.remote';

	/** @type {import('./$types').PageProps} */
	let { params } = $props();

	const post = $derived(await getPost(params.slug));
</script>

<h1>{post.title}</h1>
<div>{@html post.content}</div>
```

> [!LEGACY]
> `PageProps` was added in 2.16.0. In earlier versions, you had to type the `data` property manually with `PageData` instead, see [$types](#\$types).
>
> In Svelte 4, you'd use `export let data` instead.

### +page.js

Often, a page will need to load some data before it can be rendered. For this, we add a `+page.js` module that exports a `load` function:

```js
/// file: src/routes/blog/[slug]/+page.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	if (params.slug === 'hello-world') {
		return {
			title: 'Hello world!',
			content: 'Welcome to our blog. Lorem ipsum dolor sit amet...'
		};
	}

	error(404, 'Not found');
}
```

This function runs alongside `+page.svelte`, which means it runs on the server during server-side rendering and in the browser during client-side navigation. See [`load`](load) for full details of the API.

As well as `load`, `+page.js` can export values that configure the page's behaviour:

- `export const prerender = true` or `false` or `'auto'`
- `export const ssr = true` or `false`
- `export const csr = true` or `false`

You can find more information about these in [page options](page-options).

### +page.server.js

If your `load` function can only run on the server — for example, if it needs to fetch data from a database or you need to access private [environment variables]($env-static-private) like API keys — then you can rename `+page.js` to `+page.server.js` and change the `PageLoad` type to `PageServerLoad`.

```js
/// file: src/routes/blog/[slug]/+page.server.js

// @filename: ambient.d.ts
declare global {
	const getPostFromDatabase: (slug: string) => {
		title: string;
		content: string;
	}
}

export {};

// @filename: index.js
// ---cut---
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const post = await getPostFromDatabase(params.slug);

	if (post) {
		return post;
	}

	error(404, 'Not found');
}
```

During client-side navigation, SvelteKit will load this data from the server, which means that the returned value must be serializable using [devalue](https://github.com/rich-harris/devalue). See [`load`](load) for full details of the API.

Like `+page.js`, `+page.server.js` can export [page options](page-options) — `prerender`, `ssr` and `csr`.

A `+page.server.js` file can also export _actions_. If `load` lets you read data from the server, `actions` let you write data _to_ the server using the `<form>` element. To learn how to use them, see the [form actions](form-actions) section.

## +error

If an error occurs during `load`, SvelteKit will render a default error page. You can customise this error page on a per-route basis by adding an `+error.svelte` file:

```svelte
<!--- file: src/routes/blog/[slug]/+error.svelte --->
<script>
	import { page } from '$app/state';
</script>

<h1>{page.status}: {page.error.message}</h1>
```

> [!LEGACY]
> `$app/state` was added in SvelteKit 2.12. If you're using an earlier version or are using Svelte 4, use `$app/stores` instead.

SvelteKit will 'walk up the tree' looking for the closest error boundary — if the file above didn't exist it would try `src/routes/blog/+error.svelte` and then `src/routes/+error.svelte` before rendering the default error page. If _that_ fails (or if the error was thrown from the `load` function of the root `+layout`, which sits 'above' the root `+error`), SvelteKit will bail out and render a static fallback error page, which you can customise by creating a `src/error.html` file.

If the error occurs inside a `load` function in `+layout(.server).js`, the closest error boundary in the tree is an `+error.svelte` file _above_ that layout (not next to it).

If no route can be found (404), `src/routes/+error.svelte` (or the default error page, if that file does not exist) will be used.

> [!NOTE] `+error.svelte` is _not_ used when an error occurs inside [`handle`](hooks#Server-hooks-handle) or a [+server.js](#server) request handler.

You can read more about error handling [here](errors).

## +layout

So far, we've treated pages as entirely standalone components — upon navigation, the existing `+page.svelte` component will be destroyed, and a new one will take its place.

But in many apps, there are elements that should be visible on _every_ page, such as top-level navigation or a footer. Instead of repeating them in every `+page.svelte`, we can put them in _layouts_.

### +layout.svelte

To create a layout that applies to every page, make a file called `src/routes/+layout.svelte`. The default layout (the one that SvelteKit uses if you don't bring your own) looks like this...

```svelte
<script>
	let { children } = $props();
</script>

{@render children()}
```

...but we can add whatever markup, styles and behaviour we want. The only requirement is that the component includes a `@render` tag for the page content. For example, let's add a nav bar:

```svelte
<!--- file: src/routes/+layout.svelte --->
<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/settings">Settings</a>
</nav>

{@render children()}
```

If we create pages for `/`, `/about` and `/settings`...

```html
/// file: src/routes/+page.svelte
<h1>Home</h1>
```

```html
/// file: src/routes/about/+page.svelte
<h1>About</h1>
```

```html
/// file: src/routes/settings/+page.svelte
<h1>Settings</h1>
```

...the nav will always be visible, and clicking between the three pages will only result in the `<h1>` being replaced.

Layouts can be _nested_. Suppose we don't just have a single `/settings` page, but instead have nested pages like `/settings/profile` and `/settings/notifications` with a shared submenu (for a real-life example, see [github.com/settings](https://github.com/settings)).

We can create a layout that only applies to pages below `/settings` (while inheriting the root layout with the top-level nav):

```svelte
<!--- file: src/routes/settings/+layout.svelte --->
<script>
	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();
</script>

<h1>Settings</h1>

<div class="submenu">
	{#each data.sections as section}
		<a href="/settings/{section.slug}">{section.title}</a>
	{/each}
</div>

{@render children()}
```

> [!LEGACY]
> `LayoutProps` was added in 2.16.0. In earlier versions, you had to [type the properties manually instead](#\$types).

You can see how `data` is populated by looking at the `+layout.js` example in the next section just below.

By default, each layout inherits the layout above it. Sometimes that isn't what you want - in this case, [advanced layouts](advanced-routing#Advanced-layouts) can help you.

### +layout.js

Just like `+page.svelte` loading data from `+page.js`, your `+layout.svelte` component can get data from a [`load`](load) function in `+layout.js`.

```js
/// file: src/routes/settings/+layout.js
/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		sections: [
			{ slug: 'profile', title: 'Profile' },
			{ slug: 'notifications', title: 'Notifications' }
		]
	};
}
```

If a `+layout.js` exports [page options](page-options) — `prerender`, `ssr` and `csr` — they will be used as defaults for child pages.

Data returned from a layout's `load` function is also available to all its child pages:

```svelte
<!--- file: src/routes/settings/profile/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	console.log(data.sections); // [{ slug: 'profile', title: 'Profile' }, ...]
</script>
```

> [!NOTE] Often, layout data is unchanged when navigating between pages. SvelteKit will intelligently rerun [`load`](load) functions when necessary.

### +layout.server.js

To run your layout's `load` function on the server, move it to `+layout.server.js`, and change the `LayoutLoad` type to `LayoutServerLoad`.

Like `+layout.js`, `+layout.server.js` can export [page options](page-options) — `prerender`, `ssr` and `csr`.

## +server

As well as pages, you can define routes with a `+server.js` file (sometimes referred to as an 'API route' or an 'endpoint'), which gives you full control over the response. Your `+server.js` file exports functions corresponding to HTTP verbs like `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS`, and `HEAD` that take a [`RequestEvent`](@sveltejs-kit#RequestEvent) argument and return a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.

For example we could create an `/api/random-number` route with a `GET` handler:

```js
/// file: src/routes/api/random-number/+server.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
	const min = Number(url.searchParams.get('min') ?? '0');
	const max = Number(url.searchParams.get('max') ?? '1');

	const d = max - min;

	if (isNaN(d) || d < 0) {
		error(400, 'min and max must be numbers, and min must be less than max');
	}

	const random = min + Math.random() * d;

	return new Response(String(random));
}
```

The first argument to `Response` can be a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream), making it possible to stream large amounts of data or create server-sent events (unless deploying to platforms that buffer responses, like AWS Lambda).

You can use the [`error`](@sveltejs-kit#error), [`redirect`](@sveltejs-kit#redirect) and [`json`](@sveltejs-kit#json) methods from `@sveltejs/kit` for convenience (but you don't have to).

If an error is thrown (either `error(...)` or an unexpected error), the response will be a JSON representation of the error or a fallback error page — which can be customised via `src/error.html` — depending on the `Accept` header. The [`+error.svelte`](#error) component will _not_ be rendered in this case. You can read more about error handling [here](errors).

> [!NOTE] When creating an `OPTIONS` handler, note that Vite will inject `Access-Control-Allow-Origin` and `Access-Control-Allow-Methods` headers — these will not be present in production unless you add them.

> [!NOTE] `+layout` files have no effect on `+server.js` files. If you want to run some logic before each request, add it to the server [`handle`](hooks#Server-hooks-handle) hook.

### Receiving data

By exporting `POST`/`PUT`/`PATCH`/`DELETE`/`OPTIONS`/`HEAD` handlers, `+server.js` files can be used to create a complete API:

```svelte
<!--- file: src/routes/add/+page.svelte --->
<script>
	let a = $state(0);
	let b = $state(0);
	let total = $state(0);

	async function add() {
		const response = await fetch('/api/add', {
			method: 'POST',
			body: JSON.stringify({ a, b }),
			headers: {
				'content-type': 'application/json'
			}
		});

		total = await response.json();
	}
</script>

<input type="number" bind:value={a}> +
<input type="number" bind:value={b}> =
{total}

<button onclick={add}>Calculate</button>
```

```js
/// file: src/routes/api/add/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { a, b } = await request.json();
	return json(a + b);
}
```

> [!NOTE] In general, [form actions](form-actions) are a better way to submit data from the browser to the server.

> [!NOTE] If a `GET` handler is exported, a `HEAD` request will return the `content-length` of the `GET` handler's response body.

### Fallback method handler

Exporting the `fallback` handler will match any unhandled request methods, including methods like `MOVE` which have no dedicated export from `+server.js`.

```js
/// file: src/routes/api/add/+server.js
import { json, text } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { a, b } = await request.json();
	return json(a + b);
}

// This handler will respond to PUT, PATCH, DELETE, etc.
/** @type {import('./$types').RequestHandler} */
export async function fallback({ request }) {
	return text(`I caught your ${request.method} request!`);
}
```

> [!NOTE] For `HEAD` requests, the `GET` handler takes precedence over the `fallback` handler.

### Content negotiation

`+server.js` files can be placed in the same directory as `+page` files, allowing the same route to be either a page or an API endpoint. To determine which, SvelteKit applies the following rules:

- `PUT`/`PATCH`/`DELETE`/`OPTIONS` requests are always handled by `+server.js` since they do not apply to pages
- `GET`/`POST`/`HEAD` requests are treated as page requests if the `accept` header prioritises `text/html` (in other words, it's a browser page request), else they are handled by `+server.js`.
- Responses to `GET` requests will include a `Vary: Accept` header, so that proxies and browsers cache HTML and JSON responses separately.

## $types

Throughout the examples above, we've been importing types from a `$types.d.ts` file. This is a file SvelteKit creates for you in a hidden directory if you're using TypeScript (or JavaScript with JSDoc type annotations) to give you type safety when working with your root files.

For example, annotating `let { data } = $props()` with `PageProps` (or `LayoutProps`, for a `+layout.svelte` file) tells TypeScript that the type of `data` is whatever was returned from `load`:

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>
```

> [!NOTE]
> The `PageProps` and `LayoutProps` types, added in 2.16.0, are a shortcut for typing the `data` prop as `PageData` or `LayoutData`, as well as other props, such as `form` for pages, or `children` for layouts. In earlier versions, you had to type these properties manually. For example, for a page:
>
> ```js
> /// file: +page.svelte
> /** @type {{ data: import('./$types').PageData, form: import('./$types').ActionData }} */
> let { data, form } = $props();
> ```
>
> Or, for a layout:
>
> ```js
> /// file: +layout.svelte
> /** @type {{ data: import('./$types').LayoutData, children: Snippet }} */
> let { data, children } = $props();
> ```

In turn, annotating the `load` function with `PageLoad`, `PageServerLoad`, `LayoutLoad` or `LayoutServerLoad` (for `+page.js`, `+page.server.js`, `+layout.js` and `+layout.server.js` respectively) ensures that `params` and the return value are correctly typed.

If you're using VS Code or any IDE that supports the language server protocol and TypeScript plugins then you can omit these types _entirely_! Svelte's IDE tooling will insert the correct types for you, so you'll get type checking without writing them yourself. It also works with our command line tool `svelte-check`.

You can read more about omitting `$types` in our [blog post](/blog/zero-config-type-safety) about it.

## Other files

Any other files inside a route directory are ignored by SvelteKit. This means you can colocate components and utility modules with the routes that need them.

If components and modules are needed by multiple routes, it's a good idea to put them in [`$lib`]($lib).

## Further reading

- [Tutorial: Routing](/tutorial/kit/pages)
- [Tutorial: API routes](/tutorial/kit/get-handlers)
- [Docs: Advanced routing](advanced-routing)

## Assistant

<thinking>
Now I have all the information I need to explain `load()` and `invalidate()` in SvelteKit clearly to the user. Let me write a comprehensive but clear explanation.

The key things to cover:

1. **What `load()` is**: A function you export from `+page.server.js` (or `+page.js`) that runs before the page renders. It fetches data and returns it, which becomes available in your page component as the `data` prop.

2. **`+page.server.js` vs `+page.js`**: The `.server.js` version only runs on the server (access to private env vars, databases). The regular `.js` version runs on both server (SSR) and browser (client-side navigation).


3. **How `data` flows into the page**: Through `$props()` - `let { data } = $props()`

4. **`invalidate()`**: Causes load functions to re-run. Takes a URL or custom identifier. The load function must declare a dependency on that identifier using `depends()`.

5. **`invalidateAll()`**: Reruns all active load functions.

6. **The `depends()` pattern**: How you declare custom dependencies in load functions to make them invalidatable.

7. **File structure**: `+page.svelte`, `+page.server.js`, `+server.js` (API routes)

Now I'm going to put together a practical walkthrough with concrete examples for the skin hub use case.
</thinking>

Great timing to dive into this — it's one of SvelteKit's most powerful features. Let me walk you through it properly.

---

## The file structure first

SvelteKit is **filesystem-based routing**. Every folder inside `src/routes/` is a route, and there are special `+` prefixed files with specific roles:

```/dev/null/structure.txt#L1-8
src/routes/
├── +layout.svelte          ← wraps every page (navbar, etc.)
├── +page.svelte            ← the / homepage
├── players/
│   ├── +page.svelte        ← the /players page
│   └── +page.server.js     ← loads data for /players, server-only
└── api/
    └── players/
        └── +server.js      ← REST-style API endpoint (like Nitro routes)
```

---

## `load()` — how data gets into your pages

You export a `load` function from `+page.server.js`. It runs **on the server** before the page renders, and whatever you return becomes the `data` prop in your `+page.svelte`:

```/dev/null/src/routes/players/+page.server.ts#L1-12
import { ConvexHttpClient } from 'convex/browser';
import { CONVEX_URL } from '$env/static/private';  // private, never in the client
import { api } from '$lib/convex/_generated/api';

const convex = new ConvexHttpClient(CONVEX_URL);

export async function load() {
  const players = await convex.query(api.players.listPlayers);
  return { players };  // ← this becomes `data.players` in the page
}
```

```/dev/null/src/routes/players/+page.svelte#L1-12
<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  // data.players is already loaded, no fetch needed here
</script>

{#each data.players as player}
  <PlayerCard {player} />
{/each}
```

**That's it.** On first visit: SSR runs `load()`, returns HTML with data already in it. On client-side navigation: SvelteKit calls `load()` on the server again, gets fresh data, updates the page. All without you managing any loading state.

---

## `invalidate()` — manually triggering a re-fetch

By default, SvelteKit will re-run `load()` automatically when route params change (e.g. navigating from `/players/1` to `/players/2`). But sometimes you need to tell it "go re-fetch now" — like after you create/delete a player through your API.

The pattern has two parts:

**1. Declare a dependency in `load()` using `depends()`:**

```/dev/null/src/routes/players/+page.server.ts#L1-14
import { ConvexHttpClient } from 'convex/browser';
import { CONVEX_URL } from '$env/static/private';
import { api } from '$lib/convex/_generated/api';

const convex = new ConvexHttpClient(CONVEX_URL);

export async function load({ depends }) {
  depends('app:players');  // ← "this load depends on this key"

  const players = await convex.query(api.players.listPlayers);
  return { players };
}
```

**2. Call `invalidate()` with that key after a mutation:**

```/dev/null/src/routes/players/+page.svelte#L1-24
<script lang="ts">
  import { invalidate } from '$app/navigation';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  async function deletePlayer(id: string) {
    // hits your +server.ts API route (which calls convex.mutation on the server)
    await fetch(`/api/players/${id}`, { method: 'DELETE' });

    // tells SvelteKit: re-run any load() that declared depends('app:players')
    await invalidate('app:players');
    // data.players is now fresh, page updates automatically
  }
</script>

{#each data.players as player}
  <PlayerCard {player} onDelete={() => deletePlayer(player._id)} />
{/each}
```

`invalidate()` is async and resolves **after** the page has updated with fresh data. No manual state updates needed.

There's also `invalidateAll()` if you want to just nuke everything and re-fetch all active load functions on the page at once.

---

## Layouts also have `load()`

Your `+layout.server.js` works the same way, but its data is available to **every child page**. This is useful for things like user auth state:

```/dev/null/src/routes/+layout.server.ts#L1-10
export async function load({ cookies }) {
  const session = cookies.get('session');
  const user = session ? await getUserFromSession(session) : null;

  return { user };  // ← every page can access data.user
}
```

---

## How it maps to your Nuxt project

| Nuxt | SvelteKit |
|---|---|
| `server/api/players/index.get.ts` | `src/routes/api/players/+server.ts` with `GET` handler |
| `server/api/players/index.post.ts` | same file, `POST` handler |
| `useAsyncData` / `useFetch` in pages | `load()` in `+page.server.ts` |
| "refresh after mutation" | `invalidate('app:players')` after the fetch |
| `CONVEX_URL` in Nitro | `CONVEX_URL` from `$env/static/private` in `+page.server.ts` |

The mental model is almost identical to what you already have — it's just that SvelteKit bakes the "fetch data before rendering" step directly into the file convention instead of you calling `useFetch` inside the component.

## User

ok i got the load() and invalidate() functions. im now curious about my using of vueUse and how i would replace that on svelte and also the authentication side of things. currently I use the OAuth with osu! if you see it, and also sync everything in my database all of this to check if the user has a page or not created by me and also the permission to do so. i take care of the JWT and everything so it stays secure. thats my goal, to keep everything secure and on the backend i can check if someone has the authority to do something or not by checking isAdmin for example. I want that same easy of use on sveltekit and i thinkg theres something like remote functions right? would that help me somehow too?

## Assistant

<thinking>
The user is asking about several things:
1. VueUse equivalents in Svelte
2. Authentication (OAuth with osu!, JWT, admin checking)
3. Remote functions in SvelteKit

Let me look at their current auth implementation to understand what they're doing, then I can give good advice about how to replicate it in SvelteKit.
</thinking>

Let me look at your current auth setup before answering so I give you something accurate rather than generic.

**Tool Call: List the `BR_Skins_Hub/server` directory's contents**
Status: Completed

# Folders:
BR_Skins_Hub/server/api
BR_Skins_Hub/server/types
BR_Skins_Hub/server/utils

# Files:
BR_Skins_Hub/server/uploadthing.ts


**Tool Call: List the `BR_Skins_Hub/app` directory's contents**
Status: Completed

# Folders:
BR_Skins_Hub/app/assets
BR_Skins_Hub/app/components
BR_Skins_Hub/app/composables
BR_Skins_Hub/app/middleware
BR_Skins_Hub/app/pages
BR_Skins_Hub/app/stores
BR_Skins_Hub/app/types
BR_Skins_Hub/app/utils

# Files:
BR_Skins_Hub/app/app.config.ts
BR_Skins_Hub/app/app.vue


**Tool Call: List the `BR_Skins_Hub/server/api` directory's contents**
Status: Completed

# Folders:
BR_Skins_Hub/server/api/auth
BR_Skins_Hub/server/api/player
BR_Skins_Hub/server/api/player-skins
BR_Skins_Hub/server/api/players
BR_Skins_Hub/server/api/skins
BR_Skins_Hub/server/api/uploadthing

# Files:
BR_Skins_Hub/server/api/uploadthing.ts


**Tool Call: List the `BR_Skins_Hub/server/utils` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/server/utils/auth.ts
BR_Skins_Hub/server/utils/convex.ts
BR_Skins_Hub/server/utils/getUser.ts
BR_Skins_Hub/server/utils/rateLimit.ts
BR_Skins_Hub/server/utils/requireAdmin.ts


**Tool Call: List the `BR_Skins_Hub/app/middleware` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/app/middleware/auth.global.ts


**Tool Call: List the `BR_Skins_Hub/app/stores` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/app/stores/useDashboardStore.ts


**Tool Call: Read file `server/utils/auth.ts`**
Status: Completed

```json
{
  "Text": "import { SignJWT, jwtVerify } from \"jose\";\nimport type { JwtSessionPayload } from \"~~/server/types/jwt\";\n\nconst secret = new TextEncoder().encode(process.env.JWT_SECRET);\n\nexport async function createToken(osu_id: string | number) {\n  const token = await new SignJWT({ osu_id: Number(osu_id) })\n    .setProtectedHeader({ alg: \"HS256\" })\n    .setExpirationTime(\"7d\")\n    .sign(secret);\n\n  return token;\n}\n\nexport async function verifyToken(token: string): Promise<JwtSessionPayload | null> {\n  try {\n    const { payload } = await jwtVerify(token, secret);\n    return payload as JwtSessionPayload;\n  } catch (err) {\n    return null;\n  }\n}\n"
}
```

**Tool Call: Read file `server/utils/getUser.ts`**
Status: Completed

```json
{
  "Text": "import { verifyToken } from \"./auth\";\nimport type { H3Event } from \"h3\";\n\nexport async function getUser(event: H3Event) {\n  const token = getCookie(event, \"session\");\n\n  if (!token) {\n    return null;\n  }\n\n  try {\n    return await verifyToken(token);\n  } catch (err) {\n    return null;\n  }\n}\n"
}
```

**Tool Call: Read file `server/utils/requireAdmin.ts`**
Status: Completed

```json
{
  "Text": "import type { H3Event } from \"h3\";\n\nfunction getAdminIds(): Set<number> {\n  const raw = process.env.ADMIN_OSU_IDS ?? \"\";\n  return new Set(\n    raw\n      .split(\",\")\n      .map((id) => Number(id.trim()))\n      .filter((id) => !isNaN(id) && id > 0),\n  );\n}\n\nexport function isAdminId(osuId: number): boolean {\n  return getAdminIds().has(osuId);\n}\n\nexport async function requireAdmin(event: H3Event) {\n  const user = await getUser(event);\n\n  if (!user) {\n    throw createError({ statusCode: 401, message: \"Unauthorized\" });\n  }\n\n  if (!isAdminId(user.osu_id)) {\n    throw createError({ statusCode: 403, message: \"Forbidden\" });\n  }\n\n  return user;\n}\n"
}
```

**Tool Call: Read file `app/middleware/auth.global.ts`**
Status: Completed

```json
{
  "Text": "export default defineNuxtRouteMiddleware((to) => {\n  const { isAdmin } = useAuth();\n\n  // If navigating to /dashboard/* and not an admin\n  if (to.path.startsWith(\"/dashboard\") && !isAdmin.value) {\n    return navigateTo(\"/login\");\n  }\n\n  // If navigating to /login while already an admin\n  if (to.path === \"/login\" && isAdmin.value) {\n    return navigateTo(\"/dashboard\");\n  }\n});\n"
}
```

**Tool Call: List the `BR_Skins_Hub/server/api/auth` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/server/api/auth/callback.ts
BR_Skins_Hub/server/api/auth/logout.ts
BR_Skins_Hub/server/api/auth/me.ts


**Tool Call: List the `BR_Skins_Hub/app/composables` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/app/composables/useAppToast.ts
BR_Skins_Hub/app/composables/useAuth.ts
BR_Skins_Hub/app/composables/useDashboardPlayerDraftSave.ts
BR_Skins_Hub/app/composables/useDiscardGuard.ts
BR_Skins_Hub/app/composables/useFuzzyFilter.ts
BR_Skins_Hub/app/composables/useImageUploader.ts
BR_Skins_Hub/app/composables/useLoadMore.ts
BR_Skins_Hub/app/composables/usePlayerSync.ts
BR_Skins_Hub/app/composables/useResettableRef.ts
BR_Skins_Hub/app/composables/useSubmitAction.ts


**Tool Call: Read file `server/api/auth/callback.ts`**
Status: Completed

```json
{
  "Text": "import { api } from \"~~/convex/_generated/api\";\nimport type { OsuTokenResponse } from \"~~/server/types/osu-token\";\nimport type { OsuUser } from \"~~/server/types/me\";\n\nexport default defineEventHandler(async (event) => {\n  const { code } = getQuery(event);\n\n  if (typeof code !== \"string\") {\n    throw createError({ statusCode: 400, message: \"Authorization code is missing\" });\n  }\n\n  const {\n    public: { osuClientId, currentDomain },\n    osuClientSecret,\n  } = useRuntimeConfig();\n\n  // Exchange the authorization code for an access token\n  const { access_token } = await $fetch<OsuTokenResponse>(\"https://osu.ppy.sh/oauth/token\", {\n    method: \"POST\",\n    headers: {\n      Accept: \"application/json\",\n      \"Content-Type\": \"application/x-www-form-urlencoded\",\n    },\n    body: {\n      client_id: osuClientId,\n      client_secret: osuClientSecret,\n      code,\n      grant_type: \"authorization_code\",\n      redirect_uri: `${currentDomain}/api/auth/callback`,\n    },\n  });\n\n  // Use the access token to fetch the user's osu! profile\n  const me = await $fetch<OsuUser>(\"https://osu.ppy.sh/api/v2/me\", {\n    headers: { Authorization: `Bearer ${access_token}` },\n  });\n\n  // Upsert the user in the database and create a session token\n  await convex.mutation(api.auth.upsertUser, { osu_id: me.id, username: me.username });\n\n  const token = await createToken(me.id);\n  setCookie(event, \"session\", token, { httpOnly: true, secure: true, sameSite: \"lax\", path: \"/\" });\n\n  return sendRedirect(event, \"/\");\n});\n"
}
```

**Tool Call: Read file `server/api/auth/logout.ts`**
Status: Completed

```json
{
  "Text": "export default defineEventHandler((event) => {\n  deleteCookie(event, \"session\");\n  return sendRedirect(event, \"/\");\n});\n"
}
```

**Tool Call: Read file `server/api/auth/me.ts`**
Status: Completed

```json
{
  "Text": "import { api } from \"~~/convex/_generated/api\";\n\nexport default defineEventHandler(async (event) => {\n  const user = await getUser(event);\n\n  if (!user) {\n    return { osu_id: -1, isAdmin: false, username: null, avatar_url: null };\n  }\n\n  const authUser = await convex.query(api.auth.getAuthUser, { osu_id: user.osu_id });\n\n  return {\n    osu_id: user.osu_id,\n    isAdmin: isAdminId(user.osu_id),\n    username: authUser?.username ?? null,\n    avatar_url: `https://a.ppy.sh/${user.osu_id}`,\n  };\n});\n"
}
```

**Tool Call: Read file `app/composables/useAuth.ts`**
Status: Completed

```json
{
  "Text": "type AuthUser = {\n  osu_id: number;\n  isAdmin: boolean;\n  username: string | null;\n  avatar_url: string | null;\n};\n\nexport const useAuth = () => {\n  const user = useState<AuthUser | null>(\"auth_user\", () => null);\n\n  const isSignedIn = computed(() => !!user.value && user.value.osu_id !== -1);\n  const isAdmin = computed(() => user.value?.isAdmin === true);\n\n  const fetchUser = async () => {\n    user.value = await $fetch<AuthUser>(\"/api/auth/me\");\n  };\n\n  return { user, isSignedIn, isAdmin, fetchUser };\n};\n"
}
```

## Assistant

<thinking>
Now I have a very clear picture of the entire auth setup. Let me also check the VueUse usage to understand what specific utilities they're using.
</thinking>

**Tool Call: Search files for regex `from ['"]@vueuse`**
Status: Completed

Found 7 matches:

## Matches in BR_Skins_Hub/app/app.vue

### <script lang="ts" setup> › L68-78
```
import type { NavigationMenuItem } from "@nuxt/ui";
import { ICONS } from "./types/icons";
import { useClipboard } from "@vueuse/core";

// ------ External Composables ------
const { isAdmin, user } = useAuth();
const { copy, copied } = useClipboard();

// ------ Lifecycle ------
await callOnce(async () => {
  const { cookie } = useRequestHeaders(["cookie"]);
```

31 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/SkinCard.vue

### <script setup lang="ts"> › L100-110
```
import type { ContextMenuItem } from "@nuxt/ui";
import { formatTimeAgo } from "@vueuse/core";
import { ICONS } from "~/types/icons";
import type { Doc } from "~~/convex/_generated/dataModel";

// ------ Local Types & Defaults ------
type Skin = Doc<"skins">;

// ------ Props & Emits ------
const props = defineProps<{
  skin?: Skin;
```

108 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/PlayerList.vue

### <script lang="ts" setup> › L33-43
```
import { useSorted } from "@vueuse/core";
import { api } from "~~/convex/_generated/api";
import type { Doc } from "~~/convex/_generated/dataModel";
import { ICONS } from "~/types/icons";

// ------ Props & Emits ------
const emit = defineEmits<{
  (e: "request-select", player: Doc<"players">): void;
}>();

// ------ External Composables ------
```

25 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/components/dashboard/SkinList.vue

### <script lang="ts" setup> › L42-52
```
import { useSorted } from "@vueuse/core";
import { api } from "~~/convex/_generated/api";
import { ICONS } from "~/types/icons";

// ------ External Composables ------
const store = useDashboardStore();
const { data: skinsList, isPending: isLoading } = useConvexQuery(api.skins.listSkins);

// ------ Local State ------
const searchQuery = ref("");

```

10 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/pages/index.vue

### <script lang="ts" setup> › L91-101
```
import { useIntersectionObserver } from "@vueuse/core";
import { ICONS } from "~/types/icons";
import { api } from "~~/convex/_generated/api";

// ------ Local Types & Defaults ------
type SortField = "name" | "_creationTime";
type SortDir = "asc" | "desc";

// ------ External Composables ------
const { data: playersList, isPending: isLoadingPlayers } = useConvexQuery(api.players.listPlayers);

```

58 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/pages/player/[playerId].vue

### <script lang="ts" setup> › L121-131
```
import { api } from "~~/convex/_generated/api";
import { useRouteParams } from "@vueuse/router";
import { ICONS } from "~/types/icons";
import Fuse from "fuse.js";
import type { AvatarProps, BadgeProps } from "@nuxt/ui";

// ------ Local Types & Defaults ------
type TabItem = {
  label?: string;
  icon?: string;
  avatar?: AvatarProps;
```

58 lines remaining in ancestor node. Read the file to see all.

## Matches in BR_Skins_Hub/app/pages/skins.vue

### <script lang="ts" setup> › L82-92
```
import { ICONS } from "~/types/icons";
import { api } from "~~/convex/_generated/api";
import { useIntersectionObserver } from "@vueuse/core";

// ------ Local Types & Defaults ------
type SortField = "name" | "_creationTime";
type SortDir = "asc" | "desc";

// ------ External Composables ------
const { isAdmin } = useAuth();
const { data: skinsList, isPending: isLoadingSkins } = useConvexQuery(
```

55 lines remaining in ancestor node. Read the file to see all.


**Tool Call: get-documentation**
Status: Completed

## Hooks

'Hooks' are app-wide functions you declare that SvelteKit will call in response to specific events, giving you fine-grained control over the framework's behaviour.

There are three hooks files, all optional:

- `src/hooks.server.js` — your app's server hooks
- `src/hooks.client.js` — your app's client hooks
- `src/hooks.js` — your app's hooks that run on both the client and server

Code in these modules will run when the application starts up, making them useful for initializing database clients and so on.

## Server hooks

The following hooks can be added to `src/hooks.server.js`:

### handle

This function runs every time the SvelteKit server receives a [request](web-standards#Fetch-APIs-Request) — whether that happens while the app is running, or during [prerendering](page-options#prerender) — and determines the [response](web-standards#Fetch-APIs-Response). It receives an `event` object representing the request and a function called `resolve`, which renders the route and generates a `Response`. This allows you to modify response headers or bodies, or bypass SvelteKit entirely (for implementing routes programmatically, for example).

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	const response = await resolve(event);
	return response;
}
```

> [!NOTE] Requests for static assets — which includes pages that were already prerendered — are _not_ handled by SvelteKit.

If unimplemented, defaults to `({ event, resolve }) => resolve(event)`.

During prerendering, SvelteKit crawls your pages for links and renders each route it finds. Rendering the route invokes the `handle` function (and all other route dependencies, like `load`). If you need to exclude some code from running during this phase, check that the app is not [`building`]($app-environment#building) beforehand.

### locals

To add custom data to the request, which is passed to handlers in `+server.js` and server `load` functions, populate the `event.locals` object, as shown below.

```js
/// file: src/hooks.server.js
// @filename: ambient.d.ts
type User = {
	name: string;
}

declare namespace App {
	interface Locals {
		user: User;
	}
}

const getUserInformation: (cookie: string | void) => Promise<User>;

// @filename: index.js
// ---cut---
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.user = await getUserInformation(event.cookies.get('sessionid'));

	const response = await resolve(event);

	// Note that modifying response headers isn't always safe.
	// Response objects can have immutable headers
	// (e.g. Response.redirect() returned from an endpoint).
	// Modifying immutable headers throws a TypeError.
	// In that case, clone the response or avoid creating a
	// response object with immutable headers.
	response.headers.set('x-custom-header', 'potato');

	return response;
}
```

You can define multiple `handle` functions and execute them with [the `sequence` helper function](@sveltejs-kit-hooks).

`resolve` also supports a second, optional parameter that gives you more control over how the response will be rendered. That parameter is an object that can have the following fields:

- `transformPageChunk(opts: { html: string, done: boolean }): MaybePromise<string | undefined>` — applies custom transforms to HTML. If `done` is true, it's the final chunk. Chunks are not guaranteed to be well-formed HTML (they could include an element's opening tag but not its closing tag, for example) but they will always be split at sensible boundaries such as `%sveltekit.head%` or layout/page components.
- `filterSerializedResponseHeaders(name: string, value: string): boolean` — determines which headers should be included in serialized responses when a `load` function loads a resource with `fetch`. By default, none will be included.
- `preload(input: { type: 'js' | 'css' | 'font' | 'asset', path: string }): boolean` — determines what files should be added to the `<head>` tag to preload it. The method is called with each file that was found at build time while constructing the code chunks — so if you for example have `import './styles.css` in your `+page.svelte`, `preload` will be called with the resolved path to that CSS file when visiting that page. Note that in dev mode `preload` is _not_ called, since it depends on analysis that happens at build time. Preloading can improve performance by downloading assets sooner, but it can also hurt if too much is downloaded unnecessarily. By default, `js` and `css` files will be preloaded. `asset` files are not preloaded at all currently, but we may add this later after evaluating feedback.

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('old', 'new'),
		filterSerializedResponseHeaders: (name) => name.startsWith('x-'),
		preload: ({ type, path }) => type === 'js' || path.includes('/important/')
	});

	return response;
}
```

Note that `resolve(...)` will never throw an error, it will always return a `Promise<Response>` with the appropriate status code. If an error is thrown elsewhere during `handle`, it is treated as fatal, and SvelteKit will respond with a JSON representation of the error or a fallback error page — which can be customised via `src/error.html` — depending on the `Accept` header. You can read more about error handling [here](errors).

### handleFetch

This function allows you to modify (or replace) the result of an [`event.fetch`](load#Making-fetch-requests) call that runs on the server (or during prerendering) inside an endpoint, `load`, `action`, `handle`, `handleError` or `reroute`.

For example, your `load` function might make a request to a public URL like `https://api.yourapp.com` when the user performs a client-side navigation to the respective page, but during SSR it might make sense to hit the API directly (bypassing whatever proxies and load balancers sit between it and the public internet).

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch }) {
	if (request.url.startsWith('https://api.yourapp.com/')) {
		// clone the original request, but change the URL
		request = new Request(
			request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
			request
		);
	}

	return fetch(request);
}
```

Requests made with `event.fetch` follow the browser's credentials model — for same-origin requests, `cookie` and `authorization` headers are forwarded unless the `credentials` option is set to `"omit"`. For cross-origin requests, `cookie` will be included if the request URL belongs to a subdomain of the app — for example if your app is on `my-domain.com`, and your API is on `api.my-domain.com`, cookies will be included in the request.

There is one caveat: if your app and your API are on sibling subdomains — `www.my-domain.com` and `api.my-domain.com` for example — then a cookie belonging to a common parent domain like `my-domain.com` will _not_ be included, because SvelteKit has no way to know which domain the cookie belongs to. In these cases you will need to manually include the cookie using `handleFetch`:

```js
/// file: src/hooks.server.js
// @errors: 2345
/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ event, request, fetch }) {
	if (request.url.startsWith('https://api.my-domain.com/')) {
		request.headers.set('cookie', event.request.headers.get('cookie'));
	}

	return fetch(request);
}
```

### handleValidationError

This hook is called when a remote function is called with an argument that does not match the provided [Standard Schema](https://standardschema.dev/). It must return an object matching the shape of [`App.Error`](types#Error).

Say you have a remote function that expects a string as its argument ...

```js
/// file: todos.remote.js
import * as v from 'valibot';
import { query } from '$app/server';

export const getTodo = query(v.string(), (id) => {
	// implementation...
});
```

...but it is called with something that doesn't match the schema — such as a number (e.g. `await getTodos(1)`) — then validation will fail, the server will respond with a [400 status code](https://http.dog/400), and the function will throw with the message 'Bad Request'.

To customise this message and add additional properties to the error object, implement `handleValidationError`:

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleValidationError} */
export function handleValidationError({ issues }) {
	return {
		message: 'No thank you'
	};
}
```

Be thoughtful about what information you expose here, as the most likely reason for validation to fail is that someone is sending malicious requests to your server.

## Shared hooks

The following can be added to `src/hooks.server.js` _and_ `src/hooks.client.js`:

### handleError

If an [unexpected error](errors#Unexpected-errors) is thrown during loading, rendering, or from an endpoint, this function will be called with the `error`, `event`, `status` code and `message`. This allows for two things:

- you can log the error
- you can generate a custom representation of the error that is safe to show to users, omitting sensitive details like messages and stack traces. The returned value, which defaults to `{ message }`, becomes the value of `page.error`.

For errors thrown from your code (or library code called by your code) the status will be 500 and the message will be "Internal Error". While `error.message` may contain sensitive information that should not be exposed to users, `message` is safe (albeit meaningless to the average user).

To add more information to the `page.error` object in a type-safe way, you can customize the expected shape by declaring an `App.Error` interface (which must include `message: string`, to guarantee sensible fallback behavior). This allows you to — for example — append a tracking ID for users to quote in correspondence with your technical support staff:

```ts
/// file: src/app.d.ts
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId: string;
		}
	}
}

export {};
```

```js
/// file: src/hooks.server.js
// @errors: 2322 2353
// @filename: ambient.d.ts
declare module '@sentry/sveltekit' {
	export const init: (opts: any) => void;
	export const captureException: (error: any, opts: any) => void;
}

// @filename: index.js
// ---cut---
import * as Sentry from '@sentry/sveltekit';

Sentry.init({/*...*/})

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event, status, message }) {
	const errorId = crypto.randomUUID();

	// example integration with https://sentry.io/
	Sentry.captureException(error, {
		extra: { event, errorId, status }
	});

	return {
		message: 'Whoops!',
		errorId
	};
}
```

```js
/// file: src/hooks.client.js
// @errors: 2322 2353
// @filename: ambient.d.ts
declare module '@sentry/sveltekit' {
	export const init: (opts: any) => void;
	export const captureException: (error: any, opts: any) => void;
}

// @filename: index.js
// ---cut---
import * as Sentry from '@sentry/sveltekit';

Sentry.init({/*...*/})

/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event, status, message }) {
	const errorId = crypto.randomUUID();

	// example integration with https://sentry.io/
	Sentry.captureException(error, {
		extra: { event, errorId, status }
	});

	return {
		message: 'Whoops!',
		errorId
	};
}
```

> [!NOTE] In `src/hooks.client.js`, the type of `handleError` is `HandleClientError` instead of `HandleServerError`, and `event` is a `NavigationEvent` rather than a `RequestEvent`.

This function is not called for _expected_ errors (those thrown with the [`error`](@sveltejs-kit#error) function imported from `@sveltejs/kit`).

During development, if an error occurs because of a syntax error in your Svelte code, the passed in error has a `frame` property appended highlighting the location of the error.

> [!NOTE] Make sure that `handleError` _never_ throws an error

### init

This function runs once, when the server is created or the app starts in the browser, and is a useful place to do asynchronous work such as initializing a database connection.

> [!NOTE] If your environment supports top-level await, the `init` function is really no different from writing your initialisation logic at the top level of the module, but some environments — most notably, Safari — don't.

```js
// @errors: 2307
/// file: src/hooks.server.js
import * as db from '$lib/server/database';

/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
	await db.connect();
}
```

> [!NOTE]
> In the browser, asynchronous work in `init` will delay hydration, so be mindful of what you put in there.

## Universal hooks

The following can be added to `src/hooks.js`. Universal hooks run on both server and client (not to be confused with shared hooks, which are environment-specific).

### reroute

This function runs before `handle` and allows you to change how URLs are translated into routes. The returned pathname (which defaults to `url.pathname`) is used to select the route and its parameters.

For example, you might have a `src/routes/[[lang]]/about/+page.svelte` page, which should be accessible as `/en/about` or `/de/ueber-uns` or `/fr/a-propos`. You could implement this with `reroute`:

```js
// @errors: 2345 2304
/// file: src/hooks.js

/** @type {Record<string, string>} */
const translated = {
	'/en/about': '/en/about',
	'/de/ueber-uns': '/de/about',
	'/fr/a-propos': '/fr/about',
};

/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
	if (url.pathname in translated) {
		return translated[url.pathname];
	}
}
```

The `lang` parameter will be correctly derived from the returned pathname.

Using `reroute` will _not_ change the contents of the browser's address bar, or the value of `event.url`.

Since version 2.18, the `reroute` hook can be asynchronous, allowing it to (for example) fetch data from your backend to decide where to reroute to. Use this carefully and make sure it's fast, as it will delay navigation otherwise. If you need to fetch data, use the `fetch` provided as an argument. It has the [same benefits](load#Making-fetch-requests) as the `fetch` provided to `load` functions, with the caveat that `params` and `id` are unavailable to [`handleFetch`](#Server-hooks-handleFetch) because the route is not yet known.

```js
// @errors: 2345 2304
/// file: src/hooks.js

/** @type {import('@sveltejs/kit').Reroute} */
export async function reroute({ url, fetch }) {
	// Ask a special endpoint within your app about the destination
	if (url.pathname === '/api/reroute') return;

	const api = new URL('/api/reroute', url);
	api.searchParams.set('pathname', url.pathname);

	const result = await fetch(api).then(r => r.json());
	return result.pathname;
}
```


> [!NOTE] `reroute` is considered a pure, idempotent function. As such, it must always return the same output for the same input and not have side effects. Under these assumptions, SvelteKit caches the result of `reroute` on the client so it is only called once per unique URL.

### transport

This is a collection of _transporters_, which allow you to pass custom types — returned from `load` and form actions — across the server/client boundary. Each transporter contains an `encode` function, which encodes values on the server (or returns a falsy value for anything that isn't an instance of the type) and a corresponding `decode` function:

```js
// @errors: 2307
/// file: src/hooks.js
import { Vector } from '$lib/math';

/** @type {import('@sveltejs/kit').Transport} */
export const transport = {
	Vector: {
		encode: (value) => value instanceof Vector && [value.x, value.y],
		decode: ([x, y]) => new Vector(x, y)
	}
};
```


## Further reading

- [Tutorial: Hooks](/tutorial/kit/handle)

---

## Remote functions

<blockquote class="since note">
	<p>Available since 2.27</p>
</blockquote>

Remote functions are a tool for type-safe communication between client and server. They can be _called_ anywhere in your app, but always _run_ on the server, meaning they can safely access [server-only modules](server-only-modules) containing things like environment variables and database clients.

Combined with Svelte's experimental support for [`await`](/docs/svelte/await-expressions), it allows you to load and manipulate data directly inside your components.

This feature is currently experimental, meaning it is likely to contain bugs and is subject to change without notice. You must opt in by adding the `compilerOptions.experimental.async` and `kit.experimental.remoteFunctions` options in your `svelte.config.js`:

```js
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		experimental: {
			+++remoteFunctions: true+++
		}
	},
	compilerOptions: {
		experimental: {
			+++async: true+++
		}
	}
};

export default config;
```

## Overview

Remote functions are exported from a `.remote.js` or `.remote.ts` file, and come in four flavours: `query`, `form`, `command` and `prerender`. On the client, the exported functions are transformed to `fetch` wrappers that invoke their counterparts on the server via a generated HTTP endpoint. Remote files can be placed anywhere in your `src` directory (except inside the `src/lib/server` directory), and third party libraries can provide them, too.

## query

The `query` function allows you to read dynamic data from the server (for _static_ data, consider using [`prerender`](#prerender) instead):

```js
/// file: src/routes/blog/data.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}
// @filename: index.js
// ---cut---
import { query } from '$app/server';
import * as db from '$lib/server/database';

export const getPosts = query(async () => {
	const posts = await db.sql`
		SELECT title, slug
		FROM post
		ORDER BY published_at
		DESC
	`;

	return posts;
});
```

> [!NOTE] Throughout this page, you'll see imports from fictional modules like `$lib/server/database` and `$lib/server/auth`. These are purely for illustrative purposes — you can use whatever database client and auth setup you like.
>
> The `db.sql` function above is a [tagged template function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) that escapes any interpolated values.

The query returned from `getPosts` works as a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to `posts`:

```svelte
<!--- file: src/routes/blog/+page.svelte --->
<script>
	import { getPosts } from './data.remote';
</script>

<h1>Recent posts</h1>

<ul>
	{#each await getPosts() as { title, slug }}
		<li><a href="/blog/{slug}">{title}</a></li>
	{/each}
</ul>
```

Until the promise resolves — and if it errors — the nearest [`<svelte:boundary>`](../svelte/svelte-boundary) will be invoked.

While using `await` is recommended, as an alternative the query also has `loading`, `error` and `current` properties:

```svelte
<!--- file: src/routes/blog/+page.svelte --->
<script>
	import { getPosts } from './data.remote';

	const query = getPosts();
</script>

<h1>Recent posts</h1>

{#if query.error}
	<p>oops!</p>
{:else if query.loading}
	<p>loading...</p>
{:else}
	<ul>
		{#each query.current as { title, slug }}
			<li><a href="/blog/{slug}">{title}</a></li>
		{/each}
	</ul>
{/if}
```

> [!NOTE] For the rest of this document, we'll use the `await` form.

### Query arguments

Query functions can accept an argument, such as the `slug` of an individual post:

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	import { getPost } from '../data.remote';

	let { params } = $props();

	const post = $derived(await getPost(params.slug));
</script>

<h1>{post.title}</h1>
<div>{@html post.content}</div>
```

Since `getPost` exposes an HTTP endpoint, it's important to validate this argument to be sure that it's the correct type. For this, we can use any [Standard Schema](https://standardschema.dev/) validation library such as [Zod](https://zod.dev/) or [Valibot](https://valibot.dev/):

```js
/// file: src/routes/blog/data.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}
// @filename: index.js
// ---cut---
import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query } from '$app/server';
import * as db from '$lib/server/database';

export const getPosts = query(async () => { /* ... */ });

export const getPost = query(v.string(), async (slug) => {
	const [post] = await db.sql`
		SELECT * FROM post
		WHERE slug = ${slug}
	`;

	if (!post) error(404, 'Not found');
	return post;
});
```

Both the argument and the return value are serialized with [devalue](https://github.com/sveltejs/devalue), which handles types like `Date` and `Map` (and custom types defined in your [transport hook](hooks#Universal-hooks-transport)) in addition to JSON.

> [!NOTE] For `query` and `prerender` arguments (but not return values), objects, maps, and sets are sorted so that instances with the same members result in the same cache key. For example, `getPosts({ limit: 10, offset: 10 })` and `getPosts({ offset: 10, limit: 10 })` will result in the same cache key. If order is important to you, you'll have to use an array.

### Deduplication

When you call a query function, SvelteKit serializes the argument you call it with and uses it as a cache key. On the server, this is used to create a request-scoped cache so that multiple invocations of the same query only result in the work happening once. On the client, SvelteKit does something similar: Multiple identical invocations of a query all point to the same instance.

To prevent memory leaks, this instance is kept cached only as long as it is actively used on the page in a _reactive context_, which means it must be created in a [derived](../svelte/$derived), [effect](../svelte/$effect) or component template. In practice, you're most likely to run into this limitation in universal `load` functions, event handlers, or when trying to access a query's data during module initialization.

To illustrate:

```svelte
<script>
  import { getData } from './data.remote.js';

	// this instance is "anchored" to the reactive context of this component
	const data = getData();
</script>

<!--
	Awaiting `data` in a non-reactive context is valid, because it's anchored
	and will be cleaned up when this component is cleaned up.
-->
<button onclick={async () => console.log(await data)}>
	click me!
</button>

<!--
	This, however, will throw, because `getData` isn't anchored to any reactive context.
-->
<button onclick={async () => console.log(await getData())}>
	don't click me!
</button>
```

This limitation only applies to accessing the _data_ of a query by `await`ing it or trying to access its properties. If all you need is one-off access to the query's data, you can call `query.run`:

```svelte
<script>
  import { getData } from './data.remote.js';
</script>

<!-- This bypasses the cache and runs the query directly, returning a plain old Promise<T> -->
<button onclick={async () => console.log(await getData().run())}>
	click me!
</button>
```

You can also still call [`refresh`](#query-Refreshing-queries) and `set` in non-reactive contexts. If there are no active listeners to the query, they both result in no-ops.

### Refreshing queries

Any query can be re-fetched via its `refresh` method, which retrieves the latest value from the server:

```svelte
<button onclick={() => getPosts().refresh()}>
	Check for new posts
</button>
```

> [!NOTE] Queries are cached while they're on the page, meaning `getPosts() === getPosts()`. This means you don't need a reference like `const posts = getPosts()` in order to update the query.

## query.batch

`query.batch` works like `query` except that it batches requests that happen within the same macrotask. This solves the so-called n+1 problem: rather than each query resulting in a separate database call (for example), simultaneous queries are grouped together.

On the server, the callback receives an array of the arguments the function was called with. It must return a function of the form `(input: Input, index: number) => Output`. SvelteKit will then call this with each of the input arguments to resolve the individual calls with their results.

```js
/// file: weather.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}
// @filename: index.js
// ---cut---
import * as v from 'valibot';
import { query } from '$app/server';
import * as db from '$lib/server/database';

export const getWeather = query.batch(v.string(), async (cityIds) => {
	const weather = await db.sql`
		SELECT * FROM weather
		WHERE city_id = ANY(${cityIds})
	`;
	const lookup = new Map(weather.map(w => [w.city_id, w]));

	return (cityId) => lookup.get(cityId);
});
```

```svelte
<!--- file: Weather.svelte --->
<script>
	import CityWeather from './CityWeather.svelte';
	import { getWeather } from './weather.remote';

	let { cities } = $props();
	let limit = $state(5);
</script>

<h2>Weather</h2>

{#each cities.slice(0, limit) as city}
	<h3>{city.name}</h3>
	<CityWeather weather={await getWeather(city.id)} />
{/each}

{#if cities.length > limit}
	<button onclick={() => limit += 5}>
		Load more
	</button>
{/if}
```

## form

The `form` function makes it easy to write data to the server. It takes a callback that receives `data` constructed from the submitted [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)...

```ts
/// file: src/routes/blog/data.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}

declare module '$lib/server/auth' {
	interface User {
		name: string;
	}

	/**
	 * Gets a user's info from their cookies, using `getRequestEvent`
	 */
	export function getUser(): Promise<User | null>;
}
// @filename: index.js
// ---cut---
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { query, form } from '$app/server';
import * as db from '$lib/server/database';
import * as auth from '$lib/server/auth';

export const getPosts = query(async () => { /* ... */ });

export const getPost = query(v.string(), async (slug) => { /* ... */ });

export const createPost = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content:v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ title, content }) => {
		// Check the user is logged in
		const user = await auth.getUser();
		if (!user) error(401, 'Unauthorized');

		const slug = title.toLowerCase().replace(/ /g, '-');

		// Insert into the database
		await db.sql`
			INSERT INTO post (slug, title, content)
			VALUES (${slug}, ${title}, ${content})
		`;

		// Redirect to the newly created page
		redirect(303, `/blog/${slug}`);
	}
);
```

...and returns an object that can be spread onto a `<form>` element. The callback is called whenever the form is submitted.

```svelte
<!--- file: src/routes/blog/new/+page.svelte --->
<script>
	import { createPost } from '../data.remote';
</script>

<h1>Create a new post</h1>

<form {...createPost}>
	<!-- form content goes here -->

	<button>Publish!</button>
</form>
```

The form object contains `method` and `action` properties that allow it to work without JavaScript (i.e. it submits data and reloads the page). It also has an [attachment](/docs/svelte/@attach) that progressively enhances the form when JavaScript is available, submitting data *without* reloading the entire page.

As with `query`, if the callback uses the submitted `data`, it should be [validated](#query-Query-arguments) by passing a [Standard Schema](https://standardschema.dev) as the first argument to `form`.

### Fields

A form is composed of a set of _fields_, which are defined by the schema. In the case of `createPost`, we have two fields, `title` and `content`, which are both strings. To get the attributes for a field, call its `.as(...)` method, specifying which [input type](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#input_types) to use. For most input types, you can also pass a second argument — `.as(type, value)` — to control the rendered value:

```svelte
<form {...createPost}>
	<label>
		<h2>Title</h2>
		+++<input {...createPost.fields.title.as('text')} />+++
	</label>

	<label>
		<h2>Write your post</h2>
		+++<textarea {...createPost.fields.content.as('text')}></textarea>+++
	</label>

	<button>Publish!</button>
</form>
```

These attributes allow SvelteKit to set the correct input type, set a `name` that is used to construct the `data` passed to the handler, populate the `value` of the form (for example following a failed submission, to save the user having to re-enter everything), and set the [`aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid) state.

Passing a second argument to `.as(...)` is useful when rendering a form from existing data, such as an edit form or multiple instances created with [`for(...)`](#form-Multiple-instances-of-a-form). `radio`, `submit` and `hidden` inputs always need this value, and `checkbox` inputs need it when they represent one option in an array field. `file` inputs cannot be populated this way.

> [!NOTE] The generated `name` attribute uses JS object notation (e.g. `nested.array[0].value`). String keys that require quotes such as `object['nested-array'][0].value` are not supported. Under the hood, boolean checkbox and number field names are prefixed with `b:` and `n:`, respectively, to signal SvelteKit to coerce the values from strings prior to validation.

Fields can be nested in objects and arrays, and their values can be strings, numbers, booleans or `File` objects. For example, if your schema looked like this...

```js
/// file: data.remote.js
import * as v from 'valibot';
import { form } from '$app/server';
// ---cut---
const datingProfile = v.object({
	name: v.string(),
	photo: v.file(),
	info: v.object({
		height: v.number(),
		likesDogs: v.optional(v.boolean(), false)
	}),
	attributes: v.array(v.string())
});

export const createProfile = form(datingProfile, (data) => { /* ... */ });
```

...your form could look like this:

```svelte
<script>
	import { createProfile } from './data.remote';

	const { name, photo, info, attributes } = createProfile.fields;
</script>

<form {...createProfile} enctype="multipart/form-data">
	<label>
		<input {...name.as('text')} /> Name
	</label>

	<label>
		<input {...photo.as('file')} /> Photo
	</label>

	<label>
		<input {...info.height.as('number')} /> Height (cm)
	</label>

	<label>
		<input {...info.likesDogs.as('checkbox')} /> I like dogs
	</label>

	<h2>My best attributes</h2>
	<input {...attributes[0].as('text')} />
	<input {...attributes[1].as('text')} />
	<input {...attributes[2].as('text')} />

	<button>submit</button>
</form>
```

Because our form contains a `file` input, we've added an `enctype="multipart/form-data"` attribute. The values for `info.height` and `info.likesDogs` are coerced to a number and a boolean respectively.

> [!NOTE] If a `checkbox` input is unchecked, the value is not included in the [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object that SvelteKit constructs the data from. As such, we have to make the value optional in our schema. In Valibot that means using `v.optional(v.boolean(), false)` instead of just `v.boolean()`, whereas in Zod it would mean using `z.coerce.boolean<boolean>()`.

In the case of `radio` and `checkbox` inputs that all belong to the same field, the `value` must be specified as a second argument to `.as(...)`:

```js
/// file: constants.js
export const operatingSystems = /** @type {const} */ (['windows', 'mac', 'linux']);
export const languages = /** @type {const} */ (['html', 'css', 'js']);
```

```js
/// file: data.remote.js
// @filename: constants.js
export const operatingSystems = /** @type {const} */ (['windows', 'mac', 'linux']);
export const languages = /** @type {const} */ (['html', 'css', 'js']);
// @filename: index.js
import * as v from 'valibot';
import { form } from '$app/server';
// ---cut---
import { operatingSystems, languages } from './constants';

export const survey = form(
	v.object({
		operatingSystem: v.picklist(operatingSystems),
		languages: v.optional(v.array(v.picklist(languages)), []),
	}),
	(data) => { /* ... */ },
);
```

```svelte
<form {...survey}>
	<h2>Which operating system do you use?</h2>

	{#each operatingSystems as os}
		<label>
			<input {...survey.fields.operatingSystem.as('radio', os)}>
			{os}
		</label>
	{/each}

	<h2>Which languages do you write code in?</h2>

	{#each languages as language}
		<label>
			<input {...survey.fields.languages.as('checkbox', language)}>
			{language}
		</label>
	{/each}

	<button>submit</button>
</form>
```

Alternatively, you could use `select` and `select multiple`:

```svelte
<form {...survey}>
	<h2>Which operating system do you use?</h2>

	<select {...survey.fields.operatingSystem.as('select')}>
		{#each operatingSystems as os}
			<option>{os}</option>
		{/each}
	</select>

	<h2>Which languages do you write code in?</h2>

	<select {...survey.fields.languages.as('select multiple')}>
		{#each languages as language}
			<option>{language}</option>
		{/each}
	</select>

	<button>submit</button>
</form>
```

> [!NOTE] As with unchecked `checkbox` inputs, if no selections are made then the data will be `undefined`. For this reason, the `languages` field uses `v.optional(v.array(...), [])` rather than just `v.array(...)`.

### Programmatic validation

In addition to declarative schema validation, you can programmatically mark fields as invalid inside the form handler using the `invalid` helper from `@sveltejs/kit`. This is useful for cases where you can't know if something is valid until you try to perform some action.

- It throws just like `redirect` or `error`
- It accepts multiple arguments that can be strings (for issues relating to the form as a whole — these will only show up in `fields.allIssues()`) or standard-schema-compliant issues (for those relating to a specific field). Use the `issue` parameter for type-safe creation of such issues:

```js
// @errors: 18046
/// file: src/routes/shop/data.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function buy(qty: number): Promise<void>
}
// @filename: index.js
// ---cut---
import * as v from 'valibot';
import { invalid } from '@sveltejs/kit';
import { form } from '$app/server';
import * as db from '$lib/server/database';

export const buyHotcakes = form(
	v.object({
		qty: v.pipe(
			v.number(),
			v.minValue(1, 'you must buy at least one hotcake')
		)
	}),
	async (data, issue) => {
		try {
			await db.buy(data.qty);
		} catch (e) {
			if (e.code === 'OUT_OF_STOCK') {
				invalid(
					issue.qty(`we don't have enough hotcakes`)
				);
			}
		}
	}
);
```

### Validation

If the submitted data doesn't pass the schema, the callback will not run. Instead, each invalid field's `issues()` method will return an array of `{ message: string }` objects, and the `aria-invalid` attribute (returned from `as(...)`) will be set to `true`:

```svelte
<form {...createPost}>
	<label>
		<h2>Title</h2>

+++		{#each createPost.fields.title.issues() as issue}
			<p class="issue">{issue.message}</p>
		{/each}+++

		<input {...createPost.fields.title.as('text')} />
	</label>

	<label>
		<h2>Write your post</h2>

+++		{#each createPost.fields.content.issues() as issue}
			<p class="issue">{issue.message}</p>
		{/each}+++

		<textarea {...createPost.fields.content.as('text')}></textarea>
	</label>

	<button>Publish!</button>
</form>
```

You don't need to wait until the form is submitted to validate the data — you can call `validate()` programmatically, for example in an `oninput` callback (which will validate the data on every keystroke) or an `onchange` callback:

```svelte
<form {...createPost} oninput={() => createPost.validate()}>
	<!-- -->
</form>
```

By default, issues will be ignored if they belong to form controls that haven't yet been interacted with. To validate _all_ inputs, call `validate({ includeUntouched: true })`.

For client-side validation, you can specify a _preflight_ schema which will populate `issues()` and prevent data being sent to the server if the data doesn't validate:

```svelte
<script>
	import * as v from 'valibot';
	import { createPost } from '../data.remote';

	const schema = v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content: v.pipe(v.string(), v.nonEmpty())
	});
</script>

<h1>Create a new post</h1>

<form {...+++createPost.preflight(schema)+++}>
	<!-- -->
</form>
```

> [!NOTE] The preflight schema can be the same object as your server-side schema, if appropriate, though it won't be able to do server-side checks like 'this value already exists in the database'. Note that you cannot export a schema from a `.remote.ts` or `.remote.js` file, so the schema must either be exported from a shared module, or from a `<script module>` block in the component containing the `<form>`.

To get a list of _all_ issues, rather than just those belonging to a single field, you can use the `fields.allIssues()` method:

```svelte
{#each createPost.fields.allIssues() as issue}
	<p>{issue.message}</p>
{/each}
```

### Getting/setting inputs

Each field has a `value()` method that reflects its current value. As the user interacts with the form, it is automatically updated:

```svelte
<form {...createPost}>
	<!-- -->
</form>

<div class="preview">
	<h2>{createPost.fields.title.value()}</h2>
	<div>{@html render(createPost.fields.content.value())}</div>
</div>
```

Alternatively, `createPost.fields.value()` would return a `{ title, content }` object.

You can update a field (or a collection of fields) via the `set(...)` method:

```svelte
<script>
	import { createPost } from '../data.remote';

	// this...
	createPost.fields.set({
		title: 'My new blog post',
		content: 'Lorem ipsum dolor sit amet...'
	});

	// ...is equivalent to this:
	createPost.fields.title.set('My new blog post');
	createPost.fields.content.set('Lorem ipsum dolor sit amet');
</script>
```

### Handling sensitive data

In the case of a non-progressively-enhanced form submission (i.e. where JavaScript is unavailable, for whatever reason) `value()` is also populated if the submitted data is invalid, so that the user does not need to fill the entire form out from scratch.

You can prevent sensitive data (such as passwords and credit card numbers) from being sent back to the user by using a name with a leading underscore:

```svelte
<form {...register}>
	<label>
		Username
		<input {...register.fields.username.as('text')} />
	</label>

	<label>
		Password
		<input +++{...register.fields._password.as('password')}+++ />
	</label>

	<button>Sign up!</button>
</form>
```

In this example, if the data does not validate, only the first `<input>` will be populated when the page reloads.

### Returns and redirects

The example above uses [`redirect(...)`](@sveltejs-kit#redirect), which sends the user to the newly created page. Alternatively, the callback could return data, in which case it would be available as `createPost.result`:

```ts
/// file: src/routes/blog/data.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}

declare module '$lib/server/auth' {
	interface User {
		name: string;
	}

	/**
	 * Gets a user's info from their cookies, using `getRequestEvent`
	 */
	export function getUser(): Promise<User | null>;
}
// @filename: index.js
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { query, form } from '$app/server';
import * as db from '$lib/server/database';
import * as auth from '$lib/server/auth';

export const getPosts = query(async () => { /* ... */ });

export const getPost = query(v.string(), async (slug) => { /* ... */ });

// ---cut---
export const createPost = form(
	v.object({/* ... */}),
	async (data) => {
		// ...

		return { success: true };
	}
);
```

```svelte
<!--- file: src/routes/blog/new/+page.svelte --->
<script>
	import { createPost } from '../data.remote';
</script>

<h1>Create a new post</h1>

<form {...createPost}>
	<!-- -->
</form>

{#if createPost.result?.success}
	<p>Successfully published!</p>
{/if}
```

This value is _ephemeral_ — it will vanish if you resubmit, navigate away, or reload the page.

> [!NOTE] The `result` value need not indicate success — it can also contain validation errors, along with any data that should repopulate the form on page reload.

If an error occurs during submission, the nearest `+error.svelte` page will be rendered.

### enhance

We can customize what happens when the form is submitted with the `enhance` method:

```svelte
<!--- file: src/routes/blog/new/+page.svelte --->
<script>
	import { createPost } from '../data.remote';
	import { showToast } from '$lib/toast';
</script>

<h1>Create a new post</h1>

<form {...createPost.enhance(async ({ form, data, submit }) => {
	try {
		if (await submit()) {
			form.reset();

			showToast('Successfully published!');
		} else {
			showToast('Invalid data!');
		}
	} catch (error) {
		showToast('Oh no! Something went wrong');
	}
})}>
	<!-- -->
</form>
```

> When using `enhance`, the `<form>` is not automatically reset — you must call `form.reset()` if you want to clear the inputs.

The callback receives the `form` element, the `data` it contains, and a `submit` function.

### Multiple instances of a form

Some forms may be repeated as part of a list. In this case you can create separate instances of a form function via `for(id)` to achieve isolation.

When each instance should render different values, pass them as the second argument to `.as(...)`:

```svelte
<!--- file: src/routes/todos/+page.svelte --->
<script>
	import { getTodos, modifyTodo } from '../data.remote';
</script>

<h1>Todos</h1>

{#each await getTodos() as todo}
	{@const modify = modifyTodo.for(todo.id)}
	<form {...modify}>
		<input {...modify.fields.description.as('text', todo.description)} />
		<button disabled={!!modify.pending}>save changes</button>
	</form>
{/each}
```

### Multiple submit buttons

It's possible for a `<form>` to have multiple submit buttons. For example, you might have a single form that allows you to log in or register depending on which button was clicked.

To accomplish this, add a field to your schema for the button value, and use `as('submit', value)` to bind it:

```svelte
<!--- file: src/routes/login/+page.svelte --->
<script>
	import { loginOrRegister } from '$lib/auth';
</script>

<form {...loginOrRegister}>
	<label>
		Your username
		<input {...loginOrRegister.fields.username.as('text')} />
	</label>

	<label>
		Your password
		<input {...loginOrRegister.fields._password.as('password')} />
	</label>

	<button {...loginOrRegister.fields.action.as('submit', 'login')}>login</button>
	<button {...loginOrRegister.fields.action.as('submit', 'register')}>register</button>
</form>
```

In your form handler, you can check which button was clicked:

```js
/// file: $lib/auth.js
import * as v from 'valibot';
import { form } from '$app/server';

export const loginOrRegister = form(
	v.object({
		username: v.string(),
		_password: v.string(),
		action: v.picklist(['login', 'register'])
	}),
	async ({ username, _password, action }) => {
		if (action === 'login') {
			// handle login
		} else {
			// handle registration
		}
	}
);
```

## command

The `command` function, like `form`, allows you to write data to the server. Unlike `form`, it's not specific to an element and can be called from anywhere.

> [!NOTE] Prefer `form` where possible, since it gracefully degrades if JavaScript is disabled or fails to load.

As with `query` and `form`, if the function accepts an argument, it should be [validated](#query-Query-arguments) by passing a [Standard Schema](https://standardschema.dev) as the first argument to `command`.

```ts
/// file: likes.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}
// @filename: index.js
// ---cut---
import * as v from 'valibot';
import { query, command } from '$app/server';
import * as db from '$lib/server/database';

export const getLikes = query(v.string(), async (id) => {
	const [row] = await db.sql`
		SELECT likes
		FROM item
		WHERE id = ${id}
	`;

	return row.likes;
});

export const addLike = command(v.string(), async (id) => {
	await db.sql`
		UPDATE item
		SET likes = likes + 1
		WHERE id = ${id}
	`;
});
```

Now simply call `addLike`, from (for example) an event handler:

```svelte
<!--- file: +page.svelte --->
<script>
	import { getLikes, addLike } from './likes.remote';
	import { showToast } from '$lib/toast';

	let { item } = $props();
</script>

<button
	onclick={async () => {
		try {
			await addLike(item.id);
		} catch (error) {
			showToast('Something went wrong!');
		}
	}}
>
	add like
</button>

<p>likes: {await getLikes(item.id)}</p>
```

> [!NOTE] Commands cannot be called during render.

## Single-flight mutations

The purpose of both [`form`](#form) and [`command`](#command) is *mutating data*. In many cases, mutating data invalidates other data. By default, `form` deals with this by automatically invalidating all queries and load functions following a successful submission, to emulate what would happen with a traditional full-page reload. `command`, on the other hand, does nothing. Typically, neither of these options is going to be the ideal solution — invalidating everything is likely wasteful, as it's unlikely a form submission changed *everything* being displayed on your webpage. In the case of `command`, doing nothing likely *under*-invalidates your app, leaving stale data displayed. In both cases, it's common to have to perform two round-trips to the server: One to run the mutation, and another after that completes to re-request the data from any queries you need to refresh.

SvelteKit solves both of these problems with *single-flight mutations*: Your `form` submission or `command` invocation can refresh queries and pass their results back to the client in a single request.

### Server-driven refreshes

In most circumstances, the server handler knows what client data needs to be updated based on its arguments:

```js
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { query, form } from '$app/server';
const slug = '';
const post = { id: '' };
/** @type {any} */
const externalApi = '';
// ---cut---
export const getPosts = query(async () => { /* ... */ });

export const getPost = query(v.string(), async (slug) => { /* ... */ });

export const createPost = form(
	v.object({/* ... */}),
	async (data) => {
		// form logic goes here...

		// Refresh `getPosts()` on the server, and send
		// the data back with the result of `createPost`
		// it's safe to throw away the promise from `refresh`,
		// as the framework awaits it for us before serving the response
		+++void getPosts().refresh();+++

		// Redirect to the newly created page
		redirect(303, `/blog/${slug}`);
	}
);

export const updatePost = form(
	v.object({ id: v.string() }),
	async (post) => {
		// form logic goes here...
		const result = externalApi.update(post);

		// The API already gives us the updated post,
		// no need to refresh it, we can set it directly
		+++getPost(post.id).set(result);+++
	}
);
```

Because queries are keyed based on their arguments, `await getPost(post.id).set(result)` on the server knows to look up the matching `getPost(id)` on the client to update it. The same goes for `getPosts().refresh()` -- it knows to look up `getPosts()` with no argument on the client.

### Client-requested refreshes

Unfortunately, life isn't always as simple as the preceding example. The server always knows which query _functions_ to update, but it may not know which specific query _instances_ to update. For example, if `getPosts({ filter: 'author:santa' })` is rendered on the client, calling `getPosts().refresh()` in the server handler won't update it. You'd need to call `getPosts({ filter: 'author:santa' }).refresh()` instead — but how could you know which specific combinations of filters are currently rendered on the client, especially if your query argument is more complicated than an object with just one key?

SvelteKit makes this easy by allowing the client to _request_ that the server updates specific data using `submit().updates` (for `form`) or `myCommand().updates` (for `command`):

```ts
import type { RemoteQueryUpdate, RemoteQuery } from '@sveltejs/kit';
interface Post {}
declare function submit(): Promise<any> & {
	updates(...updates: RemoteQueryUpdate[]): Promise<any>;
}

declare function getPosts(args: { filter: string }): RemoteQuery<Post[]>;
declare const newPost: Post;
// ---cut---
await submit().updates(
	// to request all active instances of getPosts
	getPosts,
	// to request a specific instance
	getPosts({ filter: 'author:santa' }),
	// to request a specific instance with an optimistic override
	getPosts({ filter: 'author:santa' }).withOverride((posts) => [newPost, ...posts])
);
```

It's not enough to just request the updates from the client -- you need to accept them from the server as well:

```js
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
const slug = '';
const post = { id: '' };
/** @type {any} */
const externalApi = '';
// ---cut---
import { query, form, requested } from '$app/server';

export const getPosts = query(v.object({ filter: v.string() }), async ({ filter }) => { /* ... */ });

export const createPost = form(
	v.object({/* ... */}),
	async (data) => {
		// form logic goes here...

		+++for (const { query } of requested(getPosts, 1)) {+++
		+++	void query.refresh();+++
		+++}+++

		// Redirect to the newly created page
		redirect(303, `/blog/${slug}`);
	}
);
```

`requested` gives you access to the queries the client requested to refresh. Each entry is an `{ arg, query }` object: `arg` is the value the query's implementation function received — i.e. the argument *after* the schema has validated and (where applicable) transformed it — and `query` is a `RemoteQuery` already bound to the client's original cache key, so calling `query.refresh()` / `query.set(...)` updates the correct client instance. If parsing an argument fails, that query will error, but the entire command will not fail. `requested`'s second parameter, `limit`, is the maximum number of items it will return. Any refresh requests beyond this limit will fail.

> [!NOTE] `limit` is required because the list of refresh requests is controlled by the client — each entry causes the server to validate an argument and usually re-fetch data, so an unbounded list is a denial-of-service risk. Choose a limit that reflects the worst case you're willing to handle per request. You _can_ pass `Infinity` if you have explicitly decided to accept any number of refreshes, but it is not recommended.

Additionally, `requested` allows a simple shorthand when all you want to do is refresh the requested query instances:

```ts
import type { RemoteQueryFunction } from '@sveltejs/kit';
import { requested } from '$app/server';
declare const getPosts: RemoteQueryFunction<any, any>;
// ---cut---
// this is the same as looping over the result and calling `void query.refresh()`.
await requested(getPosts, 1).refreshAll();
```

> [!NOTE] Why does the command have to name every query it's willing to refresh? Two reasons:
>
> - **Bundle size.** If a command could implicitly refresh *any* query in your app, SvelteKit would have to include every query's code in the command's server bundle, because it can't know ahead of time which ones will be called.
> - **Denial-of-service.** Any malicious user can inspect their network tab to discover which queries your app uses, then POST a command with a client-supplied list of thousands of refreshes. The only defence is for the server handler to declare which queries it is willing to refresh — and in what quantity (hence the required `limit`).

## prerender

The `prerender` function is similar to `query`, except that it will be invoked at build time to prerender the result. Use this for data that changes at most once per redeployment.

```js
/// file: src/routes/blog/data.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}
// @filename: index.js
// ---cut---
import { prerender } from '$app/server';
import * as db from '$lib/server/database';

export const getPosts = prerender(async () => {
	const posts = await db.sql`
		SELECT title, slug
		FROM post
		ORDER BY published_at
		DESC
	`;

	return posts;
});
```

You can use `prerender` functions on pages that are otherwise dynamic, allowing for partial prerendering of your data. This results in very fast navigation, since prerendered data can live on a CDN along with your other static assets.

In the browser, prerendered data is saved using the [`Cache`](https://developer.mozilla.org/en-US/docs/Web/API/Cache) API. This cache survives page reloads, and will be cleared when the user first visits a new deployment of your app.

> [!NOTE] When the entire page has `export const prerender = true`, you cannot use queries, as they are dynamic.

### Prerender arguments

As with queries, prerender functions can accept an argument, which should be [validated](#query-Query-arguments) with a [Standard Schema](https://standardschema.dev/):

```js
/// file: src/routes/blog/data.remote.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
}
// @filename: index.js
// ---cut---
import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { prerender } from '$app/server';
import * as db from '$lib/server/database';

export const getPosts = prerender(async () => { /* ... */ });

export const getPost = prerender(v.string(), async (slug) => {
	const [post] = await db.sql`
		SELECT * FROM post
		WHERE slug = ${slug}
	`;

	if (!post) error(404, 'Not found');
	return post;
});
```

Any calls to `getPost(...)` found by SvelteKit's crawler while [prerendering pages](page-options#prerender) will be saved automatically, but you can also specify which values it should be called with using the `inputs` option:

```js
/// file: src/routes/blog/data.remote.js
import * as v from 'valibot';
import { prerender } from '$app/server';
// ---cut---

export const getPost = prerender(
	v.string(),
	async (slug) => { /* ... */ },
	{
		inputs: () => [
			'first-post',
			'second-post',
			'third-post'
		]
	}
);
```

By default, prerender functions are excluded from your server bundle, which means that you cannot call them with any arguments that were _not_ prerendered. You can set `dynamic: true` to change this behaviour:

```js
/// file: src/routes/blog/data.remote.js
import * as v from 'valibot';
import { prerender } from '$app/server';
// ---cut---

export const getPost = prerender(
	v.string(),
	async (slug) => { /* ... */ },
	{
		+++dynamic: true+++,
		inputs: () => [
			'first-post',
			'second-post',
			'third-post'
		]
	}
);
```

## Handling validation errors

As long as _you're_ not passing invalid data to your remote functions, there are only two reasons why the argument passed to a `command`, `query` or `prerender` function would fail validation:

- the function signature changed between deployments, and some users are currently on an older version of your app
- someone is trying to attack your site by poking your exposed endpoints with bad data

In the second case, we don't want to give the attacker any help, so SvelteKit will generate a generic [400 Bad Request](https://http.dog/400) response. You can control the message by implementing the [`handleValidationError`](hooks#Server-hooks-handleValidationError) server hook, which, like [`handleError`](hooks#Shared-hooks-handleError), must return an [`App.Error`](errors#Type-safety) (which defaults to `{ message: string }`):

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleValidationError} */
export function handleValidationError({ event, issues }) {
	return {
		message: 'Nice try, hacker!'
	};
}
```

If you know what you're doing and want to opt out of validation, you can pass the string `'unchecked'` in place of a schema:

```ts
/// file: data.remote.ts
import { query } from '$app/server';

export const getStuff = query('unchecked', async ({ id }: { id: string }) => {
	// the shape might not actually be what TypeScript thinks
	// since bad actors might call this function with other arguments
});
```

## Using `getRequestEvent`

Inside `query`, `form` and `command` you can use [`getRequestEvent`]($app-server#getRequestEvent) to get the current [`RequestEvent`](@sveltejs-kit#RequestEvent) object. This makes it easy to build abstractions for interacting with cookies, for example:

```ts
/// file: user.remote.ts
// @filename: ambient.d.ts
interface User {
	name: string;
	avatar: string;
}

declare module '$lib/server/database' {
	export function findUser(sessionId: string | undefined): Promise<User | null>;
}

// @filename: index.js
// ---cut---
import { getRequestEvent, query } from '$app/server';
import { findUser } from '$lib/server/database';

export const getProfile = query(async () => {
	const user = await getUser();

	return user && {
		name: user.name,
		avatar: user.avatar
	};
});

// this query could be called from multiple places, but
// the function will only run once per request
const getUser = query(async () => {
	const { cookies } = getRequestEvent();

	return await findUser(cookies.get('session_id'));
});
```

Note that some properties of `RequestEvent` are different inside remote functions:

- you cannot set headers (other than writing cookies, and then only inside `form` and `command` functions)
- `route`, `params` and `url` relate to the page the remote function was called from, _not_ the URL of the endpoint SvelteKit creates for the remote function. Queries are not re-run when the user navigates (unless the argument to the query changes as a result of navigation), and so you should be mindful of how you use these values. In particular, never use them to determine whether or not a user is authorized to access certain data.

## Redirects

Inside `query`, `form` and `prerender` functions it is possible to use the [`redirect(...)`](@sveltejs-kit#redirect) function. It is *not* possible inside `command` functions, as you should avoid redirecting here. (If you absolutely have to, you can return a `{ redirect: location }` object and deal with it in the client.)

---

## State management

If you're used to building client-only apps, state management in an app that spans server and client might seem intimidating. This section provides tips for avoiding some common gotchas.

## Avoid shared state on the server

Browsers are _stateful_ — state is stored in memory as the user interacts with the application. Servers, on the other hand, are _stateless_ — the content of the response is determined entirely by the content of the request.

Conceptually, that is. In reality, servers are often long-lived and shared by multiple users. For that reason it's important not to store data in shared variables. For example, consider this code:

```js
// @errors: 7034 7005
/// file: +page.server.js
let user;

/** @type {import('./$types').PageServerLoad} */
export function load() {
	return { user };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		// NEVER DO THIS!
		user = {
			name: data.get('name'),
			embarrassingSecret: data.get('secret')
		};
	}
}
```

The `user` variable is shared by everyone who connects to this server. If Alice submitted an embarrassing secret, and Bob visited the page after her, Bob would know Alice's secret. In addition, when Alice returns to the site later in the day, the server may have restarted, losing her data.

Instead, you should _authenticate_ the user using [`cookies`](load#Cookies) and persist the data to a database.

## No side-effects in load

For the same reason, your `load` functions should be _pure_ — no side-effects (except maybe the occasional `console.log(...)`). For example, you might be tempted to write to a store or global state inside a `load` function so that you can use the value in your components:

```js
/// file: +page.js
// @filename: ambient.d.ts
declare module '$lib/user' {
	export const user: { set: (value: any) => void };
}

// @filename: index.js
// ---cut---
import { user } from '$lib/user';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	const response = await fetch('/api/user');

	// NEVER DO THIS!
	user.set(await response.json());
}
```

As with the previous example, this puts one user's information in a place that is shared by _all_ users. Instead, just return the data...

```js
/// file: +page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	const response = await fetch('/api/user');

+++	return {
		user: await response.json()
	};+++
}
```

...and pass it around to the components that need it, or use [`page.data`](load#page.data).

If you're not using SSR, then there's no risk of accidentally exposing one user's data to another. But you should still avoid side-effects in your `load` functions — your application will be much easier to reason about without them.

## Using state and stores with context

You might wonder how we're able to use `page.data` and other [app state]($app-state) (or [app stores]($app-stores)) if we can't use global state. The answer is that app state and app stores on the server use Svelte's [context API](/tutorial/svelte/context-api) — the state (or store) is attached to the component tree with `setContext`, and when you subscribe you retrieve it with `getContext`. We can do the same thing with our own state:

```svelte
<!--- file: src/routes/+layout.svelte --->
<script>
	import { setContext } from 'svelte';

	/** @type {import('./$types').LayoutProps} */
	let { data } = $props();

	// Pass a function referencing our state
	// to the context for child components to access
	setContext('user', () => data.user);
</script>
```

```svelte
<!--- file: src/routes/user/+page.svelte --->
<script>
	import { getContext } from 'svelte';

	// Retrieve user store from context
	const user = getContext('user');
</script>

<p>Welcome {user().name}</p>
```

> [!NOTE] We're passing a function into `setContext` to keep reactivity across boundaries. Read more about it [here](/docs/svelte/$state#Passing-state-into-functions)

> [!LEGACY]
> You also use stores from `svelte/store` for this, but when using Svelte 5 it is recommended to make use of universal reactivity instead.

Updating the value of context-based state in deeper-level pages or components while the page is being rendered via SSR will not affect the value in the parent component because it has already been rendered by the time the state value is updated. In contrast, on the client (when CSR is enabled, which is the default) the value will be propagated and components, pages, and layouts higher in the hierarchy will react to the new value. Therefore, to avoid values 'flashing' during state updates during hydration, it is generally recommended to pass state down into components rather than up.

If you're not using SSR (and can guarantee that you won't need to use SSR in future) then you can safely keep state in a shared module, without using the context API.

## Component and page state is preserved

When you navigate around your application, SvelteKit reuses existing layout and page components. For example, if you have a route like this...

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	// THIS CODE IS BUGGY!
	const wordCount = data.content.split(' ').length;
	const estimatedReadingTime = wordCount / 250;
</script>

<header>
	<h1>{data.title}</h1>
	<p>Reading time: {Math.round(estimatedReadingTime)} minutes</p>
</header>

<div>{@html data.content}</div>
```

...then navigating from `/blog/my-short-post` to `/blog/my-long-post` won't cause the layout, page and any other components within to be destroyed and recreated. Instead the `data` prop (and by extension `data.title` and `data.content`) will update (as it would with any other Svelte component) and, because the code isn't rerunning, lifecycle methods like `onMount` and `onDestroy` won't rerun and `estimatedReadingTime` won't be recalculated.

Instead, we need to make the value [_reactive_](/tutorial/svelte/state):

```svelte
/// file: src/routes/blog/[slug]/+page.svelte
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();

+++	let wordCount = $derived(data.content.split(' ').length);
	let estimatedReadingTime = $derived(wordCount / 250);+++
</script>
```

> [!NOTE] If your code in `onMount` and `onDestroy` has to run again after navigation you can use [afterNavigate]($app-navigation#afterNavigate) and [beforeNavigate]($app-navigation#beforeNavigate) respectively.

Reusing components like this means that things like sidebar scroll state are preserved, and you can easily animate between changing values. In the case that you do need to completely destroy and remount a component on navigation, you can use this pattern:

```svelte
<script>
	import { page } from '$app/state';
</script>

{#key page.url.pathname}
	<BlogPost title={data.title} content={data.title} />
{/key}
```

## Storing state in the URL

If you have state that should survive a reload and/or affect SSR, such as filters or sorting rules on a table, URL search parameters (like `?sort=price&order=ascending`) are a good place to put them. You can put them in `<a href="...">` or `<form action="...">` attributes, or set them programmatically via `goto('?key=value')`. They can be accessed inside `load` functions via the `url` parameter, and inside components via `page.url.searchParams`.

## Storing ephemeral state in snapshots

Some UI state, such as 'is the accordion open?', is disposable — if the user navigates away or refreshes the page, it doesn't matter if the state is lost. In some cases, you _do_ want the data to persist if the user navigates to a different page and comes back, but storing the state in the URL or in a database would be overkill. For this, SvelteKit provides [snapshots](snapshots), which let you associate component state with a history entry.

## Assistant

<thinking>
Now I have everything I need to give a comprehensive answer. Let me cover:

1. **VueUse equivalents in Svelte** - Looking at what they use:
   - `useClipboard` → `navigator.clipboard` API directly, or `@vueuse/core`-equivalent libraries like `svelte-use` or just native browser API
   - `formatTimeAgo` → `@vueuse/core` has this, but in Svelte you'd just use a utility function or `date-fns`
   - `useSorted` → just `$derived` + sort
   - `useIntersectionObserver` → native IntersectionObserver API, or svelte actions
   - `useRouteParams` → SvelteKit's built-in `page.params` from `$app/state`

2. **Auth in SvelteKit** - Their current setup uses OAuth with osu!, exchanging codes for JWTs stored in cookies, with a `getUser()` function that verifies the token and a `requireAdmin()` check against an admin list. On the client side they fetch `/api/auth/me` and middleware redirects unauthenticated users from protected routes. In SvelteKit, I'd handle this through server-side hooks and load functions instead of composables, using `+page.server.js` to manage auth state and `+layout.server.js` to protect routes. Route protection happens server-side in `+page.server.ts` or `+layout.server.ts` rather than client middleware, and there's no need for a separate `/api/auth/me` endpoint since the user data flows directly from the layout load function. I'm considering whether remote functions could replace their `+server.ts` endpoints for mutations, but given their custom JWT and admin check setup, sticking with `+server.ts` routes is cleaner since they'd need `getRequestEvent()` inside remote functions anyway to access auth context.

Now I'm thinking through the VueUse migration strategy—most utilities map to native browser APIs, Svelte's built-in features, or lightweight libraries like `date-fns` for time formatting and derived stores for sorting operations.

For authentication, their current pattern translates really well to SvelteKit: `hooks.server.ts` becomes the central place to read the JWT cookie and populate `event.locals.user` on every request, `+layout.server.ts` exposes that user to all pages, and `+server.ts` handles the auth callback the same way. For protecting routes, they can check `event.locals` directly instead of calling a separate function.

The `useAuth()` composable they're using is essentially replaced by just accessing `data.user` from the layout since it's already server-rendered, and their global middleware maps to either checks in `+layout.server.ts` or `hooks.server.ts` depending on scope.

On remote functions—they're still experimental and would let them define command functions in `.remote.ts` files instead of `+server.ts` routes, but for their use case the stable `+server.ts` approach is the better choice.
</thinking>

Now I have the full picture. Let me break all three things down.

---

## 1. VueUse equivalents

Looking at exactly what you use, most of it is either a one-liner in Svelte or just native browser APIs:

| VueUse | Svelte equivalent |
|---|---|
| `useRouteParams` | `page.params` from `$app/state` — built-in |
| `useSorted` | `$derived(() => [...list].sort(...))` — just a derived |
| `useIntersectionObserver` | Svelte `use:` action with native `IntersectionObserver` |
| `useClipboard` | `navigator.clipboard.writeText()` directly |
| `formatTimeAgo` | `date-fns` `formatDistanceToNow()` or a small util |

For `useIntersectionObserver` specifically (you use it for infinite scroll), a Svelte action is the idiomatic equivalent:

```/dev/null/src/lib/actions/intersect.ts#L1-14
export function intersect(node: Element, callback: () => void) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) callback();
  });

  observer.observe(node);
  return { destroy: () => observer.disconnect() };
}

// Usage in component:
// <div use:intersect={loadMore} />
```

There's also [`svelte-use`](https://github.com/nickvdyck/svelte-use) if you want a VueUse-style lib, but honestly for what you use you won't need it.

---

## 2. Authentication — this maps almost perfectly, but cleaner

Your current pattern in Nuxt:
- `getUser(event)` called manually in every server route
- `requireAdmin(event)` called manually in every protected route
- `useAuth()` composable that fetches `/api/auth/me` client-side
- Client middleware that redirects if not admin

In SvelteKit, the `handle` hook in `src/hooks.server.ts` runs on **every single request** before anything else. It's the perfect place to verify the JWT and attach the user to `event.locals` **once**, globally:

```/dev/null/src/hooks.server.ts#L1-22
import { verifyToken } from '$lib/server/auth';

export async function handle({ event, resolve }) {
  const token = event.cookies.get('session');

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      event.locals.user = payload; // available everywhere from now on
    }
  }

  return resolve(event);
}
```

Then in `src/app.d.ts` you tell TypeScript about it:

```/dev/null/src/app.d.ts#L1-9
declare global {
  namespace App {
    interface Locals {
      user: { osu_id: number } | null;
    }
  }
}
export {};
```

Now in **every** `+page.server.ts`, `+server.ts`, and `load()` function, `event.locals.user` is already populated — no manual `getUser(event)` call needed:

```/dev/null/src/lib/server/requireAdmin.ts#L1-12
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

const ADMIN_IDS = new Set(
  (process.env.ADMIN_OSU_IDS ?? '').split(',').map(Number)
);

export function requireAdmin(event: RequestEvent) {
  if (!event.locals.user) error(401, 'Unauthorized');
  if (!ADMIN_IDS.has(event.locals.user.osu_id)) error(403, 'Forbidden');
  return event.locals.user;
}
```

The auth callback `+server.ts` is basically identical to your Nitro route:

```/dev/null/src/routes/auth/callback/+server.ts#L1-28
import { createToken } from '$lib/server/auth';
import { convex } from '$lib/server/convex';
import { api } from '$lib/convex/_generated/api';
import { redirect } from '@sveltejs/kit';

export async function GET({ url, cookies }) {
  const code = url.searchParams.get('code');
  if (!code) error(400, 'Missing code');

  // exchange code for osu! token (same as your Nitro route)
  const { access_token } = await fetch('https://osu.ppy.sh/oauth/token', { ... });
  const me = await fetch('https://osu.ppy.sh/api/v2/me', { ... });

  await convex.mutation(api.auth.upsertUser, { osu_id: me.id, username: me.username });

  const token = await createToken(me.id);
  cookies.set('session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });

  redirect(302, '/');
}
```

### Replacing `useAuth()` + `/api/auth/me`

This is where things get **cleaner** than your Nuxt setup. You don't need a separate `/api/auth/me` endpoint or a composable that fetches it. The user is already in `locals`, so you just pass it down from your root layout:

```/dev/null/src/routes/+layout.server.ts#L1-10
export async function load({ locals }) {
  return {
    user: locals.user
      ? {
          osu_id: locals.user.osu_id,
          isAdmin: ADMIN_IDS.has(locals.user.osu_id),
          avatar_url: `https://a.ppy.sh/${locals.user.osu_id}`,
        }
      : null,
  };
}
```

Now `data.user` is available in **every page and layout** in your entire app via `$props()`. No fetching, no composable, it's SSR'd in for free:

```/dev/null/src/routes/+layout.svelte#L1-10
<script lang="ts">
  let { data, children } = $props();
  // data.user is always available here, and in every child page
</script>

{#if data.user?.isAdmin}
  <a href="/dashboard">Dashboard</a>
{/if}

{@render children()}
```

### Route protection — server-side, no client middleware

Instead of client-side middleware (which can be bypassed before JS loads), protection is server-side in SvelteKit. For the dashboard, you add a `+layout.server.ts` in that folder:

```/dev/null/src/routes/dashboard/+layout.server.ts#L1-8
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  if (!locals.user || !ADMIN_IDS.has(locals.user.osu_id)) {
    redirect(302, '/login');
  }
}
```

Every page under `/dashboard/*` will now redirect server-side before rendering anything if you're not an admin. More secure than your current client middleware.

---

## 3. Remote functions — cool but hold off for now

Remote functions (`query`, `command`, `form` from `$app/server`) are very interesting. The idea is you define a function in a `.remote.ts` file, call it from your Svelte component, and SvelteKit routes it to the server automatically:

```/dev/null/src/routes/data.remote.ts#L1-10
import { command } from '$app/server';
import { getRequestEvent } from '$app/server';

export const deletePlayer = command(async (id: string) => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401);

  await convex.mutation(api.players.deletePlayer, { player_id: id });
});
```

This would replace your `+server.ts` mutation routes entirely — no more manual `fetch('/api/players/...')` calls from the frontend, just `await deletePlayer(id)`.

**But** — and this is important — it's still **experimental** as of now (requires opting in via `svelte.config.js`). For a production app, you're better off with `+server.ts` routes for mutations for the time being. The pattern is stable, you already know it, and it's essentially the same as your Nitro routes. Remote functions are something to watch and adopt once they stabilize.

## User

do you think its a good idea to rewrite that in svelte? i mean, i would gain perfomance that is obvious but do you think its easier on svelte than on vue for example (sveltekit vs nuxt)

## Assistant

<thinking>
The user is asking for my honest opinion about whether rewriting their BR_Skins_Hub project from Nuxt to SvelteKit is a good idea. They want to know:
1. Is it worth the rewrite?
2. Is SvelteKit easier/better than Nuxt for their use case?

Let me give an honest, balanced answer based on what I know about their project and both frameworks.

Key things I know about their project:
- It's a skin hub for osu! players
- Uses Convex for the database (reactive queries on frontend, mutations on backend)
- Has OAuth with osu!
- JWT auth, admin checks


- Uses VueUse for utilities and Nuxt UI for components
- Has an admin dashboard and public pages for viewing players/skins
- Uses UploadThing for file uploads

Now I'm weighing the actual tradeoffs. SvelteKit does have real advantages like better performance through compilation, smaller bundles, and cleaner data loading patterns compared to Nuxt's async utilities. The hooks system is also more straightforward for handling auth. But I need to be honest about the migration cost and whether it's actually worth it for this project.

The biggest blocker is that Nuxt UI is genuinely comprehensive and polished, while SvelteKit's component ecosystem is fragmented—Shadcn Svelte, Skeleton UI, Flowbite, and melt-ui all have different strengths but none match what Nuxt UI offers out of the box. Plus, for a skin hub that's not dealing with massive traffic, the performance gains from Svelte's compilation are probably negligible compared to Nuxt's already solid speed. The rewrite effort would be substantial across all components, composables, and pages, which seems hard to justify for marginal real-world improvements. are as polished or integrated as Nuxt UI for their use case
4. They'd lose their composables and need to rewrite them as Svelte utilities
5. The VueUse ecosystem is more mature than equivalent Svelte utility libs
6. They already KNOW Vue/Nuxt - there's a learning curve with Svelte
7. Remote functions are experimental - can't use them yet in production reliably
8. The honest truth: for a skin hub with relatively low traffic, the performance difference is imperceptible to end users

**My honest opinion:**
The performance difference between Nuxt and SvelteKit for a skin hub like this is going to be marginal at best for actual users. Nuxt with proper SSR is already very fast. The real question is: what do you gain?

- If the user enjoys Svelte and wants to learn it, absolutely worth it
- If the user wants a "fun rewrite project", sure
- If they're doing it purely for performance, probably not worth the effort
- The component library situation is a genuine concern - Nuxt UI is excellent

I should be honest and direct here. The user seems to be exploring this as a learning interest rather than a necessity, so I need to give them my real take without sugarcoating it.

Though I should reconsider the actual advantages SvelteKit does have - the auth pattern with hooks.server.ts is genuinely cleaner and more secure than Nuxt's approach, and the load() + invalidate() pattern is simpler than managing useAsyncData and refreshNuxtData. Plus there's no need for a separate state management library like Pinia, and the bundle size savings do matter for SEO and Core Web Vitals. But the component library gap is still a real blocker worth examining.

So my actual verdict: it's worth doing if they want to learn Svelte and enjoy the process - the code will be cleaner, auth is better, performance is better. But it's not necessary since their Nuxt app is already well-structured. The main practical concern is finding a good component library to replace Nuxt UI.

So I should give my honest overall assessment without over-researching. The user is asking for my opinion, not a deep analysis.

The real question is whether they're doing this for learning or performance. If it's learning, go for it - SvelteKit's auth patterns and data loading are genuinely cleaner, and they'll avoid needing Pinia. But if it's purely for performance on a skin hub, the gains won't be noticeable to users, and they'd lose the polish of Nuxt UI plus have to rewrite their composables. My honest take: worth it as a learning project, not worth it just for marginal performance gains.
</thinking>

Honestly? Let me give you my real take rather than just hype one framework.

## The performance argument is probably overstated for your use case

Yes, Svelte compiles away the framework, no virtual DOM, smaller bundles. But this is a **skin hub**. It's not a real-time trading platform or a social feed with thousands of DOM updates per second. Nuxt with SSR is already fast. Your users are not going to feel a difference. If performance was your main motivation, I'd say it's not worth it.

## Where SvelteKit genuinely IS better for your specific app

That said, there are real, tangible improvements that aren't about raw performance:

- **The auth story is cleaner.** Your `hooks.server.ts` + `locals.user` pattern is more elegant and secure than what you have now. No `/api/auth/me` endpoint, no `callOnce`, no client composable that can get out of sync. The user just exists on every request.
- **`load()` is simpler than `useAsyncData`.** Less boilerplate, the data flow is more obvious, SSR works naturally without you thinking about it.
- **No Pinia needed.** Svelte's built-in reactivity with `$state` in `.svelte.ts` files handles cross-component state without a separate library.
- **Less "Nuxt magic".** Nuxt has a lot of auto-imports, auto-everything. SvelteKit is more explicit which makes it easier to reason about what's actually happening.

## The real concern: Nuxt UI

This is the thing nobody mentions. You're using **Nuxt UI** which is genuinely excellent — it's tightly integrated, well-designed, and saves you a huge amount of work. In SvelteKit, the options are:

- **shadcn-svelte** — probably the best option, headless, unstyled by default, very customizable
- **Skeleton UI** — nice but more opinionated
- **Melt UI** — headless primitives, you build on top

None of them are as plug-and-play as Nuxt UI. You'd spend real time rebuilding things like your toasts, modals, dropdowns, context menus — all the stuff that just works right now.

## My honest verdict

**Don't rewrite it.** Not because SvelteKit is worse, but because:

1. Your Nuxt app is already well-structured and clean
2. The performance gain is imperceptible to your users
3. You'd lose Nuxt UI and spend weeks rebuilding UI components
4. You'd spend time porting auth, composables, stores — all working code

**Do build the next thing in SvelteKit** if you're starting something new. The skin hub you have now is a good, working project. Use it as a reference when you build something new in SvelteKit and you'll find the patterns transfer very naturally — you've already thought through the right architecture (server mutations, clean auth, Convex on the backend). That thinking doesn't change between frameworks.

The time you'd spend rewriting this would be better spent building new features or a new project entirely.

## User

my current api routes for handling interaction with the database currently has a lot of files for each type of request (post, get, patch, etc) and on svelte I personally think its cleaner. I WANT to rebuild in svelte and make it things simpler and easier to maintain longterm. I already had planed to move out of NuxtUI anyways so its ok to use shadcn (that's what I'm actually going to use on sveltekit). I don't have nay experience with sveltekit either so that would be a great learning experience too.

my application depends heavily on api routes which sveltekit makes all of it easier to do. I need to put all the idea of the current BRSkinsHub and organize in a way I can just follow each step. I thought of starting on the API Routes but I thought that implementing convex first is priority because to make the API Routes I need the Convex implementation first anyway.

Help me with that and make every step I need to follow to get where the current Vue/Nuxt version of BRSkinsHub is right now.

## Assistant

<thinking>
The user wants to rebuild BR_Skins_Hub in SvelteKit. They want a step-by-step plan to follow. They want to start with Convex first, then API routes. Let me look at the current project in detail to understand what needs to be rebuilt, then create a comprehensive plan.

Let me look at the full project structure to understand everything that needs to be done.
</thinking>

Let me do a thorough read of the entire current project first so the plan is accurate and complete.

**Tool Call: List the `BR_Skins_Hub/server/api/players` directory's contents**
Status: Completed

# Folders:
BR_Skins_Hub/server/api/players/[id]

# Files:
BR_Skins_Hub/server/api/players/index.post.ts


**Tool Call: List the `BR_Skins_Hub/server/api/skins` directory's contents**
Status: Completed

# Folders:
BR_Skins_Hub/server/api/skins/[id]

# Files:
BR_Skins_Hub/server/api/skins/index.post.ts


**Tool Call: List the `BR_Skins_Hub/server/api/player-skins` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/server/api/player-skins/[playerId].put.ts


**Tool Call: List the `BR_Skins_Hub/convex` directory's contents**
Status: Completed

# Folders:
BR_Skins_Hub/convex/_generated

# Files:
BR_Skins_Hub/convex/auth.ts
BR_Skins_Hub/convex/playerSkins.ts
BR_Skins_Hub/convex/players.ts
BR_Skins_Hub/convex/schema.ts
BR_Skins_Hub/convex/skins.ts


**Tool Call: List the `BR_Skins_Hub/server/api/players/[id]` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/server/api/players/[id]/index.delete.ts
BR_Skins_Hub/server/api/players/[id]/index.patch.ts
BR_Skins_Hub/server/api/players/[id]/profile.patch.ts
BR_Skins_Hub/server/api/players/[id]/views.post.ts


**Tool Call: List the `BR_Skins_Hub/server/api/skins/[id]` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/server/api/skins/[id]/download.post.ts
BR_Skins_Hub/server/api/skins/[id]/index.delete.ts
BR_Skins_Hub/server/api/skins/[id]/index.patch.ts


**Tool Call: List the `BR_Skins_Hub/server/api/player` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/server/api/player/refresh.ts


**Tool Call: Read file `convex/schema.ts`**
Status: Completed

```BR_Skins_Hub/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /* ------- */
  /* Players */
  /* ------- */
  players: defineTable({
    name: v.string(),
    osu_id: v.number(),
    cover_url: v.optional(v.string()),
    hue: v.optional(v.number()),
    previous_usernames: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    links: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("twitch"),
            v.literal("twitter"),
            v.literal("youtube"),
            v.literal("github"),
            v.literal("discord"),
            v.literal("custom"),
          ),
          value: v.string(),
        }),
      ),
    ),
    views: v.optional(v.number()),
  }).index("by_osu_id", ["osu_id"]),

  /* ----- */
  /* Skins */
  /* ----- */
  skins: defineTable({
    name: v.string(),
    author: v.optional(v.string()),
    download_url: v.string(),
    download_count: v.number(),
    preview_images: v.array(v.string()),
  }).index("by_name", ["name"]),

  /* ------------------------- */
  /* Player Skins Relation N:N */
  /* ------------------------- */
  playerSkins: defineTable({
    player_id: v.id("players"),
    skin_id: v.id("skins"),
  })
    .index("by_player", ["player_id"])
    .index("by_skin", ["skin_id"])
    .index("by_player_skin", ["player_id", "skin_id"]),

  /* ---------- */
  /* Auth Users */
  /* ---------- */
  authUsers: defineTable({
    osu_id: v.number(),
    username: v.string(),
    player_id: v.optional(v.id("players")),
  }).index("by_osu_id", ["osu_id"]),
});

```


**Tool Call: Read file `convex/auth.ts`**
Status: Completed

```BR_Skins_Hub/convex/auth.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAuthUser = query({
  args: { osu_id: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("authUsers")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .unique();
  },
});

export const upsertUser = mutation({
  args: {
    osu_id: v.number(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("authUsers")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .unique();

    // Check if a public player profile already exists for this osu! account
    const matchingPlayer = await ctx.db
      .query("players")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .unique();

    // Keep player's public name in sync with latest osu! username
    if (matchingPlayer && matchingPlayer.name !== args.username) {
      await ctx.db.patch(matchingPlayer._id, { name: args.username });
    }

    if (existingUser) {
      const usernameChanged = existingUser.username !== args.username;
      const playerLinkChanged = matchingPlayer
        ? existingUser.player_id !== matchingPlayer._id
        : false;

      if (usernameChanged || playerLinkChanged) {
        await ctx.db.patch(existingUser._id, {
          ...(usernameChanged ? { username: args.username } : {}),
          ...(playerLinkChanged ? { player_id: matchingPlayer!._id } : {}),
        });
      }

      return existingUser._id;
    }

    return await ctx.db.insert("authUsers", {
      osu_id: args.osu_id,
      username: args.username,
      ...(matchingPlayer ? { player_id: matchingPlayer._id } : {}),
    });
  },
});

```


**Tool Call: Read file `convex/players.ts`**
Status: Completed

```BR_Skins_Hub/convex/players.ts
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function isAdminOsuId(osuId: number): boolean {
  const raw = process.env.ADMIN_OSU_IDS ?? "";
  const adminIds = raw
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => !Number.isNaN(id) && id > 0);

  return adminIds.includes(osuId);
}

export const createPlayer = mutation({
  args: {
    name: v.string(),
    osu_id: v.number(),
    cover_url: v.optional(v.string()),
    previous_usernames: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("players", {
      osu_id: args.osu_id,
      name: args.name,
      cover_url: args.cover_url,
      previous_usernames: args.previous_usernames || [],
    });
  },
});

export const listPlayers = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query("players").collect();
  },
});

export const getPlayer = query({
  args: {
    id: v.id("players"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPlayerByOsuId = query({
  args: { osu_id: v.number() },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .first();
    return players;
  },
});

// For basic player information update
export const updatePlayer = mutation({
  args: {
    id: v.id("players"),
    name: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    previous_usernames: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const patch: Partial<Doc<"players">> = {};

    if (args.name !== undefined) patch.name = args.name;
    if (args.cover_url !== undefined) patch.cover_url = args.cover_url;
    if (args.previous_usernames !== undefined) patch.previous_usernames = args.previous_usernames;

    await ctx.db.patch(args.id, patch);
  },
});

// For the player's page update
export const updatePlayerProfile = mutation({
  args: {
    id: v.id("players"),
    requester_osu_id: v.number(),
    description: v.optional(v.string()),
    links: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("twitch"),
            v.literal("twitter"),
            v.literal("youtube"),
            v.literal("github"),
            v.literal("discord"),
            v.literal("custom"),
          ),
          value: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await ctx.db
      .query("authUsers")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.requester_osu_id))
      .unique();

    const requesterOwnsProfile = authUser?.player_id === args.id;
    const requesterIsAdmin = isAdminOsuId(args.requester_osu_id);

    if (!requesterOwnsProfile && !requesterIsAdmin) {
      throw new Error("Forbidden");
    }

    const patch: Partial<Doc<"players">> = {};

    if (args.description !== undefined) patch.description = args.description;
    if (args.links !== undefined)
      patch.links = args.links.filter((link) => link.value.trim() !== "");

    await ctx.db.patch(args.id, patch);
  },
});

export const incrementPlayerViews = mutation({
  args: {
    id: v.id("players"),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.id);
    if (!player) return;

    await ctx.db.patch(args.id, {
      views: (player.views ?? 0) + 1,
    });
  },
});

export const deletePlayer = mutation({
  args: {
    player_id: v.id("players"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.player_id);
  },
});

```


**Tool Call: Read file `convex/skins.ts`**
Status: Completed

```BR_Skins_Hub/convex/skins.ts
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

export const createSkin = mutation({
  args: {
    name: v.string(),
    author: v.optional(v.string()),
    download_url: v.string(),
    preview_images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("skins", {
      ...args,
      download_count: 0,
    });
  },
});

export const listSkins = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query("skins").collect();
  },
});

export const getSkin = query({
  args: { id: v.id("skins") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateSkin = mutation({
  args: {
    _id: v.id("skins"),
    name: v.optional(v.string()),
    author: v.optional(v.string()),
    download_url: v.optional(v.string()),
    preview_images: v.optional(v.array(v.string())),
    download_count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { _id, ...data } = args;
    await ctx.db.patch(_id, data);
  },
});

export const deleteSkin = mutation({
  args: {
    _id: v.id("skins"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args._id);
  },
});

export const listSkinsWithPlayers = query({
  args: {},
  handler: async (ctx) => {
    const skins = await ctx.db.query("skins").collect();
    return await Promise.all(
      skins.map(async (skin) => {
        const relations = await ctx.db
          .query("playerSkins")
          .withIndex("by_skin", (q) => q.eq("skin_id", skin._id))
          .collect();

        const players = await Promise.all(relations.map((r) => ctx.db.get(r.player_id)));
        const playerNames = players.filter((p) => p !== null).map((p) => p!.name);

        return { ...skin, playerNames };
      }),
    );
  },
});

```


**Tool Call: Read file `convex/playerSkins.ts`**
Status: Completed

```BR_Skins_Hub/convex/playerSkins.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSkinsByPlayer = query({
  args: { player_id: v.id("players") },
  handler: async (ctx, args) => {
    const relations = await ctx.db
      .query("playerSkins")
      .withIndex("by_player", (q) => q.eq("player_id", args.player_id))
      .collect();

    const skins = await Promise.all(relations.map((r) => ctx.db.get(r.skin_id)));
    return skins.filter((s) => s !== null);
  },
});

export const getSkinsByOsuId = query({
  args: { osu_id: v.number() },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_osu_id", (q) => q.eq("osu_id", args.osu_id))
      .first();

    if (!player) return [];

    const relations = await ctx.db
      .query("playerSkins")
      .withIndex("by_player", (q) => q.eq("player_id", player._id))
      .collect();

    const skins = await Promise.all(relations.map((r) => ctx.db.get(r.skin_id)));
    return skins.filter((s) => s !== null);
  },
});

export const updatePlayerSkins = mutation({
  args: {
    player_id: v.id("players"),
    skin_ids: v.array(v.id("skins")),
  },
  handler: async (ctx, args) => {
    // 1. Get current relations
    const currentRelations = await ctx.db
      .query("playerSkins")
      .withIndex("by_player", (q) => q.eq("player_id", args.player_id))
      .collect();

    const currentSkinIds = new Set(currentRelations.map((r) => r.skin_id));
    const targetSkinIds = new Set(args.skin_ids);

    // 2. Identify skins to remove (in current but not in target)
    const toRemove = currentRelations.filter((r) => !targetSkinIds.has(r.skin_id));

    // 3. Identify skins to add (in target but not in current)
    const toAdd = args.skin_ids.filter((id) => !currentSkinIds.has(id));

    // 4. Perform deletions
    await Promise.all(toRemove.map((r) => ctx.db.delete(r._id)));

    // 5. Perform insertions
    await Promise.all(
      toAdd.map((skinId) =>
        ctx.db.insert("playerSkins", {
          player_id: args.player_id,
          skin_id: skinId,
        }),
      ),
    );
  },
});

```


**Tool Call: Read file `server/api/players/index.post.ts`**
Status: Completed

```BR_Skins_Hub/server/api/players/index.post.ts
import { api } from "~~/convex/_generated/api";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = (await readBody(event)) as Record<string, unknown>;

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, message: "Invalid player name." });
  }

  if (typeof body.osu_id !== "number" || !Number.isFinite(body.osu_id) || body.osu_id <= 0) {
    throw createError({ statusCode: 400, message: "Invalid osu_id." });
  }

  if (body.cover_url !== undefined && typeof body.cover_url !== "string") {
    throw createError({ statusCode: 400, message: "Invalid cover_url." });
  }

  if (
    body.previous_usernames !== undefined &&
    (!Array.isArray(body.previous_usernames) ||
      body.previous_usernames.some((item) => typeof item !== "string"))
  ) {
    throw createError({ statusCode: 400, message: "Invalid previous_usernames." });
  }

  return await convex.mutation(api.players.createPlayer, {
    name: body.name,
    osu_id: body.osu_id,
    cover_url: body.cover_url,
    previous_usernames: body.previous_usernames,
  });
});

```


**Tool Call: Read file `server/api/players/[id]/index.patch.ts`**
Status: Completed

```BR_Skins_Hub/server/api/players/[id]/index.patch.ts
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const idParam = getRouterParam(event, "id");
  if (!idParam) {
    throw createError({ statusCode: 400, message: "Missing player id." });
  }

  const body = (await readBody(event)) as Record<string, unknown>;

  if (body.name !== undefined && typeof body.name !== "string") {
    throw createError({ statusCode: 400, message: "Invalid player name." });
  }

  if (body.cover_url !== undefined && typeof body.cover_url !== "string") {
    throw createError({ statusCode: 400, message: "Invalid cover_url." });
  }

  if (
    body.previous_usernames !== undefined &&
    (!Array.isArray(body.previous_usernames) ||
      body.previous_usernames.some((item) => typeof item !== "string"))
  ) {
    throw createError({ statusCode: 400, message: "Invalid previous_usernames." });
  }

  const id = idParam as Id<"players">;

  return await convex.mutation(api.players.updatePlayer, {
    id,
    name: body.name,
    cover_url: body.cover_url,
    previous_usernames: body.previous_usernames,
  });
});

```


**Tool Call: Read file `server/api/players/[id]/profile.patch.ts`**
Status: Completed

```BR_Skins_Hub/server/api/players/[id]/profile.patch.ts
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";
import { isAdminId } from "~~/server/utils/requireAdmin";
import { getUser } from "~~/server/utils/getUser";

export default defineEventHandler(async (event) => {
  const user = await getUser(event);

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const id = getRouterParam(event, "id") as Id<"players">;
  const body = await readBody(event);
  const authUser = await convex.query(api.auth.getAuthUser, { osu_id: user.osu_id });
  const requesterOwnsProfile = authUser?.player_id === id;
  const requesterIsAdmin = isAdminId(user.osu_id);

  if (!requesterOwnsProfile && !requesterIsAdmin) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  return await convex.mutation(api.players.updatePlayerProfile, {
    id,
    requester_osu_id: user.osu_id,
    description: body.description,
    links: body.links,
  });
});

```


**Tool Call: Read file `server/api/players/[id]/views.post.ts`**
Status: Completed

```BR_Skins_Hub/server/api/players/[id]/views.post.ts
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";
import { createRateLimiter } from "~~/server/utils/rateLimit";

const viewsRateLimiter = createRateLimiter({
  key: "players-views",
  maxRequests: 20,
  windowMs: 60_000,
});

export default defineEventHandler(async (event) => {
  viewsRateLimiter.check(event);

  const id = getRouterParam(event, "id") as Id<"players">;

  return await convex.mutation(api.players.incrementPlayerViews, {
    id,
  });
});

```


**Tool Call: Read file `server/api/skins/index.post.ts`**
Status: Completed

```BR_Skins_Hub/server/api/skins/index.post.ts
import { api } from "~~/convex/_generated/api";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = (await readBody(event)) as Record<string, unknown>;

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, message: "Invalid skin name." });
  }

  if (body.author !== undefined && typeof body.author !== "string") {
    throw createError({ statusCode: 400, message: "Invalid author." });
  }

  if (typeof body.download_url !== "string" || body.download_url.trim().length === 0) {
    throw createError({ statusCode: 400, message: "Invalid download_url." });
  }

  if (
    !Array.isArray(body.preview_images) ||
    body.preview_images.length === 0 ||
    body.preview_images.some((url) => typeof url !== "string" || url.length === 0)
  ) {
    throw createError({ statusCode: 400, message: "Invalid preview_images." });
  }

  return await convex.mutation(api.skins.createSkin, {
    name: body.name,
    author: body.author,
    download_url: body.download_url,
    preview_images: body.preview_images,
  });
});

```


**Tool Call: Read file `server/api/skins/[id]/index.patch.ts`**
Status: Completed

```BR_Skins_Hub/server/api/skins/[id]/index.patch.ts
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const idParam = getRouterParam(event, "id");
  if (!idParam) {
    throw createError({ statusCode: 400, message: "Missing skin id." });
  }

  const body = (await readBody(event)) as Record<string, unknown>;

  if (body.name !== undefined && typeof body.name !== "string") {
    throw createError({ statusCode: 400, message: "Invalid name." });
  }

  if (body.author !== undefined && typeof body.author !== "string") {
    throw createError({ statusCode: 400, message: "Invalid author." });
  }

  if (body.download_url !== undefined && typeof body.download_url !== "string") {
    throw createError({ statusCode: 400, message: "Invalid download_url." });
  }

  if (
    body.preview_images !== undefined &&
    (!Array.isArray(body.preview_images) ||
      body.preview_images.some((url) => typeof url !== "string" || url.length === 0))
  ) {
    throw createError({ statusCode: 400, message: "Invalid preview_images." });
  }

  if (
    body.download_count !== undefined &&
    (typeof body.download_count !== "number" ||
      !Number.isFinite(body.download_count) ||
      body.download_count < 0)
  ) {
    throw createError({ statusCode: 400, message: "Invalid download_count." });
  }

  const id = idParam as Id<"skins">;

  return await convex.mutation(api.skins.updateSkin, {
    _id: id,
    name: body.name,
    author: body.author,
    download_url: body.download_url,
    preview_images: body.preview_images,
    download_count: body.download_count,
  });
});

```


**Tool Call: Read file `server/api/skins/[id]/download.post.ts`**
Status: Completed

```BR_Skins_Hub/server/api/skins/[id]/download.post.ts
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

// Public endpoint — no auth required. Only increments download count.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") as Id<"skins">;

  const skin = await convex.query(api.skins.getSkin, { id });

  if (!skin) {
    throw createError({ statusCode: 404, message: "Skin not found" });
  }

  await convex.mutation(api.skins.updateSkin, {
    _id: id,
    download_count: skin.download_count + 1,
  });
});

```


**Tool Call: Read file `server/api/player/refresh.ts`**
Status: Completed

```BR_Skins_Hub/server/api/player/refresh.ts
import { auth, v2 } from "osu-api-extended";

export default defineEventHandler(async (event) => {
  const { osu_id } = getQuery(event);
  if (!osu_id) {
    throw new Error("No osu_id provided");
  }

  await auth.login({
    type: "v2",
    client_id: useRuntimeConfig().public.osuClientId,
    client_secret: useRuntimeConfig().osuClientSecret,
    scopes: ["public"],
  });
  const user = await v2.users.details({ user: Number(osu_id), key: "id" });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
});

```


**Tool Call: Read file `server/utils/rateLimit.ts`**
Status: Completed

```BR_Skins_Hub/server/utils/rateLimit.ts
import type { H3Event } from "h3";
import { setResponseHeader } from "h3";

type RateLimiterOptions = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(event: H3Event): string {
  const forwardedFor = event.node.req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return event.node.req.socket.remoteAddress || "unknown";
}

function getBucketKey(event: H3Event, key: string): string {
  return `${key}:${getClientIp(event)}`;
}

function cleanupExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { key, maxRequests, windowMs } = options;

  return {
    check(event: H3Event) {
      const now = Date.now();
      cleanupExpiredBuckets(now);

      const bucketKey = getBucketKey(event, key);
      const existingBucket = buckets.get(bucketKey);

      if (!existingBucket || existingBucket.resetAt <= now) {
        buckets.set(bucketKey, {
          count: 1,
          resetAt: now + windowMs,
        });
        return;
      }

      if (existingBucket.count >= maxRequests) {
        const retryAfterSeconds = Math.max(1, Math.ceil((existingBucket.resetAt - now) / 1000));

        setResponseHeader(event, "Retry-After", retryAfterSeconds);

        throw createError({
          statusCode: 429,
          message: "Too many requests",
        });
      }

      existingBucket.count += 1;
      buckets.set(bucketKey, existingBucket);
    },
  };
}

```


**Tool Call: Read file `app/app.vue`**
Status: Completed

```BR_Skins_Hub/app/app.vue
<template>
  <UApp>
    <nav
      class="border-muted bg-mantle/25 fixed top-0 z-50 flex w-full items-center justify-center border-b backdrop-blur-3xl"
    >
      <UserNavCard class="invisible" />
      <UNavigationMenu :items="menuItems" class="flex w-full max-w-2xl justify-center" />
      <UserNavCard />
    </nav>

    <UMain class="mt-24 mb-24 flex h-full w-full justify-center">
      <NuxtPage />
    </UMain>

    <UFooter>
      <UPopover mode="hover">
        <UButton
          :icon="copied ? ICONS.SUBMIT : 'i-simple-icons-discord'"
          :color="copied ? 'success' : 'neutral'"
          :variant="copied ? 'soft' : 'ghost'"
          aria-label="Discord"
          @click="copy('znyash')"
        />

        <template #content>
          <span class="popover-content select-text!">
            <p>@znyash</p>
          </span>
        </template>
      </UPopover>
      <UPopover mode="hover">
        <UButton
          icon="i-simple-icons-x"
          color="neutral"
          variant="ghost"
          to="https://x.com/VitorNyash_"
          target="_blank"
          aria-label="X"
        />

        <template #content>
          <span class="popover-content select-text!">
            <p>@VitorNyash_</p>
          </span>
        </template>
      </UPopover>
      <UPopover mode="hover">
        <UButton
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          to="https://github.com/zNyash"
          target="_blank"
          aria-label="GitHub"
        />

        <template #content>
          <span class="popover-content select-text!">
            <p>@zNyash</p>
          </span>
        </template>
      </UPopover>
    </UFooter>
  </UApp>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";
import { ICONS } from "./types/icons";
import { useClipboard } from "@vueuse/core";

// ------ External Composables ------
const { isAdmin, user } = useAuth();
const { copy, copied } = useClipboard();

// ------ Lifecycle ------
await callOnce(async () => {
  const { cookie } = useRequestHeaders(["cookie"]);
  user.value = await $fetch("/api/auth/me", {
    headers: cookie ? { cookie } : {},
  });
});

// ------ Computed ------
const menuItems = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [
    {
      label: "Players",
      to: "/",
      icon: ICONS.USERS,
    },
    {
      label: "Skins",
      to: "/skins",
      icon: ICONS.BRUSH,
    },
  ];

  if (isAdmin.value) {
    items.push({
      label: "Dashboard",
      icon: ICONS.DASHBOARD,
      to: "/dashboard",
    });
  }

  return items;
});
</script>

```


**Tool Call: Read file `nuxt.config.ts`**
Status: Completed

```BR_Skins_Hub/nuxt.config.ts
import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  vite: {
    plugins: [tailwindcss()],
  },

  css: ["./app/assets/main.css"],
  modules: ["convex-nuxt", "@nuxt/ui", "@uploadthing/nuxt", "@pinia/nuxt"],
  convex: {
    url: process.env.CONVEX_URL,
  },

  colorMode: {
    preference: "dark",
    fallback: "dark",
    classSuffix: "",
    classPrefix: "",
    storageKey: "nuxt-color-mode",
  },
  runtimeConfig: {
    osuClientSecret: process.env.OSU_CLIENT_SECRET,
    public: {
      osuClientId: process.env.OSU_CLIENT_ID,
      currentDomain: process.env.CURRENT_DOMAIN,
    },
  },
});
```


**Tool Call: Read file `app/pages/index.vue`**
Status: Completed

```BR_Skins_Hub/app/pages/index.vue
<template>
  <div class="flex w-full flex-col items-center">
    <div class="flex w-full max-w-5xl flex-col gap-2 p-2">
      <!-- Search Input -->
      <div class="flex w-full items-center justify-between gap-2">
        <span class="flex w-full items-center gap-1 text-nowrap">
          <UInput
            v-model="inputSearch"
            :icon="ICONS.SEARCH"
            placeholder="Search players by name or ID..."
            class="search-input-default-size"
          />

          <!-- Players Count -->
          <span>
            <p v-if="playersList?.length" class="text-muted pl-2 text-sm">
              {{ playersList.length }} players
            </p>
            <p v-else class="text-muted pl-2 text-sm">Loading...</p>
          </span>
        </span>

        <div class="flex shrink-0 items-center gap-1">
          <!-- Sorting Buttons -->
          <UButton
            size="sm"
            color="neutral"
            :variant="sortBy === 'name' ? 'soft' : 'ghost'"
            :trailing-icon="
              sortBy === 'name'
                ? sortDir === 'asc'
                  ? ICONS.SORT_NAME_ASC
                  : ICONS.SORT_NAME_DESC
                : ICONS.SORT_NAME_ASC
            "
            @click="toggleSort('name')"
            >Name</UButton
          >
          <UButton
            size="sm"
            color="neutral"
            :variant="sortBy === '_creationTime' ? 'soft' : 'ghost'"
            :trailing-icon="
              sortBy === '_creationTime'
                ? sortDir === 'asc'
                  ? ICONS.SORT_DATE_ASC
                  : ICONS.SORT_DATE_DESC
                : ICONS.SORT_DATE_ASC
            "
            @click="toggleSort('_creationTime')"
            >Date</UButton
          >
        </div>
      </div>

      <!-- Loading Skeletons -->
      <div
        v-if="isLoadingPlayers"
        class="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
      >
        <USkeleton v-for="n in 32" :key="n" class="h-15 w-full" />
      </div>

      <!-- Players List -->
      <div
        v-else-if="filteredPlayers.length"
        class="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
      >
        <MainPlayerCard v-for="player in visiblePlayers" :key="player._id" :player="player" />
        <div v-if="canLoadMore" ref="loadMoreTrigger" class="flex justify-center py-4">
          <p class="text-muted animate-pulse text-sm">Loading more...</p>
        </div>
      </div>

      <!-- No Players Found -->
      <div v-else class="flex flex-col items-center justify-center py-10">
        <div class="text-muted-foreground flex flex-col items-center gap-2">
          <UEmpty
            :title="`No players found matching \u0022${inputSearch}\u0022`"
            description="Are you sure you typed that correctly? You can search by player name or osu! ID."
            :icon="ICONS.FROWN"
            variant="naked"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useIntersectionObserver } from "@vueuse/core";
import { ICONS } from "~/types/icons";
import { api } from "~~/convex/_generated/api";

// ------ Local Types & Defaults ------
type SortField = "name" | "_creationTime";
type SortDir = "asc" | "desc";

// ------ External Composables ------
const { data: playersList, isPending: isLoadingPlayers } = useConvexQuery(api.players.listPlayers);

// ------ Local State ------
const inputSearch = ref("");
const sortBy = ref<SortField>("name");
const sortDir = ref<SortDir>("asc");

// ------ Computed ------
const paginationResetTrigger = computed(
  () => `${sortBy.value}-${sortDir.value}-${inputSearch.value}`,
);

const sortedPlayers = computed(() => {
  if (!playersList.value) return [];
  const list = [...playersList.value];
  list.sort((a, b) => {
    if (sortBy.value === "name") return a.name.localeCompare(b.name);
    return a._creationTime - b._creationTime;
  });
  return sortDir.value === "desc" ? list.reverse() : list;
});

const filteredPlayers = useFuzzyFilter(sortedPlayers, inputSearch, {
  keys: ["name", "osu_id", "previous_usernames"],
});

// ------ Actions ------
const toggleSort = (field: SortField) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDir.value = "asc";
  }
};

// ------ Paginating and loading more players ------
const {
  visibleItems: visiblePlayers,
  canLoadMore,
  loadMore,
} = useLoadMore(filteredPlayers, {
  pageSize: 32,
  resetTrigger: paginationResetTrigger,
});

// Automatically load more players when the user scrolls to the bottom of the list.
const loadMoreTrigger = ref<HTMLElement | null>(null);
useIntersectionObserver(loadMoreTrigger, ([entry]) => {
  if (entry?.isIntersecting && canLoadMore.value) {
    loadMore();
  }
});

// ------ Lifecycle ------
useSeoMeta({
  title: "Players List | BR Skins Hub",
  ogTitle: "Players List | BR Skins Hub",
});
</script>

```


**Tool Call: Read file `app/pages/skins.vue` (lines 1-50)**
Status: Completed

```BR_Skins_Hub/app/pages/skins.vue
<template>
  <div class="flex w-full flex-col items-center">
    <section class="flex w-full max-w-5xl flex-col gap-2 p-2">
      <!-- Search Input -->
      <div class="flex w-full items-center justify-between gap-2">
        <span class="flex w-full items-center gap-1 text-nowrap">
          <UInput
            v-model="inputSearch"
            placeholder="Search skins..."
            :icon="ICONS.SEARCH"
            class="search-input-default-size"
          />

          <!-- Skins Count -->
          <span>
            <p v-if="skinsList?.length" class="text-muted pl-2 text-sm">
              {{ skinsList.length }} skins
            </p>
            <p v-else class="text-muted pl-2 text-sm">Loading...</p>
          </span>
        </span>

        <div class="flex shrink-0 items-center gap-1">
          <!-- Sorting Buttons -->
          <UButton
            size="sm"
            color="neutral"
            :variant="sortBy === 'name' ? 'soft' : 'ghost'"
            :trailing-icon="
              sortBy === 'name'
                ? sortDir === 'asc'
                  ? ICONS.SORT_NAME_ASC
                  : ICONS.SORT_NAME_DESC
                : ICONS.SORT_NAME_ASC
            "
            @click="toggleSort('name')"
            >Name</UButton
          >
          <UButton
            size="sm"
            color="neutral"
            :variant="sortBy === '_creationTime' ? 'soft' : 'ghost'"
            :trailing-icon="
              sortBy === '_creationTime'
                ? sortDir === 'asc'
                  ? ICONS.SORT_DATE_ASC
                  : ICONS.SORT_DATE_DESC
                : ICONS.SORT_DATE_ASC
            "
            @click="toggleSort('_creationTime')"

```


**Tool Call: Read file `app/pages/player/[playerId].vue` (lines 1-60)**
Status: Completed

```BR_Skins_Hub/app/pages/player/[playerId].vue
<template>
  <div class="flex w-full flex-col items-center gap-12">
    <section
      v-if="player"
      class="flex w-full max-w-4xl flex-col items-center gap-1 px-2 md:px-4 lg:px-0"
    >
      <div class="relative h-62 w-full">
        <div class="bg-background/0 from-default absolute inset-0 z-10 bg-linear-to-t to-75%" />
        <img :src="player.cover_url" alt="" class="size-full rounded-xl object-cover" />
      </div>
      <!-- Player Info -->
      <span class="z-10 -mt-16 flex w-full items-end justify-start gap-4 px-12">
        <a
          class="size-26 shrink-0"
          :href="`https://osu.ppy.sh/users/${player.osu_id}`"
          target="_blank"
        >
          <img
            :src="`https://a.ppy.sh/${playerId}`"
            alt=""
            class="squircle size-full rounded-3xl object-cover drop-shadow-lg"
          />
        </a>

        <div class="flex w-full items-center">
          <div class="flex flex-col">
            <!-- Player Name and Previous Usernames -->
            <div class="flex">
              <UPopover mode="hover" v-if="player.previous_usernames?.length">
                <h1 class="isHovering cursor-help text-2xl font-medium">{{ player.name }}</h1>
                <template #content>
                  <span class="popover-content gap-2 select-text!">
                    {{ player.previous_usernames?.join(", ") }}
                  </span>
                </template>
              </UPopover>
              <h1 v-else class="isHovering cursor-help text-2xl font-medium">{{ player.name }}</h1>
            </div>

            <!-- Player Description -->
            <div v-if="isOwnProfile" class="text-toned -mt-2">
              <p>The first line of your description goes here unformatted.</p>
            </div>
          </div>

          <!-- Player Links -->
          <div class="ml-auto"></div>
        </div>
      </span>
    </section>

    <section class="flex w-full max-w-4xl flex-col px-2 md:px-4 lg:px-0">
      <div class="flex w-full justify-between">
        <UTabs v-model="activeTab" :items="tabs" size="sm" variant="pill" />
        <UInput
          v-if="activeTab === 'skins'"
          placeholder="Search skins..."
          class="search-input-default-size"
          :icon="ICONS.SEARCH"
          v-model="skinSearchQuery"

```


**Tool Call: Read file `app/pages/dashboard/index.vue` (lines 1-50)**
Status: Completed

```BR_Skins_Hub/app/pages/dashboard/index.vue
<template>
  <div class="flex w-full flex-col">
    <!-- Top Bar -->
    <div class="border-muted flex w-full items-center justify-between border-b px-2 py-2">
      <UTabs
        :items="tabItems"
        :model-value="store.tab"
        :content="false"
        variant="link"
        @update:model-value="handleTabChange"
        class="-mb-2"
        :ui="{
          list: 'border-muted',
        }"
      />
      <UButton :icon="ICONS.ADD" :label="createLabel" @click="handleCreateClick" />
    </div>

    <!-- Two-Panel Layout -->
    <div class="grid h-[calc(100vh-10rem)] w-full grid-cols-[320px_1fr]">
      <!-- Left Panel -->
      <div class="border-muted flex w-full flex-col gap-2 overflow-hidden border-r p-2">
        <DashboardPlayerList
          v-if="store.tab === 'players'"
          @request-select="handleRequestSelectPlayer"
        />
        <DashboardSkinList v-else-if="store.tab === 'skins'" />
        <div v-else class="text-muted flex flex-1 items-center justify-center text-sm">
          Requests coming soon.
        </div>
      </div>

      <!-- Right Panel -->
      <div class="flex w-full flex-col items-start overflow-y-auto p-6">
        <div class="flex w-full max-w-xl flex-col">
          <!-- Empty State -->
          <div
            v-if="store.mode === 'empty'"
            class="flex h-full flex-col items-center justify-center gap-3"
          >
            <UEmpty
              title="No items selected"
              description="Select an item from the left panel or create a new one by clicking the button below."
              :actions="[
                {
                  label: createLabel,
                  variant: 'soft',
                  icon: ICONS.ADD,
                  onClick: handleCreateClick,
                },

```


**Tool Call: Read file `server/api/skins/[id]/index.delete.ts`**
Status: Completed

```BR_Skins_Hub/server/api/skins/[id]/index.delete.ts
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id") as Id<"skins">;

  return await convex.mutation(api.skins.deleteSkin, { _id: id });
});

```


**Tool Call: Read file `server/api/players/[id]/index.delete.ts`**
Status: Completed

```BR_Skins_Hub/server/api/players/[id]/index.delete.ts
import { api } from "~~/convex/_generated/api";
import type { Id } from "~~/convex/_generated/dataModel";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id") as Id<"players">;

  return await convex.mutation(api.players.deletePlayer, { player_id: id });
});

```


**Tool Call: Read file `example.env`**
Status: Completed

```BR_Skins_Hub/example.env
CONVEX_DEPLOYMENT= 
CONVEX_URL=

OSU_CLIENT_ID=
OSU_CLIENT_SECRET=

NUXT_UPLOADTHING_TOKEN=

NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NUXT_CLERK_SECRET_KEY=

JWT_SECRET=
CURRENT_DOMAIN=http://localhost:3000

ADMIN_OSU_IDS=
```


## Assistant

<thinking>
Now I have a complete picture of the entire project. Let me create a comprehensive, well-organized step-by-step plan for rebuilding this in SvelteKit.

Let me organize this plan:

## Current Project Summary

**Pages:**
1. `/` - Players list (search, sort, infinite scroll pagination)
2. `/skins` - Skins list (search, sort, infinite scroll)
3. `/player/[playerId]` - Player profile page (cover, avatar, tabs: skins, info, etc.)
4. `/dashboard` - Admin dashboard with two-panel layout (players/skins tabs)


5. `/login` - Login page (osu! OAuth)

**API Routes:**
I'm mapping out the authentication endpoints for osu! OAuth, user management, and player/skin operations, including admin-only creation and updates, public view tracking with rate limiting, and deletion endpoints.

**Convex functions:**
Setting up the backend query and mutation functions for authentication, player management, and data retrieval. Looking at the server utilities, I've got JWT handling with jose for creating and verifying tokens, a helper to extract the user from cookies, admin authorization checks, an in-memory rate limiter, and a singleton ConvexHttpClient. On the frontend, I'm setting up composables for authentication state, toast notifications, draft persistence, unsaved changes protection, fuzzy searching with Fuse.js, image uploads via UploadThing, infinite scrolling, syncing player data from the osu! API, and a utility for resettable refs.

I also need a composable for handling form submissions. For dependencies, I'm keeping convex for the database, jose for JWT, fuse.js for fuzzy filtering, and the osu-api-extended package, but I'm swapping out the Nuxt-specific libraries—replacing @nuxt/ui with shadcn-svelte, @uploadthing/nuxt with @uploadthing/svelte, removing @pinia/nuxt since Svelte has built-in reactivity, and ditching the Vue composition utilities in favor of Svelte's native approach and $app/state for routing.

Now I'm mapping out the migration in phases: first I'll set up the SvelteKit project with TypeScript, Tailwind, and shadcn-svelte, then copy over the Convex schema and functions unchanged. After that I'll establish the server-side foundation with utilities for the Convex client, JWT authentication, admin checks, rate limiting, and global hooks.

Then I'll implement the authentication flow with the osu! OAuth callback, logout endpoint, and root layout to provide user context across pages. Finally I'll build out the API routes for player management—creating, updating, and deleting players through the appropriate endpoints. Now I'm mapping out the utility functions I'll need—fuzzy filtering with Fuse.js, pagination helpers, state management that can reset, and a reusable submit action wrapper. Then I'm planning the public-facing pages starting with the root layout for navigation and footer, the homepage to display the players list, and the skins browsing page.

For the dashboard, I need to set up protected routes with authentication checks, then build out the main dashboard page. I'll also need to install shadcn-svelte components and create any custom components, and finally integrate UploadThing for file uploads with its Svelte adapter and file router configuration. the key improvements - multiple HTTP methods in a single file instead of separate files.

For Convex, the functions themselves stay the same since they're database-agnostic TypeScript, but the setup changes: the frontend client moves away from `convex-nuxt` to just `ConvexHttpClient`, and the server client relocates to `src/lib/server/convex.ts`. Since we're using `load()` functions instead of reactive queries, we might not even need `convex-svelte` at all—though I should double-check if the public pages would benefit from reactivity on the frontend.

Actually, we settled on `load()` with `invalidate()` as the better fit for their needs, so `ConvexHttpClient` alone will work everywhere. Now I'll put together the full migration plan.
</thinking>

Now I have everything I need. Let me write the full roadmap.

---

# BR Skins Hub — SvelteKit Rebuild Roadmap

## How to read this

Each phase must be completed in order since later phases depend on earlier ones. Within a phase, steps that have no dependencies on each other are marked so you can tackle them in any order.

---

## Phase 1 — Project Bootstrap

**1.1 — Scaffold the project**
```/dev/null/terminal.sh#L1-4
npx sv create br-skins-hub-svelte
# Choose: SvelteKit minimal, TypeScript, no additional integrations yet
cd br-skins-hub-svelte
```

**1.2 — Install core dependencies**
```/dev/null/terminal.sh#L1-5
bun add convex jose osu-api-extended fuse.js
bun add -d @types/node
```

**1.3 — Set up Tailwind CSS + shadcn-svelte**

Follow the [shadcn-svelte install guide](https://next.shadcn-svelte.com/docs/installation/sveltekit) — it sets up Tailwind and the component registry together.

**1.4 — Create `.env`**

Mirrors your existing `example.env` exactly, minus Nuxt-specific keys:

```/dev/null/.env#L1-8
CONVEX_DEPLOYMENT=
CONVEX_URL=

OSU_CLIENT_ID=
OSU_CLIENT_SECRET=

JWT_SECRET=
CURRENT_DOMAIN=http://localhost:3000

ADMIN_OSU_IDS=

UPLOADTHING_TOKEN=
```

**1.5 — Copy the `convex/` directory over**

The entire `convex/` folder — `schema.ts`, `players.ts`, `skins.ts`, `playerSkins.ts`, `auth.ts` — is **100% reusable as-is**. Zero changes needed. Just copy it to the root of the new project and run `npx convex dev` to regenerate `_generated/`.

---

## Phase 2 — Server Foundation

These files are the backbone everything else depends on. They live in `src/lib/server/` which SvelteKit treats as **server-only** (can never be imported on the client).

**2.1 — `src/lib/server/convex.ts`**

Identical logic to your current `server/utils/convex.ts`:
```/dev/null/src/lib/server/convex.ts#L1-4
import { ConvexHttpClient } from 'convex/browser';
import { CONVEX_URL } from '$env/static/private';

export const convex = new ConvexHttpClient(CONVEX_URL);
```

**2.2 — `src/lib/server/auth.ts`**

Copy your `server/utils/auth.ts` as-is, only the import path changes:
```/dev/null/src/lib/server/auth.ts#L1-5
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET);
// createToken() and verifyToken() — identical to current code
```

**2.3 — `src/lib/server/admin.ts`**

Copy your `requireAdmin` and `isAdminId` logic. The only difference is it takes `RequestEvent` from SvelteKit instead of `H3Event`:
```/dev/null/src/lib/server/admin.ts#L1-12
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

const getAdminIds = () =>
  new Set((process.env.ADMIN_OSU_IDS ?? '').split(',').map(Number).filter(Boolean));

export const isAdminId = (id: number) => getAdminIds().has(id);

export function requireAdmin(event: RequestEvent) {
  if (!event.locals.user) error(401, 'Unauthorized');
  if (!isAdminId(event.locals.user.osu_id)) error(403, 'Forbidden');
  return event.locals.user;
}
```

**2.4 — `src/lib/server/rateLimit.ts`**

Copy your `server/utils/rateLimit.ts` directly. The `getClientIp` function needs a small tweak — instead of reading from `event.node.req`, you read from SvelteKit's `RequestEvent`:
```/dev/null/src/lib/server/rateLimit.ts#L1-6
// Same Map-based bucket logic
// getClientIp reads from: event.request.headers.get('x-forwarded-for')
//                      or: event.getClientAddress()
// check(event: RequestEvent) instead of check(event: H3Event)
```

**2.5 — `src/app.d.ts`** — tell TypeScript about `locals.user`

```/dev/null/src/app.d.ts#L1-12
declare global {
  namespace App {
    interface Locals {
      user: { osu_id: number } | null;
    }
  }
}
export {};
```

**2.6 — `src/hooks.server.ts`** — the global auth gate

This is what replaces `getUser()` being called manually in every route. It runs on every single request:
```/dev/null/src/hooks.server.ts#L1-14
import { verifyToken } from '$lib/server/auth';

export async function handle({ event, resolve }) {
  const token = event.cookies.get('session');
  event.locals.user = null;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) event.locals.user = payload;
  }

  return resolve(event);
}
```

---

## Phase 3 — Auth Flow

**3.1 — `src/routes/auth/callback/+server.ts`**

Direct port of your `server/api/auth/callback.ts`. The structure is the same — exchange code, fetch osu! profile, upsert user, set cookie, redirect. Only the SvelteKit API differs (`event.cookies.set`, `redirect()` from `@sveltejs/kit`).

**3.2 — `src/routes/auth/logout/+server.ts`**

```/dev/null/src/routes/auth/logout/+server.ts#L1-7
import { redirect } from '@sveltejs/kit';

export function POST({ cookies }) {
  cookies.delete('session', { path: '/' });
  redirect(302, '/');
}
```

**3.3 — `src/routes/+layout.server.ts`** — replaces `useAuth()` + `/api/auth/me`

This is the big architectural improvement. No more `useAuth()` composable fetching an endpoint. The user is provided to every single page for free via SSR:
```/dev/null/src/routes/+layout.server.ts#L1-14
import { isAdminId } from '$lib/server/admin';
import { convex } from '$lib/server/convex';
import { api } from '$lib/convex/_generated/api';

export async function load({ locals }) {
  if (!locals.user) return { user: null };

  const authUser = await convex.query(api.auth.getAuthUser, { osu_id: locals.user.osu_id });

  return {
    user: {
      osu_id: locals.user.osu_id,
      isAdmin: isAdminId(locals.user.osu_id),
      username: authUser?.username ?? null,
      player_id: authUser?.player_id ?? null,
      avatar_url: `https://a.ppy.sh/${locals.user.osu_id}`,
    },
  };
}
```

**3.4 — `src/routes/login/+page.svelte`**

Simple page with an "Login with osu!" button that links to the osu! OAuth URL.

---

## Phase 4 — API Routes

This is where SvelteKit shines vs. your current setup. **Multiple HTTP methods live in one file** instead of one file per method.

### Mapping: Nuxt files → SvelteKit files

| Current (multiple files) | SvelteKit (one file) |
|---|---|
| `players/index.post.ts` | `api/players/+server.ts` → `POST` |
| `players/[id]/index.patch.ts` + `index.delete.ts` | `api/players/[id]/+server.ts` → `PATCH` + `DELETE` |
| `players/[id]/profile.patch.ts` | `api/players/[id]/profile/+server.ts` → `PATCH` |
| `players/[id]/views.post.ts` | `api/players/[id]/views/+server.ts` → `POST` |
| `skins/index.post.ts` | `api/skins/+server.ts` → `POST` |
| `skins/[id]/index.patch.ts` + `index.delete.ts` | `api/skins/[id]/+server.ts` → `PATCH` + `DELETE` |
| `skins/[id]/download.post.ts` | `api/skins/[id]/download/+server.ts` → `POST` |
| `player-skins/[playerId].put.ts` | `api/player-skins/[playerId]/+server.ts` → `PUT` |
| `player/refresh.ts` | `api/player/refresh/+server.ts` → `GET` |

**What changes in each route:**
- `requireAdmin(event)` → same function, different import
- `getRouterParam(event, 'id')` → `event.params.id`
- `readBody(event)` → `await event.request.json()`
- `createError({ statusCode, message })` → `error(statusCode, message)` from `@sveltejs/kit`
- Return values → `json(data)` from `@sveltejs/kit` or `new Response(...)`

The validation logic and Convex calls are **identical**.

---

## Phase 5 — Shared Utilities

These replace your Vue composables with Svelte 5 equivalents. They live in `src/lib/utils/`.

**5.1 — `src/lib/utils/fuzzyFilter.svelte.ts`** — replaces `useFuzzyFilter`

Same Fuse.js logic, wrapped in `$derived` instead of `computed`:
```/dev/null/src/lib/utils/fuzzyFilter.svelte.ts#L1-14
import Fuse from 'fuse.js';

export function useFuzzyFilter<T>(
  list: () => T[],
  query: () => string,
  options: Fuse.IFuseOptions<T>
) {
  return $derived.by(() => {
    const q = query();
    if (!q.trim()) return list();
    return new Fuse(list(), options).search(q).map((r) => r.item);
  });
}
```

**5.2 — `src/lib/utils/loadMore.svelte.ts`** — replaces `useLoadMore`

Same pagination logic, using `$state` and `$derived` instead of `ref` and `computed`.

**5.3 — `src/lib/utils/resettableState.svelte.ts`** — replaces `useResettableRef`

```/dev/null/src/lib/utils/resettableState.svelte.ts#L1-12
export function useResettableState<T>(getDefaults: () => T) {
  let state = $state<T>(getDefaults());

  return {
    get state() { return state; },
    set state(v) { state = v; },
    reset() { state = getDefaults(); },
  };
}
```

**5.4 — `src/lib/utils/toast.ts`** — replaces `useAppToast`

shadcn-svelte has a `Sonner` toast component. This wraps it with your success/error/info helpers.

---

## Phase 6 — Pages (Public)

**6.1 — `src/routes/+layout.svelte`**

Replaces `app.vue`. Has the nav, footer, and `{@render children()}`. Gets `data.user` from the layout server load — no `useAuth()` needed.

**6.2 — `src/routes/+page.server.ts`** — players list

```/dev/null/src/routes/+page.server.ts#L1-10
import { convex } from '$lib/server/convex';
import { api } from '$lib/convex/_generated/api';

export async function load({ depends }) {
  depends('app:players');
  const players = await convex.query(api.players.listPlayers);
  return { players };
}
```

**6.3 — `src/routes/+page.svelte`** — players list UI

Uses `data.players`, `useFuzzyFilter`, `useLoadMore`, and a native `IntersectionObserver` action for infinite scroll. All the sort/filter/paginate logic maps 1:1 from the Vue version.

**6.4 — `src/routes/skins/+page.server.ts`** + **`+page.svelte`**

Same pattern as players list but using `api.skins.listSkinsWithPlayers`.

**6.5 — `src/routes/player/[playerId]/+page.server.ts`** + **`+page.svelte`**

```/dev/null/src/routes/player/[playerId]/+page.server.ts#L1-14
export async function load({ params, depends }) {
  depends('app:player:' + params.playerId);

  const [player, skins] = await Promise.all([
    convex.query(api.players.getPlayerByOsuId, { osu_id: Number(params.playerId) }),
    convex.query(api.playerSkins.getSkinsByOsuId, { osu_id: Number(params.playerId) }),
  ]);

  if (!player) error(404, 'Player not found');

  return { player, skins };
}
```

---

## Phase 7 — Dashboard

**7.1 — `src/routes/dashboard/+layout.server.ts`** — route protection

Replaces your client-side `auth.global.ts` middleware with server-side protection:
```/dev/null/src/routes/dashboard/+layout.server.ts#L1-7
import { redirect } from '@sveltejs/kit';
import { isAdminId } from '$lib/server/admin';

export function load({ locals }) {
  if (!locals.user || !isAdminId(locals.user.osu_id)) redirect(302, '/login');
}
```

**7.2 — `src/routes/dashboard/+page.server.ts`**

Pre-loads the players and skins lists for the two panels.

**7.3 — `src/routes/dashboard/+page.svelte`**

The two-panel layout. Manages selected player/skin state using `$state`. Calls the API routes for mutations, then `invalidate()` to refresh.

---

## Phase 8 — UploadThing

**8.1 — Install `@uploadthing/svelte`**

The UploadThing API and configuration is identical — same file router concept, just different framework bindings.

**8.2 — `src/routes/api/uploadthing/+server.ts`**

Replaces `server/uploadthing.ts`.

---

## Final Project File Structure

```/dev/null/structure.txt#L1-50
src/
├── app.d.ts                          ← locals type
├── hooks.server.ts                   ← global JWT auth
├── lib/
│   ├── server/                       ← server-only, never in client
│   │   ├── convex.ts                 ← ConvexHttpClient singleton
│   │   ├── auth.ts                   ← JWT create/verify
│   │   ├── admin.ts                  ← requireAdmin, isAdminId
│   │   └── rateLimit.ts              ← in-memory rate limiter
│   ├── utils/
│   │   ├── fuzzyFilter.svelte.ts
│   │   ├── loadMore.svelte.ts
│   │   ├── resettableState.svelte.ts
│   │   └── toast.ts
│   └── components/                   ← shadcn + custom components
└── routes/
    ├── +layout.server.ts             ← provides user to all pages
    ├── +layout.svelte                ← nav + footer
    ├── +page.server.ts               ← players list load
    ├── +page.svelte                  ← players list UI
    ├── auth/
    │   ├── callback/+server.ts       ← osu! OAuth
    │   └── logout/+server.ts
    ├── login/+page.svelte
    ├── skins/
    │   ├── +page.server.ts
    │   └── +page.svelte
    ├── player/[playerId]/
    │   ├── +page.server.ts
    │   └── +page.svelte
    ├── dashboard/
    │   ├── +layout.server.ts         ← admin gate
    │   ├── +page.server.ts
    │   └── +page.svelte
    └── api/
        ├── players/
        │   ├── +server.ts            ← POST
        │   └── [id]/
        │       ├── +server.ts        ← PATCH, DELETE
        │       ├── profile/+server.ts ← PATCH
        │       └── views/+server.ts   ← POST
        ├── skins/
        │   ├── +server.ts            ← POST
        │   └── [id]/
        │       ├── +server.ts        ← PATCH, DELETE
        │       └── download/+server.ts ← POST
        ├── player/refresh/+server.ts  ← GET
        ├── player-skins/[playerId]/+server.ts ← PUT
        └── uploadthing/+server.ts

convex/                               ← copied as-is, zero changes
├── schema.ts
├── auth.ts
├── players.ts
├── skins.ts
└── playerSkins.ts
```

---

## Suggested Order to Start

1. ✅ Phase 1 — get the project running with shadcn
2. ✅ Phase 2 — server foundation (unblocks everything else)
3. ✅ Phase 3 — auth (you need to be able to log in to test anything)
4. ✅ Phase 4 — API routes (consolidate the files, port the logic)
5. ✅ Phase 6.2 + 6.3 — homepage + layout (first thing you'll actually see)
6. ✅ Phase 5 — utilities (as you need them when building pages)
7. ✅ Phase 6.4 + 6.5 — remaining public pages
8. ✅ Phase 7 — dashboard
9. ✅ Phase 8 — UploadThing last since it's isolated

Whenever you're ready to start a specific phase, just say which one and I'll help you build it step by step.

## User (checkpoint)

write that down on a markdown file so its easier to digest and also move it around (It will be important as context too)

## Assistant

<thinking>
The user wants me to write the roadmap as a markdown file in their project. Let me create a well-formatted markdown file with the complete roadmap. I'll put it in the BR_Skins_Hub project directory since that's the current project, or maybe at the root level. Actually, since this is a roadmap for the NEW SvelteKit project, I could put it in the docs folder or at the root level. Let me check if there's already a docs folder.

Looking at the project structure, there's already a `docs` folder in `BR_Skins_Hub`. Let me put it there, or maybe just at the root of `BR_Skins_Hub` since it's easily accessible.


Since this is for the new SvelteKit rebuild, I should place it somewhere easily accessible—I'll put it at the root of `BR_Skins_Hub` as `SVELTEKIT_REBUILD.md` so it's prominent and the user can move it around as needed.
</thinking>

**Tool Call: List the `BR_Skins_Hub/docs` directory's contents**
Status: Completed

# Folders:
BR_Skins_Hub/docs/agent-standards
BR_Skins_Hub/docs/workflows


**Tool Call: List the `BR_Skins_Hub/docs/workflows` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/docs/workflows/adding-player-field.md


**Tool Call: List the `BR_Skins_Hub/docs/agent-standards` directory's contents**
Status: Completed


# Files:
BR_Skins_Hub/docs/agent-standards/overview.md
BR_Skins_Hub/docs/agent-standards/script-setup-order.md
BR_Skins_Hub/docs/agent-standards/security-checklist.md
BR_Skins_Hub/docs/agent-standards/toast-loading-consistency.md


## Assistant

<thinking>
I'll put the rebuild roadmap at the root level of `BR_Skins_Hub` as `sveltekit-rebuild.md` since it's a top-level planning document, not specific to the docs/workflows or docs/agent-standards subfolders. That makes it easy to find and move.
</thinking>

I'll put it at the root of the project so it's easy to find and grab.

**Tool Call: sveltekit\-rebuild.md**
Status: Completed

Diff: sveltekit-rebuild.md
```
# BR Skins Hub — SvelteKit Rebuild Roadmap

## Overview

Full rebuild of BR Skins Hub from Nuxt/Vue to SvelteKit/Svelte 5.

**Why:**
- API routes are cleaner — multiple HTTP methods in one file instead of one file per method
- Auth is more secure — server-side route protection via `hooks.server.ts` + `locals`, no client middleware
- No need for Pinia — Svelte 5 runes handle all state
- Better `load()` + `invalidate()` pattern replaces `useAsyncData` + manual refresh
- Great learning experience with SvelteKit

**What stays the same:**
- The entire `convex/` directory (schema + all functions) — zero changes needed
- JWT auth logic (`jose`)
- osu! OAuth flow
- Rate limiting logic
- All Convex mutations and queries
- UploadThing (just different framework bindings)

**What changes:**
- Nuxt UI → shadcn-svelte
- Pinia store → `$state` in `.svelte.ts` files
- Vue composables → Svelte 5 utility functions
- `useConvexQuery` reactive queries → `load()` + `invalidate()`
- `CONVEX_URL` stays private (never sent to client)
- Client-side auth middleware → server-side layout protection

---

## Key Architectural Decisions

### No reactive Convex client on the frontend
The app doesn't need live real-time updates — data changes rarely. Instead:
- `+page.server.ts` `load()` functions fetch data via `ConvexHttpClient` (SSR, fast, SEO-friendly)
- After any mutation, call `invalidate('app:key')` to re-run the relevant `load()` and get fresh data
- `CONVEX_URL` stays a private server-only env var, never exposed to the browser

### Auth via `hooks.server.ts` + `locals`
- JWT cookie is verified once per request in `hooks.server.ts`
- Result is attached to `event.locals.user`
- Every `+page.server.ts`, `+layout.server.ts`, and `+server.ts` has access to `event.locals.user` automatically
- No `/api/auth/me` endpoint needed — user is SSR'd into the root layout and flows down to every page via `data.user`

### Route protection is server-side
- `/dashboard/*` is protected by `src/routes/dashboard/+layout.server.ts` which redirects non-admins before any page renders
- This replaces the client-side `auth.global.ts` middleware (which could be bypassed before JS loaded)

---

## Environment Variables

```env
CONVEX_DEPLOYMENT=
CONVEX_URL=

OSU_CLIENT_ID=
OSU_CLIENT_SECRET=

JWT_SECRET=
CURRENT_DOMAIN=http://localhost:3000

ADMIN_OSU_IDS=

UPLOADTHING_TOKEN=
```

---

## Final Project File Structure

```
src/
├── app.d.ts                              ← App.Locals type (user)
├── hooks.server.ts                       ← Global JWT verification on every request
├── lib/
│   ├── server/                           ← Server-only, can never be imported on client
│   │   ├── convex.ts                     ← ConvexHttpClient singleton
│   │   ├── auth.ts                       ← JWT createToken / verifyToken (jose)
│   │   ├── admin.ts                      ← requireAdmin(), isAdminId()
│   │   └── rateLimit.ts                  ← In-memory rate limiter
│   ├── utils/
│   │   ├── fuzzyFilter.svelte.ts         ← Fuse.js wrapper (replaces useFuzzyFilter)
│   │   ├── loadMore.svelte.ts            ← Pagination (replaces useLoadMore)
│   │   ├── resettableState.svelte.ts     ← Resettable state (replaces useResettableRef)
│   │   └── toast.ts                      ← Toast helpers (replaces useAppToast)
│   └── components/                       ← shadcn-svelte + custom components
│       ├── ui/                           ← shadcn primitives (auto-generated)
│       ├── PlayerCard.svelte
│       ├── SkinCard.svelte
│       ├── MainPlayerCard.svelte
│       └── ...
└── routes/
    ├── +layout.server.ts                 ← Loads user for every page (replaces useAuth)
    ├── +layout.svelte                    ← Nav + footer (replaces app.vue)
    ├── +page.server.ts                   ← Players list data
    ├── +page.svelte                      ← Players list UI (homepage)
    ├── auth/
    │   ├── callback/+server.ts           ← osu! OAuth callback
    │   └── logout/+server.ts            ← Clears session cookie
    ├── login/
    │   └── +page.svelte                  ← Login page (osu! OAuth button)
    ├── skins/
    │   ├── +page.server.ts
    │   └── +page.svelte
    ├── player/[playerId]/
    │   ├── +page.server.ts
    │   └── +page.svelte
    ├── dashboard/
    │   ├── +layout.server.ts             ← Admin-only gate (redirects non-admins)
    │   ├── +page.server.ts
    │   └── +page.svelte
    └── api/
        ├── players/
        │   ├── +server.ts                ← POST (create player)
        │   └── [id]/
        │       ├── +server.ts            ← PATCH (update player) + DELETE
        │       ├── profile/
        │       │   └── +server.ts        ← PATCH (update profile — owner or admin)
        │       └── views/
        │           └── +server.ts        ← POST (increment views, rate-limited)
        ├── skins/
        │   ├── +server.ts                ← POST (create skin)
        │   └── [id]/
        │       ├── +server.ts            ← PATCH (update skin) + DELETE
        │       └── download/
        │           └── +server.ts        ← POST (increment download count)
        ├── player/
        │   └── refresh/
        │       └── +server.ts            ← GET (refresh player info from osu! API)
        ├── player-skins/
        │   └── [playerId]/
        │       └── +server.ts            ← PUT (update player↔skin relations)
        └── uploadthing/
            └── +server.ts                ← UploadThing file router

convex/                                   ← Copied as-is from Nuxt project, zero changes
├── _generated/                           ← Auto-generated by `npx convex dev`
├── schema.ts
├── auth.ts
├── players.ts
├── skins.ts
└── playerSkins.ts
```

---

## Nuxt API Routes → SvelteKit API Routes Mapping

One of the main wins: multiple HTTP methods live in one file.

| Nuxt (one file per method) | SvelteKit (one file, multiple exports) |
|---|---|
| `server/api/players/index.post.ts` | `api/players/+server.ts` → `export const POST` |
| `server/api/players/[id]/index.patch.ts` | `api/players/[id]/+server.ts` → `export const PATCH` |
| `server/api/players/[id]/index.delete.ts` | same file → `export const DELETE` |
| `server/api/players/[id]/profile.patch.ts` | `api/players/[id]/profile/+server.ts` → `export const PATCH` |
| `server/api/players/[id]/views.post.ts` | `api/players/[id]/views/+server.ts` → `export const POST` |
| `server/api/skins/index.post.ts` | `api/skins/+server.ts` → `export const POST` |
| `server/api/skins/[id]/index.patch.ts` | `api/skins/[id]/+server.ts` → `export const PATCH` |
| `server/api/skins/[id]/index.delete.ts` | same file → `export const DELETE` |
| `server/api/skins/[id]/download.post.ts` | `api/skins/[id]/download/+server.ts` → `export const POST` |
| `server/api/player-skins/[playerId].put.ts` | `api/player-skins/[playerId]/+server.ts` → `export const PUT` |
| `server/api/player/refresh.ts` | `api/player/refresh/+server.ts` → `export const GET` |
| `server/api/auth/callback.ts` | `auth/callback/+server.ts` → `export const GET` |
| `server/api/auth/logout.ts` | `auth/logout/+server.ts` → `export const POST` |

### Nuxt → SvelteKit API syntax differences

| Nuxt (H3) | SvelteKit |
|---|---|
| `getRouterParam(event, 'id')` | `event.params.id` |
| `readBody(event)` | `await event.request.json()` |
| `createError({ statusCode, message })` | `error(statusCode, message)` from `@sveltejs/kit` |
| `getQuery(event)` | `event.url.searchParams.get('key')` |
| `getCookie(event, 'session')` | `event.cookies.get('session')` |
| `setCookie(event, ...)` | `event.cookies.set(...)` |
| `deleteCookie(event, ...)` | `event.cookies.delete(...)` |
| `sendRedirect(event, '/')` | `redirect(302, '/')` from `@sveltejs/kit` |
| `return { data }` | `return json({ data })` from `@sveltejs/kit` |
| `requireAdmin(event)` | `requireAdmin(event)` — same signature, different import |

---

## Convex Functions Reference

All of these live in `convex/` and are copied unchanged.

### `convex/auth.ts`
| Function | Type | Description |
|---|---|---|
| `auth.getAuthUser` | query | Get auth user record by osu_id |
| `auth.upsertUser` | mutation | Create or update auth user on login |

### `convex/players.ts`
| Function | Type | Description |
|---|---|---|
| `players.listPlayers` | query | Get all players |
| `players.getPlayer` | query | Get player by Convex ID |
| `players.getPlayerByOsuId` | query | Get player by osu! ID |
| `players.createPlayer` | mutation | Create new player (admin) |
| `players.updatePlayer` | mutation | Update basic player info (admin) |
| `players.updatePlayerProfile` | mutation | Update profile — description, links (owner or admin) |
| `players.incrementPlayerViews` | mutation | Increment view count |
| `players.deletePlayer` | mutation | Delete player (admin) |

### `convex/skins.ts`
| Function | Type | Description |
|---|---|---|
| `skins.listSkins` | query | Get all skins |
| `skins.listSkinsWithPlayers` | query | Get all skins with their associated player names |
| `skins.getSkin` | query | Get single skin by ID |
| `skins.createSkin` | mutation | Create new skin (admin) |
| `skins.updateSkin` | mutation | Update skin fields (admin) |
| `skins.deleteSkin` | mutation | Delete skin (admin) |

### `convex/playerSkins.ts`
| Function | Type | Description |
|---|---|---|
| `playerSkins.getSkinsByPlayer` | query | Get skins for a player by Convex player ID |
| `playerSkins.getSkinsByOsuId` | query | Get skins for a player by osu! ID |
| `playerSkins.updatePlayerSkins` | mutation | Sync player↔skin relations (diff and apply) |

---

## VueUse → Svelte Replacements

| VueUse | Svelte equivalent |
|---|---|
| `useRouteParams` | `page.params` from `$app/state` — built-in |
| `useSorted` | `$derived(() => [...list].sort(...))` |
| `useIntersectionObserver` | Svelte `use:` action with native `IntersectionObserver` |
| `useClipboard` | `navigator.clipboard.writeText()` directly |
| `formatTimeAgo` | `date-fns` `formatDistanceToNow()` |

### `useIntersectionObserver` as a Svelte action

```ts
// src/lib/actions/intersect.ts
export function intersect(node: Element, callback: () => void) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) callback();
  });
  observer.observe(node);
  return { destroy: () => observer.disconnect() };
}

// Usage: <div use:intersect={loadMore} />
```

---

## Phase Checklist

Complete phases in order. Within a phase, steps with no dependencies on each other can be done in any order.

### Phase 1 — Project Bootstrap
- [ ] Scaffold SvelteKit project with TypeScript (`npx sv create`)
- [ ] Install core dependencies: `convex`, `jose`, `osu-api-extended`, `fuse.js`
- [ ] Install and configure shadcn-svelte (sets up Tailwind too)
- [ ] Create `.env` from the template above
- [ ] Copy `convex/` directory from Nuxt project
- [ ] Run `npx convex dev` to regenerate `_generated/`

### Phase 2 — Server Foundation
- [ ] `src/app.d.ts` — `App.Locals` interface with `user` type
- [ ] `src/lib/server/convex.ts` — `ConvexHttpClient` singleton
- [ ] `src/lib/server/auth.ts` — `createToken`, `verifyToken` (copy from Nuxt, same logic)
- [ ] `src/lib/server/admin.ts` — `requireAdmin`, `isAdminId` (port from Nuxt)
- [ ] `src/lib/server/rateLimit.ts` — in-memory rate limiter (port from Nuxt, update `getClientIp` to use `event.getClientAddress()`)
- [ ] `src/hooks.server.ts` — global JWT verification, populates `event.locals.user`

### Phase 3 — Auth Flow
- [ ] `src/routes/auth/callback/+server.ts` — osu! OAuth callback (port from Nuxt)
- [ ] `src/routes/auth/logout/+server.ts` — delete session cookie + redirect
- [ ] `src/routes/+layout.server.ts` — load user for every page (replaces `useAuth` + `/api/auth/me`)
- [ ] `src/routes/login/+page.svelte` — login page with osu! OAuth link

### Phase 4 — API Routes
- [ ] `api/players/+server.ts` — `POST` create player
- [ ] `api/players/[id]/+server.ts` — `PATCH` update player + `DELETE`
- [ ] `api/players/[id]/profile/+server.ts` — `PATCH` update profile
- [ ] `api/players/[id]/views/+server.ts` — `POST` increment views (with rate limiter)
- [ ] `api/skins/+server.ts` — `POST` create skin
- [ ] `api/skins/[id]/+server.ts` — `PATCH` update skin + `DELETE`
- [ ] `api/skins/[id]/download/+server.ts` — `POST` increment download count
- [ ] `api/player-skins/[playerId]/+server.ts` — `PUT` update player↔skin relations
- [ ] `api/player/refresh/+server.ts` — `GET` refresh player from osu! API

### Phase 5 — Shared Utilities
- [ ] `src/lib/utils/fuzzyFilter.svelte.ts` — Fuse.js wrapper with `$derived`
- [ ] `src/lib/utils/loadMore.svelte.ts` — pagination with `$state` + `$derived`
- [ ] `src/lib/utils/resettableState.svelte.ts` — resettable `$state`
- [ ] `src/lib/utils/toast.ts` — Sonner toast helpers (success, error, info)
- [ ] `src/lib/actions/intersect.ts` — IntersectionObserver action for infinite scroll

### Phase 6 — Public Pages
- [ ] `src/routes/+layout.svelte` — nav, footer, `{@render children()}`
- [ ] `src/routes/+page.server.ts` + `+page.svelte` — players list (homepage)
- [ ] `src/routes/skins/+page.server.ts` + `+page.svelte` — skins list
- [ ] `src/routes/player/[playerId]/+page.server.ts` + `+page.svelte` — player profile

### Phase 7 — Dashboard
- [ ] `src/routes/dashboard/+layout.server.ts` — admin-only gate
- [ ] `src/routes/dashboard/+page.server.ts` — load players + skins lists
- [ ] `src/routes/dashboard/+page.svelte` — two-panel layout with editors

### Phase 8 — UploadThing
- [ ] Install `@uploadthing/svelte`
- [ ] `src/routes/api/uploadthing/+server.ts` — file router
- [ ] Wire up upload components in the dashboard

---

## Components to Build

These are the custom UI components that need to be rebuilt using shadcn-svelte primitives.

| Component | Used in | Notes |
|---|---|---|
| `PlayerCard.svelte` | Homepage | Player list item with avatar, name, osu! ID |
| `MainPlayerCard.svelte` | Homepage | Compact card variant |
| `SkinCard.svelte` | Skins page, player profile | Skin preview with download button, context menu |
| `UserNavCard.svelte` | Layout nav | Shows avatar + username or login button |
| `PlayerSkinSelector.svelte` | Dashboard | Multi-select skin assignment with fuzzy search |
| `Dashboard/PlayerList.svelte` | Dashboard | Left panel player list with search |
| `Dashboard/SkinList.svelte` | Dashboard | Left panel skin list with search |
| `Dashboard/PlayerEditor.svelte` | Dashboard | Right panel player edit form |
| `Dashboard/SkinEditor.svelte` | Dashboard | Right panel skin edit form |
| `Dashboard/SkinQuickEditModal.svelte` | Dashboard | Quick edit modal for skins |

---

## Notes

- The `convex/` directory is **not a SvelteKit thing** — it deploys separately with `npx convex deploy`. The SvelteKit app just consumes it via the generated API.
- `$env/static/private` imports (like `CONVEX_URL`, `JWT_SECRET`) are build-time constants that Vite strips from the client bundle entirely — they can never leak.
- For the `invalidate()` pattern: load functions declare `depends('app:players')` and after any mutation the page calls `invalidate('app:players')`. This re-runs only the relevant load function and updates `data` reactively.
- shadcn-svelte components live in `src/lib/components/ui/` and are added via `npx shadcn-svelte@latest add <component>`.
- The osu! avatar URL pattern `https://a.ppy.sh/{osu_id}` works the same way — no changes needed.

```


## Assistant

Done. The file is at `BR_Skins_Hub/sveltekit-rebuild.md`.

It's structured so you can use it in three ways:
- **As a checklist** — the Phase Checklist section at the bottom has every single file as a checkbox you can tick off as you go
- **As a reference** — the mapping tables (Nuxt → SvelteKit routes, H3 → SvelteKit API syntax, VueUse → Svelte) are quick lookups while you're porting code
- **As context for an AI** — if you start a new chat on the SvelteKit project and paste this file in, it has everything needed to understand the architecture, the decisions, and what still needs to be done

Whenever you're ready to start Phase 1 or any specific phase, just say the word.

## User

I need you to find about svelte packages on their page that will help me build this project more easier

## Assistant

<thinking>
The user wants me to research Svelte/SvelteKit ecosystem packages that would help them build the BR Skins Hub project. Let me think about what they need based on the roadmap:

1. **UI Components** - shadcn-svelte (already decided)
2. **Icons** - they use icons extensively (currently using Iconify/UnoCSS icons via Nuxt UI)
3. **Toast notifications** - Sonner for Svelte
4. **Date utilities** - for formatTimeAgo
5. **Form handling** - maybe something for forms
6. **Image handling** - they use UploadThing
7. **Any other utilities**


8. **Motion/animation libraries**
9. **Context menus, tooltips, modals/dialogs**

Now I'm looking through the Svelte ecosystem to find packages that cover these needs—icon libraries, notification systems, utility helpers similar to VueUse, date handling, form solutions, and UI patterns like animations and interactive components.
</thinking>

Let me check the official Svelte ecosystem pages and relevant package docs to find what's actually available and useful for your specific project.

**Tool Call: Fetch `https://svelte.dev/ecosystem`**
Status: Failed

status error 404, response: "<!doctype html>\n<html lang=\"en\" class=\"theme-default typo-default\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />\n\t\t<meta name=\"theme-color\" content=\"#ff3e00\" />\n\n\t\t<link rel=\"manifest\" href=\"/manifest.json\" />\n\t\t<link rel=\"icon\" type=\"image/png\" href=\"/favicon.png\" />\n\n\t\t<meta name=\"twitter:site\" content=\"@sveltejs\" />\n\t\t<meta name=\"twitter:creator\" content=\"@sveltejs\" />\n\n\t\t<link\n\t\t\trel=\"search\"\n\t\t\ttype=\"application/opensearchdescription+xml\"\n\t\t\thref=\"/opensearch.xml\"\n\t\t\ttitle=\"Svelte\"\n\t\t/>\n\n\t\t<script>\n\t\t\tdocument.documentElement.classList.add(\n\t\t\t\t`font-${localStorage.getItem('svelte:font') ?? 'elegant'}`\n\t\t\t);\n\t\t</script>\n\n\t\t<!--12qhfyh--><!--[0--><meta name=\"twitter:card\" content=\"summary\"/> <meta name=\"twitter:image\" content=\"https://svelte.dev/images/twitter-thumbnail.jpg\"/> <meta name=\"og:image\" content=\"https://svelte.dev/images/twitter-thumbnail.jpg\"/><!--]--><!----><!--16r4un1--><script>\n\t\t{\n\t\t\tconst theme = localStorage.getItem('sv:theme');\n\n\t\t\tdocument.documentElement.classList.add(\n\t\t\t\t!theme || theme === 'system'\n\t\t\t\t\t? window.matchMedia('(prefers-color-scheme: dark)').matches\n\t\t\t\t\t\t? 'dark'\n\t\t\t\t\t\t: 'light'\n\t\t\t\t\t: theme\n\t\t\t);\n\t\t}\n\t</script><!----><!----><!--16r4un1--><script>\n\t\t{\n\t\t\tconst theme = localStorage.getItem('sv:theme');\n\n\t\t\tdocument.documentElement.classList.add(\n\t\t\t\t!theme || theme === 'system'\n\t\t\t\t\t? window.matchMedia('(prefers-color-scheme: dark)').matches\n\t\t\t\t\t\t? 'dark'\n\t\t\t\t\t\t: 'light'\n\t\t\t\t\t: theme\n\t\t\t);\n\t\t}\n\t</script><!----><!----><!--1j96wlh--><!----><title>404</title>\n\t\t<style>svg.svelte-hfc14b{vertical-align:middle;-o-object-fit:contain;object-fit:contain;transform-origin:50%;stroke:currentColor;stroke-width:2px;stroke-linecap:round;stroke-linejoin:round;fill:none;position:relative;overflow:hidden}\n\n.outer.svelte-1j96wlh{padding:0 var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);flex-direction:column;justify-content:center;align-items:center;width:100%;height:100%;display:flex}.inner.svelte-1j96wlh{text-align:center;text-wrap:balance;max-width:48rem}.inner.svelte-1j96wlh a:where(.svelte-1j96wlh){text-wrap:nowrap}p.svelte-1j96wlh{margin:1em auto}\n</style>\n\t\t<link href=\"./_app/immutable/assets/stores.DoLKfBGK.css\" rel=\"stylesheet\" disabled media=\"(max-width: 0)\">\n\t\t<link href=\"./_app/immutable/assets/search.Bf59X-yG.css\" rel=\"stylesheet\">\n\t\t<link href=\"./_app/immutable/assets/Text.VHKouIL-.css\" rel=\"stylesheet\">\n\t\t<link href=\"./_app/immutable/assets/components.CAIh7XZF.css\" rel=\"stylesheet\">\n\t\t<link href=\"./_app/immutable/assets/0.qrmhJS98.css\" rel=\"stylesheet\">\n\t\t<link href=\"./_app/immutable/assets/1.CciMtt34.css\" rel=\"stylesheet\" disabled media=\"(max-width: 0)\">\n\t</head>\n\t<body data-sveltekit-preload-data=\"hover\">\n\t\t<script>\n\t\t\t{\n\t\t\t\tconst div = document.createElement('div');\n\n\t\t\t\tObject.assign(div.style, {\n\t\t\t\t\twidth: '100px',\n\t\t\t\t\theight: '100px',\n\t\t\t\t\toverflow: 'scroll',\n\t\t\t\t\tposition: 'absolute',\n\t\t\t\t\ttop: '-9999px'\n\t\t\t\t});\n\n\t\t\t\tdocument.body.append(div);\n\n\t\t\t\tdocument.documentElement.classList.add(\n\t\t\t\t\tdiv.offsetWidth - div.clientWidth > 0 ? 'scrollbars-visible' : 'scrollbars-invisible'\n\t\t\t\t);\n\n\t\t\t\tdiv.remove();\n\t\t\t}\n\t\t</script>\n\n\t\t<div style=\"height: 100%\"><!--[--><!--[0--><!--[--><div style=\"display: none\"><svg><symbol id=\"arrow-left\" class=\"icon\" viewBox=\"0 0 24 24\"><line x1=\"19\" y1=\"12\" x2=\"5\" y2=\"12\"></line><polyline points=\"12 19 5 12 12 5\"></polyline></symbol><symbol id=\"arrow-right\" class=\"icon\" viewBox=\"0 0 24 24\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line><polyline points=\"12 5 19 12 12 19\"></polyline></symbol><symbol id=\"arrow-right-chevron\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M8.7 17.3q-.275-.275-.275-.7t.275-.7l3.9-3.9l-3.9-3.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375q0 .2-.063.375t-.212.325l-4.6 4.6q-.275.275-.7.275t-.7-.275Z\"></path></symbol><symbol id=\"arrow-up\" class=\"icon\" viewBox=\"0 0 24 24\"><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"></line><polyline points=\"5 12 12 5 19 12\"></polyline></symbol><symbol id=\"arrow-down\" class=\"icon\" viewBox=\"0 0 24 24\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><polyline points=\"19 12 12 19 5 12\"></polyline></symbol><symbol id=\"check\" class=\"icon\" viewBox=\"0 0 24 24\"><polyline points=\"20 6 9 17 4 12\"></polyline></symbol><symbol id=\"close\" class=\"icon\" viewBox=\"0 0 24 24\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line></symbol><symbol id=\"download\" class=\"icon\" viewBox=\"0 0 24 24\"><path d=\"M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15\"></path><polyline points=\"7 10 12 15 17 10\"></polyline><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"></line></symbol><symbol id=\"edit\" class=\"icon\" viewBox=\"0 0 24 24\"><path d=\"M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34\"></path><polygon points=\"18 2 22 6 12 16 8 16 8 12 18 2\"></polygon></symbol><symbol id=\"git-branch\" class=\"icon\" viewBox=\"0 0 24 24\"><line x1=\"6\" y1=\"3\" x2=\"6\" y2=\"15\"></line><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M18 9a9 9 0 0 1-9 9\"></path></symbol><symbol id=\"log-in\" class=\"icon\" viewBox=\"0 0 24 24\"><path d=\"M15 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15\"></path><polyline points=\"10 17 15 12 10 7\"></polyline><line x1=\"15\" y1=\"12\" x2=\"3\" y2=\"12\"></line></symbol><symbol id=\"maximize\" class=\"icon\" viewBox=\"0 0 24 24\"><path d=\"M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3\"></path></symbol><symbol id=\"maximize-2\" class=\"icon\" viewBox=\"0 0 24 24\"><polyline points=\"15 3 21 3 21 9\"></polyline><polyline points=\"9 21 3 21 3 15\"></polyline><line x1=\"21\" y1=\"3\" x2=\"14\" y2=\"10\"></line><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"></line></symbol><symbol id=\"menu\" viewBox=\"0 0 48 48\"><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M7.95 11.95h32m-32 12h32m-32 12h32\"></path></symbol><symbol id=\"message-square\" class=\"icon\" viewBox=\"0 0 24 24\"><g transform=\"translate(0, 1)\"><path d=\"M16.5 19H11V15H18V11H22V19H19.5L18 20.5L16.5 19Z\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M2 3H18V15H8.5L6.5 17L4.5 15H2V3 M5 10L5 12L10 12L10 10  M5 6L5 9L13 9L13 6Z\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></g></symbol><symbol id=\"minus\" class=\"icon\" viewBox=\"0 0 24 24\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></symbol><symbol id=\"plus\" class=\"icon\" viewBox=\"0 0 24 24\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></symbol><symbol id=\"save\" class=\"icon\" viewBox=\"0 0 24 24\"><path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"></path><polyline points=\"17 21 17 13 7 13 7 21\"></polyline><polyline points=\"7 3 7 8 15 8\"></polyline></symbol><symbol id=\"link\" class=\"icon\" viewBox=\"0 0 24 24\"><path d=\"M9,7L6,7A2 2 0 0 0 6,17L9,17\"></path><path d=\"M15,7L18,7A2 2 0 0 1 18,17L15,17\"></path><path d=\"M7,12L17,12\"></path></symbol><symbol viewBox=\"0 0 24 24\" id=\"external-link\"><path fill=\"currentColor\" stroke-width=\"0\" d=\"m16 8.4l-8.875 8.9q-.3.3-.713.3t-.712-.3q-.3-.3-.3-.713t.3-.712L14.6 7H7q-.425 0-.713-.288T6 6q0-.425.288-.713T7 5h10q.425 0 .713.288T18 6v10q0 .425-.288.713T17 17q-.425 0-.713-.288T16 16V8.4Z\"></path></symbol><symbol id=\"chevron-up\" class=\"icon\" viewBox=\"0 0 24 24\"><polyline points=\"18 15 12 9 6 15\"></polyline></symbol><symbol id=\"chevron-down\" class=\"icon\" viewBox=\"0 0 24 24\"><path d=\"m6 9 6 6 6-6\"></path></symbol><symbol id=\"delete\" class=\"icon\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" stroke=\"none\" d=\"M22 4.2h-5.6L15 1.6c-.1-.2-.4-.4-.7-.4H9.6c-.2 0-.5.2-.6.4L7.6 4.2H2c-.4 0-.8.4-.8.8s.4.8.8.8h1.8V22c0 .4.3.8.8.8h15c.4 0 .8-.3.8-.8V5.8H22c.4 0 .8-.3.8-.8s-.4-.8-.8-.8zM10.8 16.5c0 .4-.3.8-.8.8s-.8-.3-.8-.8V10c0-.4.3-.8.8-.8s.8.3.8.8v6.5zm4 0c0 .4-.3.8-.8.8s-.8-.3-.8-.8V10c0-.4.3-.8.8-.8s.8.3.8.8v6.5z\"></path></symbol><symbol id=\"home\" viewBox=\"0 0 256 256\"><path fill=\"currentColor\" d=\"m221.56 100.85l-79.95-75.47l-.16-.15a19.93 19.93 0 0 0-26.91 0l-.17.15l-79.93 75.47a20.07 20.07 0 0 0-6.44 14.7V208a20 20 0 0 0 20 20h48a20 20 0 0 0 20-20v-44h24v44a20 20 0 0 0 20 20h48a20 20 0 0 0 20-20v-92.45a20.07 20.07 0 0 0-6.44-14.7ZM204 204h-40v-44a20 20 0 0 0-20-20h-32a20 20 0 0 0-20 20v44H52v-86.72l76-71.75l76 71.75Z\"></path></symbol><symbol id=\"search\" viewBox=\"0 0 24 24\"><path stroke-width=\"0.2\" fill=\"currentColor\" d=\"m18.9 20.3l-5.6-5.6q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5q0-2.725 1.888-4.612T9.5 3q2.725 0 4.612 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.625 5.625q.275.275.275.675t-.3.7q-.275.275-.7.275t-.7-.275ZM9.5 14q1.875 0 3.188-1.313T14 9.5q0-1.875-1.313-3.188T9.5 5Q7.625 5 6.312 6.313T5 9.5q0 1.875 1.313 3.188T9.5 14Z\"></path></symbol><symbol id=\"docs\" viewBox=\"0 0 16 16\"><path fill=\"currentColor\" d=\"M1 3.25C1 2.56 1.56 2 2.249 2h.5c.69 0 1.248.56 1.248 1.25v9.495c0 .69-.559 1.25-1.248 1.25h-.5A1.25 1.25 0 0 1 1 12.744V3.249ZM2.249 3a.25.25 0 0 0-.25.25v9.495c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25V3.249a.25.25 0 0 0-.25-.25h-.5Zm2.748.25c0-.69.559-1.25 1.249-1.25h.5c.689 0 1.248.56 1.248 1.25v9.495c0 .69-.56 1.25-1.249 1.25h-.5a1.25 1.25 0 0 1-1.248-1.25V3.249ZM6.246 3a.25.25 0 0 0-.25.25v9.495c0 .138.112.25.25.25h.5a.25.25 0 0 0 .249-.25V3.249a.25.25 0 0 0-.25-.25h-.5Zm5.726 1.777a1.249 1.249 0 0 0-1.57-.713l-.583.204a1.25 1.25 0 0 0-.746 1.645l2.937 7.304c.249.62.94.933 1.571.713l.582-.204a1.25 1.25 0 0 0 .746-1.646l-2.937-7.303Zm-1.24.23a.25.25 0 0 1 .313.143l2.937 7.303a.25.25 0 0 1-.149.33l-.582.203a.25.25 0 0 1-.314-.142L10 5.54a.25.25 0 0 1 .149-.329l.582-.204Z\"></path></symbol><symbol id=\"contents\" viewBox=\"0 0 256 256\" stroke-width=\"0\"><path fill=\"currentColor\" d=\"M224 44h-64a43.86 43.86 0 0 0-32 13.85A43.86 43.86 0 0 0 96 44H32a20 20 0 0 0-20 20v128a20 20 0 0 0 20 20h64a20 20 0 0 1 20 20a12 12 0 0 0 24 0a20 20 0 0 1 20-20h64a20 20 0 0 0 20-20V64a20 20 0 0 0-20-20ZM96 188H36V68h60a20 20 0 0 1 20 20v104.81A43.79 43.79 0 0 0 96 188Zm124 0h-60a43.71 43.71 0 0 0-20 4.83V88a20 20 0 0 1 20-20h60Z\"></path></symbol><symbol viewBox=\"0 0 24 24\" id=\"copy-to-clipboard-empty\"><path fill=\"currentColor\" d=\"M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Zm0-2h9V4H9v12Zm0 0V4v12Z\"></path></symbol><symbol viewBox=\"0 0 24 24\" id=\"copy-to-clipboard-filled\"><path fill=\"currentColor\" d=\"M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Z\"></path></symbol><symbol viewBox=\"0 0 24 24\" id=\"font-toggle\"><g stroke=\"currentColor\"><path d=\"m3 15 4-8 4 8\"></path><path d=\"M4 13h6\"></path><circle cx=\"18\" cy=\"12\" r=\"3\"></circle><path d=\"M21 9v6\"></path></g></symbol></svg></div><!----> <!--[-1--><!--]--> <!--[0--><a href=\"#main\" class=\"svelte-1kjmc9y\"><!--[-1-->Skip to main content<!--]--></a><!----> <nav aria-label=\"Primary\" class=\"svelte-wf8082 visible\"><a class=\"home-link svelte-wf8082\" href=\"/\" title=\"Homepage\" aria-label=\"Svelte\"></a> <!--[-1--><!--]--> <div class=\"desktop svelte-wf8082\"><div class=\"links svelte-wf8082\"><!--[--><!--[0--><div class=\"dropdown svelte-fwukmr\"><a href=\"/docs\" class=\"svelte-wf8082\">Docs <svg width=\"20\" height=\"20\" class=\"svelte-hfc14b\"><use href=\"#chevron-down\"></use></svg><!----></a><!----> <nav class=\"dropdown-content svelte-fwukmr\"><div class=\"hover-menu svelte-1ftqc6l\"><!--[--><a class=\"secondary svelte-wf8082\" href=\"/docs/svelte\">Svelte</a><a class=\"secondary svelte-wf8082\" href=\"/docs/kit\">SvelteKit</a><a class=\"secondary svelte-wf8082\" href=\"/docs/cli\">CLI</a><a class=\"secondary svelte-wf8082\" href=\"/docs/ai\">AI</a><!--]--><!----></div><!----></nav></div><!--]--><!--[-1--><a href=\"/tutorial\" class=\"svelte-wf8082\">Tutorial</a><!--]--><!--[-1--><a href=\"/packages\" class=\"svelte-wf8082\">Packages</a><!--]--><!--[-1--><a href=\"/playground\" class=\"svelte-wf8082\">Playground</a><!--]--><!--[-1--><a href=\"/blog\" class=\"svelte-wf8082\">Blog</a><!--]--><!--]--></div> <div class=\"menu svelte-wf8082\"><form class=\"search-container svelte-curb4c\" action=\"/search\"><input value=\"\" type=\"search\" name=\"q\" placeholder=\"Search\" aria-label=\"Search\" spellcheck=\"false\" class=\"svelte-curb4c\"/> <!--[-1--><!--]--></form><!----> <div class=\"external-links svelte-wf8082\"><a href=\"/chat\" aria-label=\"Discord Chat\" class=\"svelte-wf8082\"><span data-icon=\"discord\" class=\"svelte-wf8082\"></span></a> <a href=\"https://bsky.app/profile/svelte.dev\" aria-label=\"Svelte on Bluesky\" class=\"svelte-wf8082\"><span data-icon=\"bluesky\" class=\"svelte-wf8082\"></span></a> <a href=\"https://github.com/sveltejs\" aria-label=\"GitHub Organization\" class=\"svelte-wf8082\"><span data-icon=\"github\" class=\"svelte-wf8082\"></span></a></div> <button class=\"raised svelte-ocz8b7\" type=\"button\" aria-pressed=\"false\" aria-label=\"Toggle font\"><span class=\"icon svelte-ocz8b7\"></span></button><!----> <button class=\"raised\" type=\"button\" aria-pressed=\"false\" aria-label=\"Toggle dark mode\"><span class=\"icon svelte-16r4un1\"></span></button><!----></div></div> <div class=\"mobile mobile-menu svelte-wf8082\"><button aria-label=\"Search\" class=\"raised icon search\"><svg width=\"18\" height=\"18\" class=\"svelte-hfc14b\"><use href=\"#search\"></use></svg><!----></button> <button class=\"raised svelte-ocz8b7\" type=\"button\" aria-pressed=\"false\" aria-label=\"Toggle font\"><span class=\"icon svelte-ocz8b7\"></span></button><!----> <button class=\"raised\" type=\"button\" aria-pressed=\"false\" aria-label=\"Toggle dark mode\"><span class=\"icon svelte-16r4un1\"></span></button><!----> <button aria-label=\"Toggle menu\" aria-expanded=\"false\" class=\"menu-toggle raised icon\"><svg width=\"16\" height=\"16\" class=\"svelte-hfc14b\"><use href=\"#menu\"></use></svg><!----></button></div></nav> <!--[-1--><!--]--><!----><!--]--> <!--[-1--><!--]--> <main id=\"main\" class=\"svelte-1ftfg6q\"><!--[-1--><!--[--><div class=\"outer svelte-1j96wlh\"><div class=\"inner svelte-1j96wlh\"><!--[0--><!--[0--><h1>Not found!</h1> <p class=\"svelte-1j96wlh\">If you were expecting to find something here, please drop by the <a href=\"/chat\" class=\"svelte-1j96wlh\">Discord chatroom</a> and let us know, or raise an issue on <a href=\"https://github.com/sveltejs/svelte.dev/issues\" class=\"svelte-1j96wlh\">GitHub</a>. Thanks!</p><!--]--><!--]--></div></div><!--]--><!--]--><!----><!----></main> <!--[0--><!--[-1--><!--]--><!--]--><!----><!----> <!--[-1--><!--]--><!--]--><!--]--> <!--[-1--><!--]--><!--]-->\n\t\t\t\n\t\t\t<script>\n\t\t\t\t{\n\t\t\t\t\t__sveltekit_mzqee7 = {\n\t\t\t\t\t\tbase: new URL(\".\", location).pathname.slice(0, -1)\n\t\t\t\t\t};\n\n\t\t\t\t\tconst element = document.currentScript.parentElement;\n\n\t\t\t\t\tPromise.all([\n\t\t\t\t\t\timport(\"./_app/immutable/entry/start.D_JN0fXF.js\"),\n\t\t\t\t\t\timport(\"./_app/immutable/entry/app.BmJG6ndp.js\")\n\t\t\t\t\t]).then(([kit, app]) => {\n\t\t\t\t\t\tkit.start(app, element, {\n\t\t\t\t\t\t\tnode_ids: [0, 1],\n\t\t\t\t\t\t\tdata: [{type:\"data\",data:{nav_links:[{title:\"Docs\",slug:\"docs\",sections:[{title:\"Svelte\",path:\"/docs/svelte\",sections:[{title:\"Introduction\",sections:[{title:\"Overview\",path:\"/docs/svelte/overview\"},{title:\"Getting started\",path:\"/docs/svelte/getting-started\"},{title:\".svelte files\",path:\"/docs/svelte/svelte-files\"},{title:\".svelte.js and .svelte.ts files\",path:\"/docs/svelte/svelte-js-files\"}]},{title:\"Runes\",sections:[{title:\"What are runes?\",path:\"/docs/svelte/what-are-runes\"},{title:\"$state\",path:\"/docs/svelte/$state\"},{title:\"$derived\",path:\"/docs/svelte/$derived\"},{title:\"$effect\",path:\"/docs/svelte/$effect\"},{title:\"$props\",path:\"/docs/svelte/$props\"},{title:\"$bindable\",path:\"/docs/svelte/$bindable\"},{title:\"$inspect\",path:\"/docs/svelte/$inspect\"},{title:\"$host\",path:\"/docs/svelte/$host\"}]},{title:\"Template syntax\",sections:[{title:\"Basic markup\",path:\"/docs/svelte/basic-markup\"},{title:\"{#if ...}\",path:\"/docs/svelte/if\"},{title:\"{#each ...}\",path:\"/docs/svelte/each\"},{title:\"{#key ...}\",path:\"/docs/svelte/key\"},{title:\"{#await ...}\",path:\"/docs/svelte/await\"},{title:\"{#snippet ...}\",path:\"/docs/svelte/snippet\"},{title:\"{@render ...}\",path:\"/docs/svelte/@render\"},{title:\"{@html ...}\",path:\"/docs/svelte/@html\"},{title:\"{@attach ...}\",path:\"/docs/svelte/@attach\"},{title:\"{@const ...}\",path:\"/docs/svelte/@const\"},{title:\"{@debug ...}\",path:\"/docs/svelte/@debug\"},{title:\"bind:\",path:\"/docs/svelte/bind\"},{title:\"use:\",path:\"/docs/svelte/use\"},{title:\"transition:\",path:\"/docs/svelte/transition\"},{title:\"in: and out:\",path:\"/docs/svelte/in-and-out\"},{title:\"animate:\",path:\"/docs/svelte/animate\"},{title:\"style:\",path:\"/docs/svelte/style\"},{title:\"class\",path:\"/docs/svelte/class\"},{title:\"await\",path:\"/docs/svelte/await-expressions\"}]},{title:\"Styling\",sections:[{title:\"Scoped styles\",path:\"/docs/svelte/scoped-styles\"},{title:\"Global styles\",path:\"/docs/svelte/global-styles\"},{title:\"Custom properties\",path:\"/docs/svelte/custom-properties\"},{title:\"Nested \\u003Cstyle> elements\",path:\"/docs/svelte/nested-style-elements\"}]},{title:\"Special elements\",sections:[{title:\"\\u003Csvelte:boundary>\",path:\"/docs/svelte/svelte-boundary\"},{title:\"\\u003Csvelte:window>\",path:\"/docs/svelte/svelte-window\"},{title:\"\\u003Csvelte:document>\",path:\"/docs/svelte/svelte-document\"},{title:\"\\u003Csvelte:body>\",path:\"/docs/svelte/svelte-body\"},{title:\"\\u003Csvelte:head>\",path:\"/docs/svelte/svelte-head\"},{title:\"\\u003Csvelte:element>\",path:\"/docs/svelte/svelte-element\"},{title:\"\\u003Csvelte:options>\",path:\"/docs/svelte/svelte-options\"}]},{title:\"Runtime\",sections:[{title:\"Stores\",path:\"/docs/svelte/stores\"},{title:\"Context\",path:\"/docs/svelte/context\"},{title:\"Lifecycle hooks\",path:\"/docs/svelte/lifecycle-hooks\"},{title:\"Imperative component API\",path:\"/docs/svelte/imperative-component-api\"},{title:\"Hydratable data\",path:\"/docs/svelte/hydratable\"}]},{title:\"Misc\",sections:[{title:\"Best practices\",path:\"/docs/svelte/best-practices\"},{title:\"Testing\",path:\"/docs/svelte/testing\"},{title:\"TypeScript\",path:\"/docs/svelte/typescript\"},{title:\"Custom elements\",path:\"/docs/svelte/custom-elements\"},{title:\"Svelte 4 migration guide\",path:\"/docs/svelte/v4-migration-guide\"},{title:\"Svelte 5 migration guide\",path:\"/docs/svelte/v5-migration-guide\"},{title:\"Frequently asked questions\",path:\"/docs/svelte/faq\"}]},{title:\"Reference\",sections:[{title:\"svelte\",path:\"/docs/svelte/svelte\"},{title:\"svelte/action\",path:\"/docs/svelte/svelte-action\"},{title:\"svelte/animate\",path:\"/docs/svelte/svelte-animate\"},{title:\"svelte/attachments\",path:\"/docs/svelte/svelte-attachments\"},{title:\"svelte/compiler\",path:\"/docs/svelte/svelte-compiler\"},{title:\"svelte/easing\",path:\"/docs/svelte/svelte-easing\"},{title:\"svelte/events\",path:\"/docs/svelte/svelte-events\"},{title:\"svelte/legacy\",path:\"/docs/svelte/svelte-legacy\"},{title:\"svelte/motion\",path:\"/docs/svelte/svelte-motion\"},{title:\"svelte/reactivity/window\",path:\"/docs/svelte/svelte-reactivity-window\"},{title:\"svelte/reactivity\",path:\"/docs/svelte/svelte-reactivity\"},{title:\"svelte/server\",path:\"/docs/svelte/svelte-server\"},{title:\"svelte/store\",path:\"/docs/svelte/svelte-store\"},{title:\"svelte/transition\",path:\"/docs/svelte/svelte-transition\"},{title:\"Compiler errors\",path:\"/docs/svelte/compiler-errors\"},{title:\"Compiler warnings\",path:\"/docs/svelte/compiler-warnings\"},{title:\"Runtime errors\",path:\"/docs/svelte/runtime-errors\"},{title:\"Runtime warnings\",path:\"/docs/svelte/runtime-warnings\"}]},{title:\"Legacy APIs\",sections:[{title:\"Overview\",path:\"/docs/svelte/legacy-overview\"},{title:\"Reactive let/var declarations\",path:\"/docs/svelte/legacy-let\"},{title:\"Reactive $: statements\",path:\"/docs/svelte/legacy-reactive-assignments\"},{title:\"export let\",path:\"/docs/svelte/legacy-export-let\"},{title:\"$$props and $$restProps\",path:\"/docs/svelte/legacy-$$props-and-$$restProps\"},{title:\"on:\",path:\"/docs/svelte/legacy-on\"},{title:\"\\u003Cslot>\",path:\"/docs/svelte/legacy-slots\"},{title:\"$$slots\",path:\"/docs/svelte/legacy-$$slots\"},{title:\"\\u003Csvelte:fragment>\",path:\"/docs/svelte/legacy-svelte-fragment\"},{title:\"\\u003Csvelte:component>\",path:\"/docs/svelte/legacy-svelte-component\"},{title:\"\\u003Csvelte:self>\",path:\"/docs/svelte/legacy-svelte-self\"},{title:\"Imperative component API\",path:\"/docs/svelte/legacy-component-api\"}]}]},{title:\"SvelteKit\",path:\"/docs/kit\",sections:[{title:\"Getting started\",sections:[{title:\"Introduction\",path:\"/docs/kit/introduction\"},{title:\"Creating a project\",path:\"/docs/kit/creating-a-project\"},{title:\"Project types\",path:\"/docs/kit/project-types\"},{title:\"Project structure\",path:\"/docs/kit/project-structure\"},{title:\"Web standards\",path:\"/docs/kit/web-standards\"}]},{title:\"Core concepts\",sections:[{title:\"Routing\",path:\"/docs/kit/routing\"},{title:\"Loading data\",path:\"/docs/kit/load\"},{title:\"Form actions\",path:\"/docs/kit/form-actions\"},{title:\"Page options\",path:\"/docs/kit/page-options\"},{title:\"State management\",path:\"/docs/kit/state-management\"},{title:\"Remote functions\",path:\"/docs/kit/remote-functions\"}]},{title:\"Build and deploy\",sections:[{title:\"Building your app\",path:\"/docs/kit/building-your-app\"},{title:\"Adapters\",path:\"/docs/kit/adapters\"},{title:\"Zero-config deployments\",path:\"/docs/kit/adapter-auto\"},{title:\"Node servers\",path:\"/docs/kit/adapter-node\"},{title:\"Static site generation\",path:\"/docs/kit/adapter-static\"},{title:\"Single-page apps\",path:\"/docs/kit/single-page-apps\"},{title:\"Cloudflare\",path:\"/docs/kit/adapter-cloudflare\"},{title:\"Cloudflare Workers\",path:\"/docs/kit/adapter-cloudflare-workers\"},{title:\"Netlify\",path:\"/docs/kit/adapter-netlify\"},{title:\"Vercel\",path:\"/docs/kit/adapter-vercel\"},{title:\"Writing adapters\",path:\"/docs/kit/writing-adapters\"}]},{title:\"Advanced\",sections:[{title:\"Advanced routing\",path:\"/docs/kit/advanced-routing\"},{title:\"Hooks\",path:\"/docs/kit/hooks\"},{title:\"Errors\",path:\"/docs/kit/errors\"},{title:\"Link options\",path:\"/docs/kit/link-options\"},{title:\"Service workers\",path:\"/docs/kit/service-workers\"},{title:\"Server-only modules\",path:\"/docs/kit/server-only-modules\"},{title:\"Snapshots\",path:\"/docs/kit/snapshots\"},{title:\"Shallow routing\",path:\"/docs/kit/shallow-routing\"},{title:\"Observability\",path:\"/docs/kit/observability\"},{title:\"Packaging\",path:\"/docs/kit/packaging\"}]},{title:\"Best practices\",sections:[{title:\"Auth\",path:\"/docs/kit/auth\"},{title:\"Performance\",path:\"/docs/kit/performance\"},{title:\"Icons\",path:\"/docs/kit/icons\"},{title:\"Images\",path:\"/docs/kit/images\"},{title:\"Accessibility\",path:\"/docs/kit/accessibility\"},{title:\"SEO\",path:\"/docs/kit/seo\"}]},{title:\"Appendix\",sections:[{title:\"Frequently asked questions\",path:\"/docs/kit/faq\"},{title:\"Integrations\",path:\"/docs/kit/integrations\"},{title:\"Breakpoint Debugging\",path:\"/docs/kit/debugging\"},{title:\"Migrating to SvelteKit v2\",path:\"/docs/kit/migrating-to-sveltekit-2\"},{title:\"Migrating from Sapper\",path:\"/docs/kit/migrating\"},{title:\"Additional resources\",path:\"/docs/kit/additional-resources\"},{title:\"Glossary\",path:\"/docs/kit/glossary\"}]},{title:\"Reference\",sections:[{title:\"@sveltejs/kit\",path:\"/docs/kit/@sveltejs-kit\"},{title:\"@sveltejs/kit/hooks\",path:\"/docs/kit/@sveltejs-kit-hooks\"},{title:\"@sveltejs/kit/node/polyfills\",path:\"/docs/kit/@sveltejs-kit-node-polyfills\"},{title:\"@sveltejs/kit/node\",path:\"/docs/kit/@sveltejs-kit-node\"},{title:\"@sveltejs/kit/vite\",path:\"/docs/kit/@sveltejs-kit-vite\"},{title:\"$app/environment\",path:\"/docs/kit/$app-environment\"},{title:\"$app/forms\",path:\"/docs/kit/$app-forms\"},{title:\"$app/navigation\",path:\"/docs/kit/$app-navigation\"},{title:\"$app/paths\",path:\"/docs/kit/$app-paths\"},{title:\"$app/server\",path:\"/docs/kit/$app-server\"},{title:\"$app/state\",path:\"/docs/kit/$app-state\"},{title:\"$app/stores\",path:\"/docs/kit/$app-stores\"},{title:\"$app/types\",path:\"/docs/kit/$app-types\"},{title:\"$env/dynamic/private\",path:\"/docs/kit/$env-dynamic-private\"},{title:\"$env/dynamic/public\",path:\"/docs/kit/$env-dynamic-public\"},{title:\"$env/static/private\",path:\"/docs/kit/$env-static-private\"},{title:\"$env/static/public\",path:\"/docs/kit/$env-static-public\"},{title:\"$lib\",path:\"/docs/kit/$lib\"},{title:\"$service-worker\",path:\"/docs/kit/$service-worker\"},{title:\"Configuration\",path:\"/docs/kit/configuration\"},{title:\"Command Line Interface\",path:\"/docs/kit/cli\"},{title:\"Types\",path:\"/docs/kit/types\"}]}]},{title:\"CLI\",path:\"/docs/cli\",sections:[{title:\"Introduction\",sections:[{title:\"Overview\",path:\"/docs/cli/overview\"},{title:\"Frequently asked questions\",path:\"/docs/cli/faq\"}]},{title:\"Commands\",sections:[{title:\"sv create\",path:\"/docs/cli/sv-create\"},{title:\"sv add\",path:\"/docs/cli/sv-add\"},{title:\"sv check\",path:\"/docs/cli/sv-check\"},{title:\"sv migrate\",path:\"/docs/cli/sv-migrate\"}]},{title:\"Add-ons\",sections:[{title:\"better-auth\",path:\"/docs/cli/better-auth\"},{title:\"drizzle\",path:\"/docs/cli/drizzle\"},{title:\"eslint\",path:\"/docs/cli/eslint\"},{title:\"mcp\",path:\"/docs/cli/mcp\"},{title:\"mdsvex\",path:\"/docs/cli/mdsvex\"},{title:\"paraglide\",path:\"/docs/cli/paraglide\"},{title:\"playwright\",path:\"/docs/cli/playwright\"},{title:\"prettier\",path:\"/docs/cli/prettier\"},{title:\"storybook\",path:\"/docs/cli/storybook\"},{title:\"sveltekit-adapter\",path:\"/docs/cli/sveltekit-adapter\"},{title:\"tailwindcss\",path:\"/docs/cli/tailwind\"},{title:\"vitest\",path:\"/docs/cli/vitest\"},{title:\"[create your own]\",path:\"/docs/cli/community\"}]},{title:\"API\",sections:[{title:\"sv\",path:\"/docs/cli/sv\"},{title:\"sv-utils\",path:\"/docs/cli/sv-utils\"}]}]},{title:\"AI\",path:\"/docs/ai\",sections:[{title:\"Introduction\",sections:[{title:\"Overview\",path:\"/docs/ai/overview\"}]},{title:\"Setup\",sections:[{title:\"Local setup\",path:\"/docs/ai/local-setup\"},{title:\"Remote setup\",path:\"/docs/ai/remote-setup\"}]},{title:\"Capabilities\",sections:[{title:\"Tools\",path:\"/docs/ai/tools\"},{title:\"Resources\",path:\"/docs/ai/resources\"},{title:\"Prompts\",path:\"/docs/ai/prompts\"}]},{title:\"Claude Code Plugin\",sections:[{title:\"Overview\",path:\"/docs/ai/plugin\"},{title:\"Subagent\",path:\"/docs/ai/subagent\"}]},{title:\"OpenCode Plugin\",sections:[{title:\"Overview\",path:\"/docs/ai/opencode-plugin\"},{title:\"Subagent\",path:\"/docs/ai/opencode-subagent\"}]},{title:\"Skills\",sections:[{title:\"Overview\",path:\"/docs/ai/skills\"}]}]}]},{title:\"Tutorial\",slug:\"tutorial\",sections:[{title:\"Basic Svelte\",sections:[{title:\"Introduction\",sections:[{title:\"Welcome to Svelte\",path:\"/tutorial/svelte/welcome-to-svelte\"},{title:\"Your first component\",path:\"/tutorial/svelte/your-first-component\"},{title:\"Dynamic attributes\",path:\"/tutorial/svelte/dynamic-attributes\"},{title:\"Styling\",path:\"/tutorial/svelte/styling\"},{title:\"Nested components\",path:\"/tutorial/svelte/nested-components\"},{title:\"HTML tags\",path:\"/tutorial/svelte/html-tags\"}]},{title:\"Reactivity\",sections:[{title:\"State\",path:\"/tutorial/svelte/state\"},{title:\"Deep state\",path:\"/tutorial/svelte/deep-state\"},{title:\"Derived state\",path:\"/tutorial/svelte/derived-state\"},{title:\"Inspecting state\",path:\"/tutorial/svelte/inspecting-state\"},{title:\"Effects\",path:\"/tutorial/svelte/effects\"},{title:\"Universal reactivity\",path:\"/tutorial/svelte/universal-reactivity\"}]},{title:\"Props\",sections:[{title:\"Declaring props\",path:\"/tutorial/svelte/declaring-props\"},{title:\"Default values\",path:\"/tutorial/svelte/default-values\"},{title:\"Spread props\",path:\"/tutorial/svelte/spread-props\"}]},{title:\"Logic\",sections:[{title:\"If blocks\",path:\"/tutorial/svelte/if-blocks\"},{title:\"Else blocks\",path:\"/tutorial/svelte/else-blocks\"},{title:\"Else-if blocks\",path:\"/tutorial/svelte/else-if-blocks\"},{title:\"Each blocks\",path:\"/tutorial/svelte/each-blocks\"},{title:\"Keyed each blocks\",path:\"/tutorial/svelte/keyed-each-blocks\"},{title:\"Await blocks\",path:\"/tutorial/svelte/await-blocks\"}]},{title:\"Events\",sections:[{title:\"DOM events\",path:\"/tutorial/svelte/dom-events\"},{title:\"Inline handlers\",path:\"/tutorial/svelte/inline-handlers\"},{title:\"Capturing\",path:\"/tutorial/svelte/capturing\"},{title:\"Component events\",path:\"/tutorial/svelte/component-events\"},{title:\"Spreading events\",path:\"/tutorial/svelte/spreading-events\"}]},{title:\"Bindings\",sections:[{title:\"Text inputs\",path:\"/tutorial/svelte/text-inputs\"},{title:\"Numeric inputs\",path:\"/tutorial/svelte/numeric-inputs\"},{title:\"Checkbox inputs\",path:\"/tutorial/svelte/checkbox-inputs\"},{title:\"Select bindings\",path:\"/tutorial/svelte/select-bindings\"},{title:\"Group inputs\",path:\"/tutorial/svelte/group-inputs\"},{title:\"Select multiple\",path:\"/tutorial/svelte/multiple-select-bindings\"},{title:\"Textarea inputs\",path:\"/tutorial/svelte/textarea-inputs\"}]},{title:\"Classes and styles\",sections:[{title:\"The class attribute\",path:\"/tutorial/svelte/classes\"},{title:\"The style directive\",path:\"/tutorial/svelte/styles\"},{title:\"Component styles\",path:\"/tutorial/svelte/component-styles\"}]},{title:\"Attachments\",sections:[{title:\"The attach tag\",path:\"/tutorial/svelte/attach\"},{title:\"Attachment factories\",path:\"/tutorial/svelte/attachment-factories\"}]},{title:\"Transitions\",sections:[{title:\"The transition directive\",path:\"/tutorial/svelte/transition\"},{title:\"Adding parameters\",path:\"/tutorial/svelte/adding-parameters-to-transitions\"},{title:\"In and out\",path:\"/tutorial/svelte/in-and-out\"},{title:\"Custom CSS transitions\",path:\"/tutorial/svelte/custom-css-transitions\"},{title:\"Custom JS transitions\",path:\"/tutorial/svelte/custom-js-transitions\"},{title:\"Transition events\",path:\"/tutorial/svelte/transition-events\"},{title:\"Global transitions\",path:\"/tutorial/svelte/global-transitions\"},{title:\"Key blocks\",path:\"/tutorial/svelte/key-blocks\"}]}]},{title:\"Advanced Svelte\",sections:[{title:\"Advanced reactivity\",sections:[{title:\"Raw state\",path:\"/tutorial/svelte/raw-state\"},{title:\"Reactive classes\",path:\"/tutorial/svelte/reactive-classes\"},{title:\"Getters and setters\",path:\"/tutorial/svelte/getters-and-setters\"},{title:\"Reactive built-ins\",path:\"/tutorial/svelte/reactive-builtins\"},{title:\"Stores\",path:\"/tutorial/svelte/stores\"}]},{title:\"Reusing content\",sections:[{title:\"Snippets and render tags\",path:\"/tutorial/svelte/snippets-and-render-tags\"},{title:\"Passing snippets to components\",path:\"/tutorial/svelte/passing-snippets\"},{title:\"Implicit snippet props\",path:\"/tutorial/svelte/implicit-snippet-props\"}]},{title:\"Motion\",sections:[{title:\"Tweened values\",path:\"/tutorial/svelte/tweens\"},{title:\"Springs\",path:\"/tutorial/svelte/springs\"}]},{title:\"Advanced bindings\",sections:[{title:\"Contenteditable bindings\",path:\"/tutorial/svelte/contenteditable-bindings\"},{title:\"Each block bindings\",path:\"/tutorial/svelte/each-block-bindings\"},{title:\"Media elements\",path:\"/tutorial/svelte/media-elements\"},{title:\"Dimensions\",path:\"/tutorial/svelte/dimensions\"},{title:\"This\",path:\"/tutorial/svelte/bind-this\"},{title:\"Component bindings\",path:\"/tutorial/svelte/component-bindings\"},{title:\"Binding to component instances\",path:\"/tutorial/svelte/component-this\"}]},{title:\"Advanced transitions\",sections:[{title:\"Deferred transitions\",path:\"/tutorial/svelte/deferred-transitions\"},{title:\"Animations\",path:\"/tutorial/svelte/animations\"}]},{title:\"Context API\",sections:[{title:\"setContext and getContext\",path:\"/tutorial/svelte/context-api\"}]},{title:\"Special elements\",sections:[{title:\"\\u003Csvelte:window>\",path:\"/tutorial/svelte/svelte-window\"},{title:\"\\u003Csvelte:window> bindings\",path:\"/tutorial/svelte/svelte-window-bindings\"},{title:\"\\u003Csvelte:document>\",path:\"/tutorial/svelte/svelte-document\"},{title:\"\\u003Csvelte:body>\",path:\"/tutorial/svelte/svelte-body\"},{title:\"\\u003Csvelte:head>\",path:\"/tutorial/svelte/svelte-head\"},{title:\"\\u003Csvelte:element>\",path:\"/tutorial/svelte/svelte-element\"},{title:\"\\u003Csvelte:boundary>\",path:\"/tutorial/svelte/svelte-boundary\"}]},{title:\"\\u003Cscript module>\",sections:[{title:\"Sharing code\",path:\"/tutorial/svelte/sharing-code\"},{title:\"Exports\",path:\"/tutorial/svelte/module-exports\"}]},{title:\"Next steps\",sections:[{title:\"Congratulations!\",path:\"/tutorial/svelte/congratulations\"}]}]},{title:\"Basic SvelteKit\",sections:[{title:\"Introduction\",sections:[{title:\"What is SvelteKit?\",path:\"/tutorial/kit/introducing-sveltekit\"}]},{title:\"Routing\",sections:[{title:\"Pages\",path:\"/tutorial/kit/pages\"},{title:\"Layouts\",path:\"/tutorial/kit/layouts\"},{title:\"Route parameters\",path:\"/tutorial/kit/params\"}]},{title:\"Loading data\",sections:[{title:\"Page data\",path:\"/tutorial/kit/page-data\"},{title:\"Layout data\",path:\"/tutorial/kit/layout-data\"}]},{title:\"Headers and cookies\",sections:[{title:\"Setting headers\",path:\"/tutorial/kit/headers\"},{title:\"Reading and writing cookies\",path:\"/tutorial/kit/cookies\"}]},{title:\"Shared modules\",sections:[{title:\"The $lib alias\",path:\"/tutorial/kit/lib\"}]},{title:\"Forms\",sections:[{title:\"The \\u003Cform> element\",path:\"/tutorial/kit/the-form-element\"},{title:\"Named form actions\",path:\"/tutorial/kit/named-form-actions\"},{title:\"Validation\",path:\"/tutorial/kit/form-validation\"},{title:\"Progressive enhancement\",path:\"/tutorial/kit/progressive-enhancement\"},{title:\"Customizing use:enhance\",path:\"/tutorial/kit/customizing-use-enhance\"}]},{title:\"API routes\",sections:[{title:\"GET handlers\",path:\"/tutorial/kit/get-handlers\"},{title:\"POST handlers\",path:\"/tutorial/kit/post-handlers\"},{title:\"Other handlers\",path:\"/tutorial/kit/other-handlers\"}]},{title:\"$app/state\",sections:[{title:\"page\",path:\"/tutorial/kit/page-state\"},{title:\"navigating\",path:\"/tutorial/kit/navigating-state\"},{title:\"updated\",path:\"/tutorial/kit/updated-state\"}]},{title:\"Errors and redirects\",sections:[{title:\"Basics\",path:\"/tutorial/kit/error-basics\"},{title:\"Error pages\",path:\"/tutorial/kit/error-pages\"},{title:\"Fallback errors\",path:\"/tutorial/kit/fallback-errors\"},{title:\"Redirects\",path:\"/tutorial/kit/redirects\"}]}]},{title:\"Advanced SvelteKit\",sections:[{title:\"Hooks\",sections:[{title:\"handle\",path:\"/tutorial/kit/handle\"},{title:\"The RequestEvent object\",path:\"/tutorial/kit/event\"},{title:\"handleFetch\",path:\"/tutorial/kit/handlefetch\"},{title:\"handleError\",path:\"/tutorial/kit/handleerror\"}]},{title:\"Page options\",sections:[{title:\"Basics\",path:\"/tutorial/kit/page-options\"},{title:\"ssr\",path:\"/tutorial/kit/ssr\"},{title:\"csr\",path:\"/tutorial/kit/csr\"},{title:\"prerender\",path:\"/tutorial/kit/prerender\"},{title:\"trailingSlash\",path:\"/tutorial/kit/trailingslash\"}]},{title:\"Link options\",sections:[{title:\"Preloading\",path:\"/tutorial/kit/preload\"},{title:\"Reloading the page\",path:\"/tutorial/kit/reload\"}]},{title:\"Advanced routing\",sections:[{title:\"Optional parameters\",path:\"/tutorial/kit/optional-params\"},{title:\"Rest parameters\",path:\"/tutorial/kit/rest-params\"},{title:\"Param matchers\",path:\"/tutorial/kit/param-matchers\"},{title:\"Route groups\",path:\"/tutorial/kit/route-groups\"},{title:\"Breaking out of layouts\",path:\"/tutorial/kit/breaking-out-of-layouts\"}]},{title:\"Advanced loading\",sections:[{title:\"Universal load functions\",path:\"/tutorial/kit/universal-load-functions\"},{title:\"Using both load functions\",path:\"/tutorial/kit/using-both-load-functions\"},{title:\"Using parent data\",path:\"/tutorial/kit/await-parent\"},{title:\"Invalidation\",path:\"/tutorial/kit/invalidation\"},{title:\"Custom dependencies\",path:\"/tutorial/kit/custom-dependencies\"},{title:\"invalidateAll\",path:\"/tutorial/kit/invalidate-all\"}]},{title:\"Environment variables\",sections:[{title:\"$env/static/private\",path:\"/tutorial/kit/env-static-private\"},{title:\"$env/dynamic/private\",path:\"/tutorial/kit/env-dynamic-private\"},{title:\"$env/static/public\",path:\"/tutorial/kit/env-static-public\"},{title:\"$env/dynamic/public\",path:\"/tutorial/kit/env-dynamic-public\"}]},{title:\"Conclusion\",sections:[{title:\"Next steps\",path:\"/tutorial/kit/next-steps\"}]}]}]},{title:\"Packages\",slug:\"packages\"},{title:\"Playground\",slug:\"playground\"},{title:\"Blog\",slug:\"blog\"}],banner:{id:\"barcelona-2025-tickets\",start:new Date(1745193600000),end:new Date(1746575999000),arrow:true,content:{lg:\"Svelte Summit Barcelona and online, May 8-9: Last few days to get tickets!\",sm:\"Svelte Summit May 8-9\"},href:\"https://www.sveltesummit.com/\"}},uses:{}}],\n\t\t\t\t\t\t\tform: null,\n\t\t\t\t\t\t\terror: {message:\"Not Found\"},\n\t\t\t\t\t\t\tstatus: 404\n\t\t\t\t\t\t});\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t</script>\n\t\t</div>\n\n\t\t<script>\n\t\t\tif (localStorage.getItem('svelte:show-legacy') !== 'false') {\n\t\t\t\tfor (const node of document.querySelectorAll('details.legacy')) {\n\t\t\t\t\tnode.open = true;\n\t\t\t\t}\n\t\t\t}\n\n\t\t\tif (localStorage.getItem('svelte:prefers-ts') === 'false') {\n\t\t\t\tfor (const node of document.querySelectorAll('.ts-toggle')) {\n\t\t\t\t\tnode.checked = false;\n\t\t\t\t}\n\t\t\t}\n\t\t</script>\n\t</body>\n</html>\n"

**Tool Call: Fetch `https://www.shadcn-svelte.com/docs/components`**
Status: Completed

Toggle Menu Menu   shadcn-svelte  Search documentation... Search... ⌘ K    8.0k  Toggle layout      Toggle theme  New Project  Sections 
-  Get Started 
-  Components 
-  Changelog 

Get Started 
-  Installation 
-  components.json 
-  Theming 
-  Dark Mode 
-  CLI 
-  JavaScript 
-  Figma 
-  llms.txt 
-  Legacy Docs 

Migration 
-  Svelte 5 
-  Tailwind v4 

Components 
-  Accordion 
-  Alert Dialog 
-  Alert 
-  Aspect Ratio 
-  Avatar 
-  Badge 
-  Breadcrumb 
-  Button Group 
-  Button 
-  Calendar 
-  Card 
-  Carousel 
-  Chart 
-  Checkbox 
-  Collapsible 
-  Combobox 
-  Command 
-  Context Menu 
-  Data Table 
-  Date Picker 
-  Dialog 
-  Drawer 
-  Dropdown Menu 
-  Empty 
-  Field 
-  Formsnap 
-  Hover Card 
-  Input Group 
-  Input OTP 
-  Input 
-  Item 
-  Kbd 
-  Label 
-  Menubar 
-  Native Select 
-  Navigation Menu 
-  Pagination 
-  Popover 
-  Progress 
-  Radio Group 
-  Range Calendar 
-  Resizable 
-  Scroll Area 
-  Select 
-  Separator 
-  Sheet 
-  Sidebar 
-  Skeleton 
-  Slider 
-  Sonner 
-  Spinner 
-  Switch 
-  Table 
-  Tabs 
-  Textarea 
-  Toggle Group 
-  Toggle 
-  Tooltip 
-  Typography 

Installation 
-  SvelteKit 
-  Vite 
-  Astro 
-  Manual Installation 

Dark Mode 
-  Svelte 
-  Astro 

Registry 
-  Registry 
-  Getting Started 
-  FAQ 
-  Examples 
-  registry.json 
-  registry-item.json 

       Special Sponsor  

### Epicenter

 

Local-first, open source apps   

# Components

   Copy Page       Previous Next  

Here you can find all the components available in the library. We are working on adding more components.     

### Epicenter

 

Local-first, open source apps Special Sponsor Accordion Alert Dialog Alert Aspect Ratio Avatar Badge Breadcrumb Button Group Button Calendar Card Carousel Chart Checkbox Collapsible Combobox Command Context Menu Data Table Date Picker Dialog Drawer Dropdown Menu Empty Field Formsnap Hover Card Input Group Input OTP Input Item Kbd Label Menubar Native Select Navigation Menu Pagination Popover Progress Radio Group Range Calendar Resizable Scroll Area Select Separator Sheet Sidebar Skeleton Slider Sonner Spinner Switch Table Tabs Textarea Toggle Group Toggle Tooltip Typography   Tailwind v4 Accordion  Built by shadcn. Ported to Svelte by Huntabyte & CokaKoala.

**Tool Call: Fetch `https://svelte.dev/packages`**
Status: Completed

Skip to main content    

# Packages

 

We’ve collected a few of our favourite packages that work well with Svelte and SvelteKit apps. 			Official packages are marked with the  logo. 

## Svelte CLI add-ons aa

 

The Svelte CLI lets you instantly add functionality to a new or existing project with `npx sv add` 

###  tailwind

 4.2.4 **2w ago** 

A utility-first CSS framework  

###  drizzle

 0.45.2 **1mo ago** 

Serverless-ready TypeScript ORM offering both relational and SQL-like query APIs  

###  mdsvex

 0.12.7 **2mo ago** 

A Markdown preprocessor that lets you put Markdown in your Svelte and Svelte in your Markdown    show all (11) show less 

###  better-auth

 1.6.9 **1w ago** 

Authentication and authorization framework  

###  storybook

 10.3.5 **4w ago** 

Develop, document, and test UI components in isolation  

###  prettier

 3.8.3 **3w ago** 

An opinionated code formatter  

###  eslint

 10.2.1 **2w ago** 

Find and fix problems in your code  

###  vitest

 4.1.5 **2w ago** 

Vite-powered testing framework  

###  playwright

 1.59.1 **1mo ago** 

Browser automation for end-to-end testing  

###  paraglide

 2.16.1 **1w ago** 

A compiler-based i18n library that emits tree-shakeable message functions  

###  devtools-json

 1.0.0 **9mo ago** 

Generates Chromium DevTools project settings during development  

## Component libraries aa

  

###  shadcn-svelte

 1.2.7 **4w ago** 

A port of shadcn/ui, built with Bits UI and Tailwind CSS 

 128K  8.7K   

###  bits-ui

 2.18.0 **2w ago** 

Headless component primitives — bring your own styles 

 483K  3.2K   

###  @skeletonlabs/skeleton

 4.15.2 **3w ago** 

An adaptive design system powered by Tailwind CSS 

 40K  5.9K     show all (11) show less 

###  flowbite-svelte

 1.33.1 **4w ago** 

Official Svelte port of Flowbite, a UI library powered by Tailwind CSS 

 56K  2.7K   

###  @ark-ui/svelte

 5.21.2 **1w ago** 

Headless component library built on top of Zag.js 

 3K  5.1K   

###  daisyui

 5.5.19 **2mo ago** 

A set of classnames encapsulating Tailwind CSS styles 

 655K  41K   

###  svelte-material-ui

 8.0.3 **9mo ago** 

An implementation of Google’s Material UI 

 5.8K  3.4K   

###  carbon-components-svelte

 0.106.2 **2w ago** 

Svelte implementation of the Carbon Design System 

 18K  2.9K   

###  melt

 0.44.0 **4mo ago** 

A low-level headless UI library 

 3.7K  309   

###  @sveltestrap/sveltestrap

 7.1.0 **1y ago** 

Bootstrap components for Svelte 

 6.5K  206   

###  m3-svelte

 7.1.2 **2mo ago** 

An implementation of the Material 3 design system 

 206  421   

## SvelteKit adapters aa

  

###  @sveltejs/adapter-node

 5.5.4 **2mo ago** 

Builds a standalone Node server 

 468K  20K   

###  @sveltejs/adapter-cloudflare

 7.2.8 **2mo ago** 

Builds your app for Cloudflare 

 113K  20K   

###  @sveltejs/adapter-netlify

 6.0.4 **2mo ago** 

Builds your app for Netlify 

 14K  20K     show all (12) show less 

###  @sveltejs/adapter-vercel

 6.3.3 **2mo ago** 

Builds your app for Vercel 

 170K  20K   

###  @sveltejs/adapter-static

 3.0.10 **7mo ago** 

Builds your static site 

 429K  20K   

###  @deno/svelte-adapter

 0.1.1 **3mo ago** 

Builds your app for Deno Deploy 

 734  24   

###  amplify-adapter

 1.3.0 **2mo ago** 

Builds your app for AWS Amplify 

 1.8K  36   

###  svelte-kit-sst

 2.43.5 **2y ago** 

Builds your app for AWS Lambda and AWS Lamda@Edge 

 6.3K  25K   

###  svelte-adapter-bun

 1.0.1 **6mo ago** 

Builds your app for Bun 

 13K  661   

###  svelte-adapter-appengine

 1.2.0 **1y ago** 

Builds your app for Google Cloud App Engine 

 174  73   

###  sveltekit-adapter-chrome-extension

 2.0.1 **2y ago** 

Builds your app as a Chrome extension using manifest v3 

 215  149   

###  @slicemachine/adapter-sveltekit

 0.3.95 **3mo ago** 

Integrate with Prismic's Slice Machine 

 569  303   

## Content aa

  

###  mdsvex

 0.12.7 **2mo ago** 

A Markdown preprocessor that lets you put Markdown in your Svelte and Svelte in your Markdown 

 88K  3K   

###  @content-collections/core

 0.15.0 **2w ago** 

Transform your content into type-safe data collections 

 64K  1.1K   

###  svelte-exmarkdown

 5.0.2 **9mo ago** 

Extensible component for Markdown rendering 

 56K  329     show all (10) show less 

###  @magidoc/plugin-svelte-marked

 6.3.0 **6mo ago** 

Markdown parser that supports Github Flavored Markdown 

 3.6K  283   

###  @prismicio/svelte

 2.2.1 **3w ago** 

Components and helpers to fetch and present Prismic content 

 778  28   

###  carta-md

 4.11.2 **3w ago** 

A lightweight, fully customizable, Markdown editor 

 9.1K  748   

###  @sveltepress/vite

 1.3.11 **2w ago** 

A content centered site build tool 

 1.7K  518   

###  @evidence-dev/evidence

 40.1.8 **3mo ago** 

A framework for building and publishing data products using SQL, Markdown, and AI 

 20K    

###  @embedpdf/svelte-pdf-viewer

 2.14.1 **1w ago** 

Complete, production-ready PDF viewer and editor component 

 389  3.9K   

###  svelte-pdf

 2.0.2 **6mo ago** 

Render PDF documents using PDF.js 

 1.8K  252   

## Rich text editing aa

  

###  prosekit

 0.19.0 **1mo ago** 

Framework agnostic and headless rich text editor 

 8.6K  972   

###  svelte-lexical

 0.6.4 **3mo ago** 

Rich text editor for Svelte based on lexical 

 3.9K  574   

###  typewriter-editor

 0.12.9 **1y ago** 

A rich text editor using the Delta format with decorations and rendered with a tiny virtual dom 

 335  433    

## Data visualization aa

  

###  layerchart

 1.0.13 **4mo ago** 

Composable chart components for building a wide range of visualizations 

 78K  1.2K   

###  layercake

 10.0.2 **7mo ago** 

Create responsive graphics that can work without JavaScript 

 35K  1.8K   

###  svelte-maplibre

 1.3.0 **1mo ago** 

Publish maps on your website with GPU-accelerated vector tile rendering 

 23K  494     show all (5) show less 

###  @xyflow/svelte

 1.5.2 **1mo ago** 

Customizable component for building node-based UIs and diagrams 

 101K  35K   

###  svelte-maplibre-gl

 1.0.3 **4mo ago** 

Build interactive web maps with MapLibre GL 

 4.4K  297   

## Auth aa

  

###  better-auth

 1.6.9 **1w ago** 

Authentication and authorization framework 

 2.3M  28K   

###  @supabase/ssr

 0.10.2 **3w ago** 

Server-side library for cookie-based authentication with SvelteKit 

 2.6M  190   

###  altcha

 3.0.4 **2w ago** 

Privacy-first CAPTCHA widget, compliant with global regulations and WCAG accessible 

 46K  2.2K     show all (7) show less 

###  svelte-clerk

 1.1.5 **1w ago** 

Unofficial implementation of Clerk 

 7.6K  238   

###  svelte-session-manager

 3.0.86 **1mo ago** 

JWT session store 

 386  110   

###  svelte-kit-sessions

 0.4.0 **1y ago** 

Session management library for SvelteKit 

 680  20   

###  @passlock/sveltekit

 0.9.32 **6mo ago** 

Passkey authentication and social login for SvelteKit apps 

 9  187   

## Third party services aa

  

###  @sentry/svelte

 10.50.0 **1w ago** 

Official Sentry SDK for Svelte 

 183K  8.6K   

###  @sentry/sveltekit

 10.50.0 **1w ago** 

Official Sentry SDK for SvelteKit 

 144K  8.6K   

###  svelte-stripe

 2.0.0 **3mo ago** 

Add Stripe Elements to your project 

 6K  490     show all (6) show less 

###  svelte-clerk

 1.1.5 **1w ago** 

Unofficial implementation of Clerk 

 7.6K  238   

###  @storyblok/svelte

 6.1.3 **2w ago** 

Integrate the Storyblok headless CMS into your project 

 1.2K  47   

###  @inlang/paraglide-js

 2.16.1 **1w ago** 

A compiler-based i18n library that emits tree-shakeable message functions 

 204K  377   

## Internationalization (i18n) aa

  

###  @inlang/paraglide-js

 2.16.1 **1w ago** 

A compiler-based i18n library that emits tree-shakeable message functions 

 204K  377   

###  @wuchale/svelte

 0.19.3 **1mo ago** 

Protobuf-like i18n from plain code 

 4.3K  312   

###  i18n-js

 4.5.3 **2mo ago** 

A small library to provide I18n on JavaScript 

 459K  233    

## Media aa

  

###  @sveltejs/enhanced-img

 0.10.4 **2mo ago** 

Image optimization for your Svelte apps 

 46K  20K   

###  @unpic/svelte

 1.0.1 **5mo ago** 

Responsive image component that integrates with popular CDNs 

 18K  2K   

###  @poppanator/sveltekit-svg

 7.0.0 **1w ago** 

Import SVG files as Svelte components 

 30K  289     show all (6) show less 

###  svelte-easy-crop

 5.0.1 **1mo ago** 

A component for cropping images 

 16K  245   

###  @uppy/svelte

 5.2.0 **3mo ago** 

Upload files from your computer or cloud storage services 

 3K  31K   

###  scrolly-video

 0.0.24 **1y ago** 

A component for scroll-based (or other externally controlled) playback 

 1.3K  1.1K   

## Individual components aa

  

###  @tanstack/svelte-table

 8.21.3 **1y ago** 

Headless UI for building powerful tables & datagrids 

 31K  28K   

###  @ai-sdk/svelte

 4.0.168 **2w ago** 

Library for building AI-powered applications and agents 

 389K  24K   

###  @tanstack/svelte-virtual

 3.13.24 **2w ago** 

Headless UI for virtualizing scrollable elements 

 25K  6.7K     show all (5) show less 

###  virtua

 0.49.1 **3w ago** 

A zero-config, fast and small (~3kB) virtual list and grid component 

 519K  3.4K   

###  @event-calendar/core

 5.7.0 **3w ago** 

Full-sized drag & drop event calendar with resource & timeline views 

 23K  2.2K   

## Animations aa

  

###  @threlte/core

 8.5.9 **3w ago** 

A 3D framework for the web, built on top of Svelte and Three.js 

 31K  3.2K   

###  @neoconfetti/svelte

 2.2.2 **1y ago** 

Confetti explosion 

 35K  312   

###  svelte-motion

 0.12.2 **2y ago** 

Animation library based on framer-motion 

 8.8K  656     show all (5) show less 

###  @lottiefiles/svelte-lottie-player

 0.3.1 **2y ago** 

Lottie animation player 

 6.8K  141   

###  @tsparticles/svelte

 3.1.1 **2y ago** 

Easily create highly customizable particles, confetti, and fireworks 

 3.3K  64   

## SEO aa

  

###  svelte-meta-tags

 4.6.0 **4w ago** 

SEO components with deep merge functionality and JSON-LD support 

 24K  648   

###  super-sitemap

 1.0.12 **3w ago** 

A SvelteKit sitemap generator that makes it impossible to forget to add your paths 

 7.5K  249   

###  svelte-seo

 2.0.0 **6mo ago** 

Add meta tags, Open Graph, and JSON-LD to your site 

 1.6K  536     show all (4) show less 

###  svead

 0.0.15 **11mo ago** 

Set head meta information, canonical, title, Twitter and Facebook Open Graph tags, and schema.org data 

 392  111   

## Devtools aa

  

###  svelte-render-scan

 1.1.0 **1y ago** 

Visual debugging tool 

 14K  185   

###  svelte-inspect-value

 0.11.1 **1w ago** 

Value inspector component 

 1.3K  153    

## Icons aa

 

See the icons documentation for best practices when using an icon library 

###  @iconify/tailwind4

 1.2.3 **2mo ago** 

Iconify plugin for Tailwind CSS 

 53K  18   

###  @unocss/preset-icons

 66.6.8 **3w ago** 

Pure CSS Icons for UnoCSS 

 292K  19K   

###  @lucide/svelte

 1.11.0 **1w ago** 

Beautiful and consistent icons 

 283K  22K     show all (6) show less 

###  svelte-awesome

 3.3.5 **2y ago** 

Font Awesome icons for Svelte 

 30K  506   

###  phosphor-svelte

 3.1.0 **3mo ago** 

A clean and friendly icon family 

 27K  263   

###  unplugin-icons

 23.0.1 **4mo ago** 

A Vite plugin that provides icons on demand 

 323K  4.8K   

## Testing aa

 

You might find the documentation about testing to be helpful during setup 

###  @testing-library/svelte

 5.3.1 **4mo ago** 

Testing utilities for DOM interaction 

 481K  654   

###  playwright

 1.59.1 **1mo ago** 

Browser automation for end-to-end testing 

 48M  87K   

###  vitest

 4.1.5 **2w ago** 

Vite-powered testing framework 

 52M  16K     show all (4) show less 

###  storybook

 10.3.5 **4w ago** 

Develop, document, and test UI components in isolation 

 14M  90K   

## Bundler plugins aa

 

If you’re using SvelteKit or a similar framework, this part is taken care of. If you’re setting things up on your own, you will need a plugin to tell your bundler how to compile Svelte files 

###  @sveltejs/vite-plugin-svelte

 7.0.0 **2mo ago** 

The official Svelte plugin for Vite 

 2.3M  1K   

###  rollup-plugin-svelte

 7.2.3 **8mo ago** 

Compile Svelte components with Rollup 

 114K  514   

###  svelte-loader

 3.2.4 **2y ago** 

Compile Svelte components with webpack 

 66K  604     show all (4) show less 

###  esbuild-svelte

 0.9.4 **5mo ago** 

Compile Svelte components with esbuild 

 27K  264   

## Routing aa

 

The official router is SvelteKit, but here are some alternatives 

###  svelte5-router

 3.1.0 **3mo ago** 

A declarative Svelte routing library with SSR support 

 4.5K  17   

###  @roxi/routify

 3.6.4 **8mo ago** 

Routes based on file structure 

 6.8K    

###  svelte-pathfinder

 4.8.1 **2y ago** 

A tiny, state-based router 

 5.7K  136     show all (4) show less 

###  universal-router

 10.0.3 **3mo ago** 

Isomorphic router for JavaScript web applications 

 28K  1.8K   

## Data fetching aa

 

We recommend using SvelteKit’s remote functions, but for specific needs you can use these alternatives 

###  @tanstack/svelte-query

 6.1.24 **1w ago** 

Primitives for managing, caching and syncing asynchronous and remote data 

 98K  49K   

###  @urql/svelte

 5.0.0 **9mo ago** 

Customizable GraphQL client 

 18K  8.9K   

###  houdini

 1.5.10 **9mo ago** 

The disappearing GraphQL framework 

 5.9K  976     show all (6) show less 

###  trpc-sveltekit

 3.6.3 **1y ago** 

SvelteKit adapter for tRPC.io that supports Node, Vercel and Netlify 

 4.4K  840   

###  @orpc/svelte-query

 1.14.0 **1w ago** 

APIs that are end-to-end type-safe and adhere to OpenAPI standards 

 443  5.2K   

###  sswr

 2.2.0 **1y ago** 

Svelte stale while revalidate (SWR) data fetching strategy 

 404K  291   

## Forms aa

 

SvelteKit has built-in forms, but you can also use these packages 

###  sveltekit-superforms

 2.30.1 **1mo ago** 

Server-side and client-side form validation library 

 133K  2.7K   

###  formsnap

 2.0.1 **1y ago** 

Accessible form components built on top of sveltekit-superforms 

 85K  793   

###  felte

 1.3.0 **2y ago** 

An extensible form library 

 20K  1.1K     show all (4) show less 

###  @tanstack/svelte-form

 1.29.1 **2w ago** 

Powerful, type-safe forms 

 20K  6.3K

**Tool Call: Fetch `https://www.npmjs.com/package/svelte-sonner`**
Status: Completed

skip to:contentpackage searchsign innpmSearchSign UpSign In 

# svelte-sonner

1.1.1 • Public • Published 8 days ago
-  Readme
- Code Beta
- 1 Dependency
- 69 Dependents
- 59 Versions

https://github.com/wobsoriano/svelte-sonner/assets/13049130/4b9c250f-1431-4130-9c5b-5a4f8b0210c5

# svelte-sonner

An opinionated toast component for Svelte. A port of Emil Kowalski's Sonner.

## Quick start

Install it:

```
npm i svelte-sonner
# or
yarn add svelte-sonner
# or
pnpm add svelte-sonner
```

Add `<Toaster />` to your app, it will be the place where all your toasts will be rendered. After that, you can use `toast()` from anywhere in your app.

```
<script>
	import { Toaster, toast } from 'svelte-sonner';
</script>

<Toaster />
<button onclick={() => toast('My first toast')}>Give me a toast</button>
```

## Types

### Default

Most basic toast. You can customize it (and any other type) by passing an options object as the second argument.

```
toast('Event has been created');
```

With custom icon and description:

```
import Icon from './Icon.svelte';

toast('Event has been created', {
	description: 'Monday, January 3rd at 6:00pm',
	icon: Icon
});
```

### Success

Renders a checkmark icon in front of the message.

```
toast.success('Event has been created');
```

### Info

Renders a question mark icon in front of the message.

```
toast.info('Event has new information');
```

### Warning

Renders a warning icon in front of the message.

```
toast.warning('Event has warning');
```

### Error

Renders an error icon in front of the message.

```
toast.error('Event has not been created');
```

### Action

Renders a button.

```
toast('Event has been created', {
	action: {
		label: 'Undo',
		onClick: () => console.log('Undo')
	}
});
```

### Promise

Starts in a loading state and will update automatically after the promise resolves or fails.

```
toast.promise(() => new Promise((resolve) => setTimeout(resolve, 2000)), {
	loading: 'Loading',
	success: 'Success',
	error: 'Error'
});
```

You can pass a function to the success/error messages to incorporate the result/error of the promise.

```
toast.promise(promise, {
	loading: 'Loading...',
	success: (data) => {
		return `${data.name} has been added!`;
	},
	error: 'Error'
});
```

### Custom Component

You can pass a component as the first argument instead of a string to render custom component while maintaining default styling. You can use the headless version below for a custom, unstyled toast.

```
toast(CustomComponent);
```

### Updating a toast

You can update a toast by using the `toast` function and passing it the id of the toast you want to update, the rest stays the same.

```
const toastId = toast('Sonner');

toast.success('Toast has been updated', {
	id: toastId
});
```

## Customization

### Headless

You can use `toast.custom` to render an unstyled toast with custom component while maintaining the functionality.

```
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<div>
	This is a custom component <button onclick={() => dispatch('closeToast')}>close</button>
</div>
```

```
import HeadlessToast from './HeadlessToast.svelte';

toast.custom(HeadlessToast);
```

### Theme

You can change the theme using the `theme` prop. Default theme is light.

```
<Toaster theme="dark" />
```

### Position

You can change the position through the `position` prop on the `<Toaster />` component. Default is `bottom-right`.

```
<!-- Available positions -->
<!-- top-left, top-center, top-right, bottom-left, bottom-center, bottom-right -->

<Toaster position="top-center" />
```

### Expanded

Toasts can also be expanded by default through the `expand` prop. You can also change the amount of visible toasts which is 3 by default.

```
<Toaster expand visibleToasts={9} />
```

### Styling

Styling can be done globally via `toastOptions`, this way every toast will have the same styling.

```
<Toaster
	toastOptions={{
		style: 'background: red;',
		class: 'my-toast',
		descriptionClass: 'my-toast-description'
	}}
/>
```

You can also use the same props when calling `toast` to style a specific toast.

```
toast('Event has been created', {
	style: 'background: red;',
	class: 'my-toast',
	descriptionClass: 'my-toast-description'
});
```

### Tailwind CSS

The preferred way to style the toasts with tailwind is by using the `unstyled` prop. That will give you an unstyled toast which you can then style with tailwind.

```
<Toaster
	toastOptions={{
		unstyled: true,
		classes: {
			toast: 'bg-blue-400',
			title: 'text-red-400',
			description: 'text-red-400',
			actionButton: 'bg-zinc-400',
			cancelButton: 'bg-orange-400',
			closeButton: 'bg-lime-400'
		}
	}}
/>
```

You can do the same when calling `toast()`.

```
toast('Hello World', {
	unstyled: true,
	classes: {
		toast: 'bg-blue-400',
		title: 'text-red-400 text-2xl',
		description: 'text-red-400',
		actionButton: 'bg-zinc-400',
		cancelButton: 'bg-orange-400',
		closeButton: 'bg-lime-400'
	}
});
```

Styling per toast type is also possible.

```
<Toaster
	toastOptions={{
		unstyled: true,
		classes: {
			error: 'bg-red-400',
			success: 'text-green-400',
			warning: 'text-yellow-400',
			info: 'bg-blue-400'
		}
	}}
/>
```

### Changing Icon

You can change the default icons using snippets:

```
<Toaster>
	{#snippet loadingIcon()}
		<LoadingIcon />
	{/snippet}
	{#snippet successIcon()}
		<SuccessIcon />
	{/snippet}
	{#snippet errorIcon()}
		<ErrorIcon />
	{/snippet}
	{#snippet infoIcon()}
		<InfoIcon />
	{/snippet}
	{#snippet warningIcon()}
		<WarningIcon />
	{/snippet}
</Toaster>
```

### Close button

Add a close button to all toasts that shows on hover by adding the `closeButton` prop.

```
<Toaster closeButton />
```

### Rich colors

You can make error and success state more colorful by adding the `richColors` prop.

```
<Toaster richColors />
```

### Custom offset

Offset from the edges of the screen.

```
<Toaster offset="80px" />
```

### Programmatically remove toast

To remove a toast programmatically use `toast.dismiss(id)`. The `toast()` function returns the id of the toast.

```
const toastId = toast('Event has been created');

toast.dismiss(toastId);
```

You can also dismiss all toasts at once by calling `toast.dismiss()` without an id.

```
toast.dismiss();
```

### `useSonner`

You can use the `useSonner` hook to retrieve all visible toasts like below.

```
const sonner = useSonner();

$effect(() => console.log(sonner.toasts));
```

### Duration

You can change the duration of each toast by using the `duration` property, or change the duration of all toasts like this:

```
<Toaster duration={10000} />
```

```
toast('Event has been created', {
	duration: 10000
});

// Persisent toast
toast('Event has been created', {
	duration: Number.POSITIVE_INFINITY
});
```

### On Close Callback

You can pass `onDismiss` and `onAutoClose` callbacks. `onDismiss` gets fired when either the close button gets clicked or the toast is swiped. `onAutoClose` fires when the toast disappears automatically after it's timeout ( `duration` prop).

```
toast('Event has been created', {
	onDismiss: (t) => console.log(`Toast with id ${t.id} has been dismissed`),
	onAutoClose: (t) => console.log(`Toast with id ${t.id} has been closed automatically`)
});
```

## Keyboard focus

You can focus on the toast area by pressing ⌥/alt + T. You can override it by providing an array of `event.code` values for each key.

```
<Toaster hotkey={['KeyC']} />
```

## License

MIT

## Readme

### Keywords

- svelte
- toast

# Provenance

Share feedback

## Package Sidebar

### Install

`npm i svelte-sonner`

### Repository

Gitgithub.com/wobsoriano/svelte-sonner

### Homepage

github.com/wobsoriano/svelte-sonner#readme

### DownloadsWeekly Downloads

261,029

### Version

1.1.1

### License

MIT

### Last publish

8 days ago

### Collaborators

- wobsoriano

**Analyze security** with Socket**Check bundle size****View package health****Explore dependencies****Report** malware 

## Footer

### Support

- Help
- Advisories
- Status
- Contact npm

### Company

- About
- Blog
- Press

### Terms & Policies

- Policies
- Terms of Use
- Code of Conduct
- Privacy

**Tool Call: Fetch https://www.npmjs.com/package/sveltekit\-superforms**
Status: Completed

skip to:contentpackage searchsign innpmSearchSign UpSign In 

# sveltekit-superforms

2.30.1 • Public • Published a month ago
-  Readme
- Code Beta
- 3 Dependencies
- 30 Dependents
- 230 Versions

    

# Superforms 💥

  

Making SvelteKit forms a pleasure to use!  https://superforms.rocks/    Discord    •    API    •    FAQ    •    npm    •    Issues

# Feature list

- Server- and client-side validation with your favorite validation libraries, and more to come: 💥 Arktype 💥 class-validator 💥 Effect 💥 Joi 💥 Superstruct 💥 TypeBox 💥 Valibot 💥 VineJS 💥 Yup 💥 Zod 💥 or use JSON Schema directly.
- Seamless merging of `PageData` and `ActionData` - Forget about how to combine them, just focus on your form data, always strongly typed.
- Auto-centering and focusing on invalid form fields.
- Tainted form detection, prevents the user from losing data if navigating away from an unsaved form. Or use snapshots to save the form state.
- Automatically coerces `FormData` into correct types, including arrays and files.
- For advanced data structures, forget about the limitations of `FormData` - Post nested data structures like a RPC call.
- Generates default form values from many validation schemas.
- Handles multiple forms on the same page.
- Works both on the server and with single-page applications (SPA)!
- Convenient handling and validation of file uploads, both on server and client and even in nested data.
- Proxy objects for handling data conversions to string and back again.
- Realtime client-side validation for the best possible UX.
- Create loading spinners easily with three auto-updating timers, based on human perception research.
- Hook into a number of events for full control over the validation data and the `ActionResult`, with a possibility to cancel the update at every step.
- Complete customization with a huge list of options.
- No JavaScript required as default, but full support for progressive enhancement.
- Comes with a Super Debugging Svelte Component: SuperDebug.

# Get started

Follow the Get started tutorial on the website to get a hands-on introduction to Superforms: https://superforms.rocks/get-started

You can also watch this excellent introduction video to see what's possible: https://www.youtube.com/watch?v=MiKzH3kcVfs

# Help & support

- If you're using Superforms in non-profit circumstances, support is completely free; a star on Github is more than enough to show your appreciation. Join the #free-support channel on Discord and ask away!
- If you're making or aiming to make money on your project, a donation proportional to the current profit of the project or the company you work for, will give you a month of commercial support. Donate with one of the options on the website, then ask in the #commercial-support channel on Discord.

# Contributing

General feedback, feature requests, bug reports, PR:s, are very welcome as a Github issue or on the Discord server!

# Donating

If you appreciate the hard work behind Superforms, please support open source software with a donation.

  

## Readme

### Keywords

- sveltekit
- svelte
- form
- validation
- forms
- schema
- arktype
- class-validator
- effect
- joi
- json-schema
- superstruct
- schemasafe
- standard
- typebox
- valibot
- vinejs
- yup
- zod

## Package Sidebar

### Install

`npm i sveltekit-superforms`

### Repository

Gitgithub.com/ciscoheat/sveltekit-superforms

### Homepage

superforms.rocks**Fund** this package

### DownloadsWeekly Downloads

135,248

### Version

2.30.1

### License

MIT

### Last publish

a month ago

### Collaborators

- ciscoheat

**Analyze security** with Socket**Check bundle size****View package health****Explore dependencies****Report** malware 

## Footer

### Support

- Help
- Advisories
- Status
- Contact npm

### Company

- About
- Blog
- Press

### Terms & Policies

- Policies
- Terms of Use
- Code of Conduct
- Privacy

**Tool Call: Fetch https://svelte.dev/docs/kit/icons**
Status: Completed

Skip to main content     SvelteKitBest practices 

# Icons

   

### On this page

  

## CSS

A great way to use icons is to define them purely via CSS. Iconify offers support for many popular icon sets that can be included via CSS. This method can also be used with popular CSS frameworks by leveraging the Iconify Tailwind CSS plugin or UnoCSS plugin. As opposed to libraries based on Svelte components, it doesn't require each icon to be imported into your `.svelte` file.

## Svelte

There are many icon libraries for Svelte. When choosing an icon library, it is recommended to avoid those that provide a `.svelte` file per icon, as these libraries can have thousands of `.svelte` files which really slow down Vite's dependency optimization. This can become especially pathological if the icons are imported both via an umbrella import and subpath import as described in the `vite-plugin-svelte` FAQ. 

 Edit this page on GitHub  llms.txt previous next Performance Images

## Assistant

<thinking>
Now I have a good picture of the Svelte ecosystem. Let me also check `@lucide/svelte` since it's the most popular icon library and is from the official Lucide project, and also check `bits-ui` since it's the foundation for shadcn-svelte.

Let me also check what `@iconify/tailwind4` provides since that's what the SvelteKit docs recommend.

Now let me put together a comprehensive summary of the packages relevant to the BR Skins Hub rebuild, organized by category.

Key findings:
1. **shadcn-svelte** - Already decided, great choice, has all the components they need (Dialog, ContextMenu, Dropdown, Tooltip, Popover, Tabs, Sonner, Skeleton, etc.)


2. **Icons** - `@iconify/tailwind4` is the better choice here since it's CSS-based and recommended by SvelteKit docs, whereas `@lucide/svelte` creates performance issues with its per-icon component approach despite being more popular. For toasts, `svelte-sonner` is already wrapped by shadcn-svelte's Sonner component, so that's covered.

3. **Forms** - `sveltekit-superforms` is powerful but probably unnecessary for their relatively straightforward dashboard forms. Data fetching doesn't need a separate library since they're already using load() and invalidate(). Built-in `svelte/motion` handles animations, and `@tanstack/svelte-query` is redundant for the same reason. `bits-ui` comes automatically as a shadcn-svelte dependency.

4. **For their project** - The essentials are shadcn-svelte, svelte-sonner, and @iconify/tailwind4, with sveltekit-superforms as an optional addition if form complexity grows.
</thinking>

Now I have everything I need. Let me give you a focused breakdown — only what's actually relevant to your project, no noise.

---

## What you actually need

### ✅ Already decided
**shadcn-svelte** covers a huge amount on its own. Looking at their component list, you get basically everything you used from Nuxt UI: `Dialog`, `Dropdown Menu`, `Context Menu`, `Tooltip`, `Popover`, `Tabs`, `Skeleton`, `Badge`, `Avatar`, `Input`, `Button`, `Separator`, `Sheet` (drawers), `Combobox`, `Scroll Area` — and crucially a `Sonner` component built-in. That's the toast system. No separate package needed for toasts.

---

### 🎯 Icons — use `@iconify/tailwind4`, not `@lucide/svelte`

This is worth calling out because the SvelteKit docs **explicitly warn against** icon libraries that ship one `.svelte` file per icon (like `@lucide/svelte`, `phosphor-svelte`, etc.) — they severely slow down Vite's dependency optimization with thousands of files. The recommended approach is CSS-based icons:

```/dev/null/terminal.sh#L1-2
bun add -d @iconify/tailwind4
# gives you access to every Iconify icon set as pure CSS classes
```

You configure it once in Tailwind and then use icons exactly like you do now with Nuxt UI — just class names:

```/dev/null/example.svelte#L1-3
<!-- heroicons, simple-icons, lucide, phosphor, tabler, etc. all work -->
<span class="i-heroicons-user size-5"></span>
<span class="i-simple-icons-discord size-4"></span>
```

Your current `ICONS` constants file ports over 1:1 — same class name strings, just used differently.

---

### 📋 Forms — `sveltekit-superforms` (for the dashboard)

Your dashboard has several forms (create/edit player, create/edit skin). Right now you handle validation manually in each Nitro route with a bunch of `typeof body.name !== 'string'` checks. Superforms eliminates all of that:

- Server + client validation with Zod or Valibot (your choice)
- Tainted form detection (warns before leaving unsaved forms — you have `useDiscardGuard` for this right now)
- Auto-handles loading states, error messages per field, form reset
- Works with shadcn-svelte's `Formsnap` component (which shadcn-svelte already lists)

This replaces your `useSubmitAction`, `useDiscardGuard`, and the manual validation in every API route. Not mandatory, but it'll save you a lot of boilerplate specifically in the dashboard.

---

### 🔍 Everything else you DON'T need a package for

| Need | Solution |
|---|---|
| Reactive state | Svelte 5 `$state`, `$derived` — built-in |
| Animations / transitions | `svelte/motion` (tweened, spring) — built-in |
| Route params | `page.params` from `$app/state` — built-in |
| Intersection observer | Native browser API as a `use:` action — 10 lines |
| Clipboard | `navigator.clipboard.writeText()` — native |
| Fuzzy search | `fuse.js` — same package you already use |
| Date formatting | `date-fns` — small, tree-shakeable |
| Image optimization | `@sveltejs/enhanced-img` — official, built into SvelteKit |

---

### 📦 Final install list

```/dev/null/terminal.sh#L1-8
# Core
bun add convex jose osu-api-extended fuse.js date-fns

# UI (shadcn-svelte sets up Tailwind during its own install)
npx shadcn-svelte@latest init

# Icons (CSS-based, Vite-friendly)
bun add -d @iconify/tailwind4

# Forms (for dashboard — optional but recommended)
bun add sveltekit-superforms valibot

# File uploads
bun add @uploadthing/svelte
```

That's it. shadcn-svelte + svelte-sonner (which shadcn installs) + @iconify/tailwind4 covers everything Nuxt UI was doing for you. The rest is either built into Svelte/SvelteKit or packages you're already using.

## User

now sumarize all of this that we discussed and make it like a huge context markdown talking about what we discussed, what Im trying to do etc just so i can put in on an ai agent and make it know what we are going to do. all sumarized please.

also just write here, no need to create an archive .md, just respond to me like usual

## Assistant

<thinking>
The user wants a comprehensive summary of everything we discussed in this conversation, formatted as a markdown document they can paste into an AI agent as context. They want it written as a response, not saved to a file. Let me summarize:

1. Current project: BR Skins Hub (Nuxt/Vue) - what it is and what it does
2. The decision to rebuild in SvelteKit
3. The architecture decisions (no reactive Convex on frontend, load() + invalidate(), hooks.server.ts for auth, etc.)
4. The tech stack for the new project
5. Key concepts learned (load, invalidate, hooks, etc.)
6. The roadmap/phases


7. The package choices we settled on for the SvelteKit rebuild

I should make this concise but comprehensive - enough context for an AI to understand what's happening without being overwhelming. The user said "summarized" so I shouldn't just dump everything - I should distill the key points.
</thinking>

# BR Skins Hub — SvelteKit Rebuild: Full Context

## What is BR Skins Hub

BR Skins Hub is a web app for the Brazilian osu! community. It's a hub where players are listed with their profile info and the osu! skins they use. The public can browse players and skins. Admins can manage everything through a dashboard.

**Public pages:**
- `/` — players list with search, sort, infinite scroll
- `/skins` — skins list with search, sort, infinite scroll
- `/player/[playerId]` — individual player profile (cover image, avatar, description, links, their skins)
- `/login` — osu! OAuth login page

**Dashboard (admin-only):**
- `/dashboard` — two-panel layout: left panel lists players or skins, right panel shows an editor for the selected item. Admins can create, edit, delete players and skins, and assign skins to players.

---

## Current Stack (Nuxt/Vue — being replaced)

- **Framework:** Nuxt 3 + Vue 3 with Svelte 5 runes style composables
- **Database:** Convex (BaaS with real-time capabilities)
- **Auth:** Custom — osu! OAuth2 → JWT stored in httpOnly cookie
- **UI:** Nuxt UI (being replaced)
- **State:** Pinia (being replaced)
- **Server utilities:** H3 (Nitro) for API routes
- **File uploads:** UploadThing
- **Icons:** Iconify via Nuxt UI/UnoCSS
- **Utilities:** VueUse

**The main pain point with the current structure:** one file per HTTP method per route. `players/[id]/index.patch.ts`, `players/[id]/index.delete.ts`, `players/[id]/views.post.ts` — all separate files for what should be one route. SvelteKit consolidates these into a single `+server.ts` with exported `PATCH`, `DELETE`, `POST` handlers.

---

## The Convex Setup (stays identical)

Convex is used as the database. The `convex/` directory is **100% portable** — it doesn't belong to Nuxt or SvelteKit, it deploys independently. Zero changes needed.

**Schema tables:** `players`, `skins`, `playerSkins` (N:N relation), `authUsers`

**Key architecture decision:** The app does NOT use Convex's real-time WebSocket subscription on the frontend. Data changes rarely (it's a skin hub, not a social feed), so there's no need for live reactive queries. Instead:
- Data is fetched server-side via `ConvexHttpClient` in SvelteKit `load()` functions
- `CONVEX_URL` stays a **private** server-only env var, never exposed to the browser
- After mutations, `invalidate()` triggers a re-run of the relevant `load()` to get fresh data

**Server-side Convex usage (mutations):** All create/update/delete operations go through SvelteKit `+server.ts` API routes, which call `convex.mutation()` via `ConvexHttpClient`. This is where auth checks and admin guards happen — the same pattern as the current Nitro routes.

---

## New Stack (SvelteKit)

- **Framework:** SvelteKit + Svelte 5 (runes: `$state`, `$derived`, `$effect`)
- **Database:** Convex — same, zero changes to `convex/` directory
- **Auth:** Same custom system — osu! OAuth2 → JWT → httpOnly cookie — ported from Nuxt using `jose`
- **UI:** shadcn-svelte (Tailwind CSS v4 + Bits UI headless primitives)
- **Icons:** `@iconify/tailwind4` — CSS-based, no per-icon `.svelte` files (SvelteKit docs explicitly warn against those for Vite performance reasons)
- **Toasts:** `svelte-sonner` — already included via shadcn-svelte's Sonner component
- **Forms:** `sveltekit-superforms` + `valibot` — for dashboard forms, replaces manual validation + `useDiscardGuard` + `useSubmitAction`
- **Fuzzy search:** `fuse.js` — same package
- **File uploads:** `@uploadthing/svelte`
- **No Pinia** — Svelte 5 `$state` in `.svelte.ts` files handles all state
- **No convex-svelte** — not needed since all queries go through `load()` server-side

---

## Key SvelteKit Concepts Being Used

### `load()` functions
Every page has a `+page.server.ts` sibling that exports a `load()` function. It runs on the server before the page renders, fetches data via `ConvexHttpClient`, and returns it. The data becomes the `data` prop in `+page.svelte` automatically — SSR'd in, no client-side fetch needed.

### `invalidate()`
After any mutation (called from a `+server.ts` API route), the frontend calls `invalidate('app:key')`. This re-runs any `load()` function that declared `depends('app:key')`, giving you fresh data without a full page reload.

### `hooks.server.ts`
Runs on **every single request** before anything else. This is where the JWT cookie is verified and `event.locals.user` is populated. This replaces the pattern of calling `getUser(event)` manually in every route.

### `event.locals`
The object populated in `hooks.server.ts`. Every `+page.server.ts`, `+layout.server.ts`, and `+server.ts` has access to `event.locals.user` automatically — no manual auth checking boilerplate.

### Root `+layout.server.ts`
Runs on every page. Reads `locals.user`, queries Convex for the auth user record, and returns `{ user }`. This means `data.user` is available in every single page and layout component app-wide — **completely replaces the `useAuth()` composable + `/api/auth/me` endpoint** that exists in the Nuxt version.

### Dashboard protection
`src/routes/dashboard/+layout.server.ts` checks `locals.user` and redirects non-admins before rendering anything. This replaces the client-side `auth.global.ts` middleware — more secure because it's server-side and can't be bypassed before JS loads.

---

## Auth Flow (same logic, different framework primitives)

1. User clicks "Login with osu!" → redirected to osu! OAuth
2. osu! redirects to `/auth/callback?code=...`
3. `+server.ts` exchanges code for access token, fetches osu! profile
4. Calls `convex.mutation(api.auth.upsertUser, ...)` to create/update the user record
5. Creates a JWT with `jose`, sets it as `httpOnly; secure; sameSite=lax` cookie
6. Redirects to `/`
7. On every subsequent request: `hooks.server.ts` reads the cookie, verifies the JWT, populates `event.locals.user`
8. Admin status is determined by `ADMIN_OSU_IDS` env var (comma-separated osu! IDs)

---

## API Routes — Nuxt vs SvelteKit

The big structural win. In Nuxt, each HTTP method is a separate file. In SvelteKit, one file handles all methods for a route:

| Nuxt files | SvelteKit equivalent |
|---|---|
| `players/index.post.ts` | `api/players/+server.ts` → `export const POST` |
| `players/[id]/index.patch.ts` + `index.delete.ts` | `api/players/[id]/+server.ts` → `export const PATCH` + `export const DELETE` |
| `players/[id]/profile.patch.ts` | `api/players/[id]/profile/+server.ts` → `export const PATCH` |
| `players/[id]/views.post.ts` | `api/players/[id]/views/+server.ts` → `export const POST` |
| `skins/index.post.ts` | `api/skins/+server.ts` → `export const POST` |
| `skins/[id]/index.patch.ts` + `index.delete.ts` | `api/skins/[id]/+server.ts` → `export const PATCH` + `export const DELETE` |
| `skins/[id]/download.post.ts` | `api/skins/[id]/download/+server.ts` → `export const POST` |
| `player-skins/[playerId].put.ts` | `api/player-skins/[playerId]/+server.ts` → `export const PUT` |
| `player/refresh.ts` | `api/player/refresh/+server.ts` → `export const GET` |

**H3 → SvelteKit syntax mapping:**
- `getRouterParam(event, 'id')` → `event.params.id`
- `readBody(event)` → `await event.request.json()`
- `createError({ statusCode, message })` → `error(statusCode, message)` from `@sveltejs/kit`
- `getCookie(event, 'session')` → `event.cookies.get('session')`
- `setCookie(event, ...)` → `event.cookies.set(...)`
- `sendRedirect(event, '/')` → `redirect(302, '/')` from `@sveltejs/kit`
- `getQuery(event)` → `event.url.searchParams.get('key')`

---

## VueUse → Svelte replacements

| VueUse | Svelte |
|---|---|
| `useRouteParams` | `page.params` from `$app/state` — built-in |
| `useSorted` | `$derived(() => [...list].sort(...))` |
| `useIntersectionObserver` | `use:` action with native `IntersectionObserver` |
| `useClipboard` | `navigator.clipboard.writeText()` directly |
| `formatTimeAgo` | `date-fns` `formatDistanceToNow()` |

---

## Composables → Svelte utilities

| Vue composable | Svelte equivalent |
|---|---|
| `useAuth()` | Replaced entirely by `data.user` from root `+layout.server.ts` |
| `useAppToast()` | Thin wrapper around `svelte-sonner`'s `toast()` |
| `useFuzzyFilter()` | Same Fuse.js logic, wrapped in `$derived` |
| `useLoadMore()` | Same pagination logic with `$state` + `$derived` |
| `useResettableRef()` | `$state` + a `reset()` function |
| `useSubmitAction()` | `sveltekit-superforms` handles this |
| `useDiscardGuard()` | `sveltekit-superforms` tainted form detection |
| `usePlayerSync()` | Same logic, plain async function calling `/api/player/refresh` |
| `useImageUploader()` | `@uploadthing/svelte` |

---

## Project File Structure (new SvelteKit project)

```
src/
├── app.d.ts                          ← App.Locals { user }
├── hooks.server.ts                   ← JWT verification on every request
├── lib/
│   ├── server/                       ← server-only, never in client bundle
│   │   ├── convex.ts                 ← ConvexHttpClient singleton
│   │   ├── auth.ts                   ← createToken, verifyToken (jose)
│   │   ├── admin.ts                  ← requireAdmin(), isAdminId()
│   │   └── rateLimit.ts              ← in-memory rate limiter
│   ├── utils/
│   │   ├── fuzzyFilter.svelte.ts
│   │   ├── loadMore.svelte.ts
│   │   ├── resettableState.svelte.ts
│   │   └── toast.ts
│   └── components/
│       ├── ui/                       ← shadcn-svelte primitives
│       └── [custom components]
└── routes/
    ├── +layout.server.ts             ← provides user to all pages
    ├── +layout.svelte                ← nav + footer
    ├── +page.server.ts + +page.svelte ← homepage (players list)
    ├── auth/callback/+server.ts      ← osu! OAuth
    ├── auth/logout/+server.ts
    ├── login/+page.svelte
    ├── skins/
    ├── player/[playerId]/
    ├── dashboard/
    │   ├── +layout.server.ts         ← admin-only redirect
    │   └── ...
    └── api/                          ← all mutation endpoints

convex/                               ← copied as-is, zero changes
```

---

## Build Phases (ordered)

1. **Bootstrap** — scaffold project, install deps, shadcn-svelte, copy `convex/` dir
2. **Server foundation** — `convex.ts`, `auth.ts`, `admin.ts`, `rateLimit.ts`, `app.d.ts`, `hooks.server.ts`
3. **Auth flow** — OAuth callback, logout, root layout server load, login page
4. **API routes** — all 9 `+server.ts` files (direct ports of current Nitro routes)
5. **Shared utilities** — fuzzyFilter, loadMore, resettableState, toast, intersect action
6. **Public pages** — layout, homepage, skins page, player profile
7. **Dashboard** — admin gate layout, dashboard page and components
8. **UploadThing** — file router and upload components

---

## What the AI agent should know going in

- The developer is experienced with Vue/Nuxt but **new to SvelteKit** — explain SvelteKit-specific patterns when introducing them
- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) are used everywhere — no Options API, no Svelte 4 stores
- The `convex/` directory is never touched — only the SvelteKit app layer changes
- All mutations happen server-side through `+server.ts` API routes. The client never calls Convex directly
- `event.locals.user` is the source of truth for auth in every server context — always populated by `hooks.server.ts`
- shadcn-svelte components are added via CLI: `npx shadcn-svelte@latest add <component>`
- Icons are CSS classes via `@iconify/tailwind4`, same pattern as current Nuxt UI icons
