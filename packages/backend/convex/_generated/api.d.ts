/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as invites from "../invites.js";
import type * as invoices from "../invoices.js";
import type * as jobsites from "../jobsites.js";
import type * as members from "../members.js";
import type * as model from "../model.js";
import type * as organizations from "../organizations.js";
import type * as privateData from "../privateData.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  healthCheck: typeof healthCheck;
  http: typeof http;
  invites: typeof invites;
  invoices: typeof invoices;
  jobsites: typeof jobsites;
  members: typeof members;
  model: typeof model;
  organizations: typeof organizations;
  privateData: typeof privateData;
  users: typeof users;
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
