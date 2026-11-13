import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// OTD's configs change on ~7–8 days a month, mostly single tablets; weekly is plenty, and the
// dashboard's "Sync now" covers the rest. 06:00 UTC = 03:00 in Brasília.
crons.weekly(
	"sync OpenTabletDriver tablets",
	{ dayOfWeek: "monday", hourUTC: 6, minuteUTC: 0 },
	internal.devices.syncOtd,
	{}
);

export default crons;
