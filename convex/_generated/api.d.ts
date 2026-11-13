/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as devices from "../devices.js";
import type * as lib_devices from "../lib/devices.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_links from "../lib/links.js";
import type * as lib_order from "../lib/order.js";
import type * as lib_otd from "../lib/otd.js";
import type * as lib_relations from "../lib/relations.js";
import type * as lib_setup from "../lib/setup.js";
import type * as lib_usernames from "../lib/usernames.js";
import type * as migrations from "../migrations.js";
import type * as players from "../players.js";
import type * as skins from "../skins.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  devices: typeof devices;
  "lib/devices": typeof lib_devices;
  "lib/functions": typeof lib_functions;
  "lib/links": typeof lib_links;
  "lib/order": typeof lib_order;
  "lib/otd": typeof lib_otd;
  "lib/relations": typeof lib_relations;
  "lib/setup": typeof lib_setup;
  "lib/usernames": typeof lib_usernames;
  migrations: typeof migrations;
  players: typeof players;
  skins: typeof skins;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
