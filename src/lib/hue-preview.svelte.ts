/**
 * A color the owner is trying out in the Colors card but hasn't saved yet. The root layout shows
 * it over everything else; it's cleared after the save reloads the data, on failure, and on navigation.
 */
export const huePreview = $state<{ value: number | null }>({ value: null });
