import { Roadmap, RoadmapItem } from "../../generated/client";

/* ─────────────────────────────────────────────────────────────────
   Status enum mirror (matches Prisma RoadmapStatus)
   ──────────────────────────────────────────────────────────────── */

export type RoadmapStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED";

/* ─────────────────────────────────────────────────────────────────
   Query inputs
   ──────────────────────────────────────────────────────────────── */

export interface GetRoadmapQuery {
  /** Filter items by status */
  status?: RoadmapStatus;
}

/* ─────────────────────────────────────────────────────────────────
   Service-layer payloads
   ──────────────────────────────────────────────────────────────── */

export interface CreateRoadmapItemPayload {
  roadmapId:         string;
  workspaceId:       string;
  requestingUserId:  string;
  title:             string;
  description?:      string;
  status?:           RoadmapStatus;
  eta?:              Date;
}

export interface GetRoadmapPayload {
  /** The Roadmap record's ID */
  roadmapId: string;
  query:     GetRoadmapQuery;
}

export interface UpdateRoadmapItemPayload {
  itemId:            string;
  workspaceId:       string;
  requestingUserId:  string;
  /** Only fields present in the body are updated — true partial PATCH */
  title?:            string;
  description?:      string;
  status?:           RoadmapStatus;
  eta?:              Date | null;
  sortOrder?:        number;
}

/* ─────────────────────────────────────────────────────────────────
   Response shapes
   ──────────────────────────────────────────────────────────────── */

export type RoadmapPublic = Pick<
  Roadmap,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "isPublic"
>;

export type RoadmapItemRow = Pick<
  RoadmapItem,
  | "id"
  | "title"
  | "description"
  | "status"
  | "sortOrder"
  | "eta"
  | "createdAt"
  | "updatedAt"
>;

export interface RoadmapPageResult {
  roadmap: RoadmapPublic;
  /** Items grouped by status for easy column rendering */
  groups:  RoadmapGroupedItems;
  /** Flat ordered list — useful for timeline / list views */
  items:   RoadmapItemRow[];
  counts:  RoadmapStatusCounts;
}

export interface RoadmapGroupedItems {
  planned:    RoadmapItemRow[];
  inProgress: RoadmapItemRow[];
  completed:  RoadmapItemRow[];
}

export interface RoadmapStatusCounts {
  planned:    number;
  inProgress: number;
  completed:  number;
  total:      number;
}

export interface CreateRoadmapItemResult {
  id:          string;
  title:       string;
  description: string | null;
  status:      RoadmapStatus;
  sortOrder:   number;
  eta:         Date | null;
  createdAt:   Date;
}

export interface UpdateRoadmapItemResult {
  id:          string;
  title:       string;
  description: string | null;
  status:      RoadmapStatus;
  sortOrder:   number;
  eta:         Date | null;
  updatedAt:   Date;
}