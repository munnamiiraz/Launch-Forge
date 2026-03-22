import status from "http-status";
import { prisma }  from "../../lib/prisma";
import AppError    from "../../errorHelpers/AppError";
import {
  SubmitFeedbackPayload,
  GetFeedbackPayload,
  VoteFeedbackPayload,
  PaginatedFeedback,
  SubmitFeedbackResult,
  VoteResult,
} from "./feedback.interface";
import { FEEDBACK_MESSAGES } from "./feedback.constants";
import {
  normaliseFeedbackPagination,
  buildFeedbackPaginationMeta,
  buildFeedbackOrderBy,
  normaliseTitleForComparison,
  buildFeedbackSearchFilter,
} from "./feedback.utils";

/* Shared Prisma select used by both submit and list queries */
const FEATURE_REQUEST_SELECT = {
  id:          true,
  title:       true,
  description: true,
  status:      true,
  votesCount:  true,
  authorEmail: true,
  authorName:  true,
  createdAt:   true,
  updatedAt:   true,
  _count: {
    select: { comments: { where: { deletedAt: null } } },
  },
} as const;

export const feedbackService = {

  /* ──────────────────────────────────────────────────────────────
     POST /api/feedback
     Submit a feature request to a public feedback board.
     No authentication required — any visitor may submit.
     ────────────────────────────────────────────────────────────── */

  async submitFeedback(
    payload: SubmitFeedbackPayload,
  ): Promise<SubmitFeedbackResult> {
    const { boardId, title, description, authorEmail, authorName } = payload;

    /* 1. Resolve the board — must exist and be public ────────────── */
    const board = await prisma.feedbackBoard.findUnique({
      where: { id: boardId, deletedAt: null },
      select: { id: true, isPublic: true },
    });

    if (!board) {
      throw new AppError(status.NOT_FOUND, FEEDBACK_MESSAGES.BOARD_NOT_FOUND);
    }

    if (!board.isPublic) {
      throw new AppError(status.FORBIDDEN, FEEDBACK_MESSAGES.BOARD_PRIVATE);
    }

    /* 2. Duplicate title guard (case-insensitive, per board) ────────
     *
     * We normalise both sides for comparison but store the original
     * casing submitted by the user.
     * ────────────────────────────────────────────────────────────── */
    const normalisedTitle = normaliseTitleForComparison(title);

    const duplicate = await prisma.featureRequest.findFirst({
      where: {
        boardId,
        deletedAt: null,
        title: {
          equals:   normalisedTitle,
          mode:     "insensitive",
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new AppError(status.CONFLICT, FEEDBACK_MESSAGES.DUPLICATE_TITLE);
    }

    /* 3. Create the feature request ─────────────────────────────── */
    const featureRequest = await prisma.featureRequest.create({
      data: {
        boardId,
        title:       title.trim(),
        description: description?.trim(),
        authorEmail: authorEmail ?? null,
        authorName:  authorName?.trim()  ?? null,
        status:      "UNDER_REVIEW",
      },
      select: {
        id:        true,
        title:     true,
        status:    true,
        createdAt: true,
      },
    });

    return {
      id:        featureRequest.id,
      title:     featureRequest.title,
      status:    featureRequest.status as SubmitFeedbackResult["status"],
      createdAt: featureRequest.createdAt,
    };
  },

  /* ──────────────────────────────────────────────────────────────
     GET /api/feedback/:boardId
     List all feature requests for a board with filtering & pagination.
     No authentication required — public boards are openly readable.
     ────────────────────────────────────────────────────────────── */

  async getFeedback(
    payload: GetFeedbackPayload,
  ): Promise<PaginatedFeedback> {
    const { boardId, query } = payload;

    /* 1. Resolve the board ───────────────────────────────────────── */
    const board = await prisma.feedbackBoard.findUnique({
      where: { id: boardId, deletedAt: null },
      select: {
        id:          true,
        name:        true,
        slug:        true,
        description: true,
        isPublic:    true,
      },
    });

    if (!board) {
      throw new AppError(status.NOT_FOUND, FEEDBACK_MESSAGES.BOARD_NOT_FOUND);
    }

    if (!board.isPublic) {
      throw new AppError(status.FORBIDDEN, FEEDBACK_MESSAGES.BOARD_PRIVATE);
    }

    /* 2. Build filters ───────────────────────────────────────────── */
    const { page, limit, skip } = normaliseFeedbackPagination(query);

    const where = {
      boardId,
      deletedAt: null,
      ...(query.status ? { status: query.status }        : {}),
      ...buildFeedbackSearchFilter(query.search),
    };

    const orderBy = buildFeedbackOrderBy(query.sortBy, query.sortOrder);

    /* 3. Parallel: total count + page slice ─────────────────────── */
    const [total, rows] = await prisma.$transaction([
      prisma.featureRequest.count({ where }),
      prisma.featureRequest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: FEATURE_REQUEST_SELECT,
      }),
    ]);

    return {
      board: {
        id:          board.id,
        name:        board.name,
        slug:        board.slug,
        description: board.description,
        isPublic:    board.isPublic,
      },
      data: rows.map((r) => ({
        id:           r.id,
        title:        r.title,
        description:  r.description,
        status:       r.status,
        votesCount:   r.votesCount,
        authorEmail:  r.authorEmail,
        authorName:   r.authorName,
        createdAt:    r.createdAt,
        updatedAt:    r.updatedAt,
        commentCount: r._count.comments,
      })),
      meta: buildFeedbackPaginationMeta(total, page, limit),
    };
  },

  /* ──────────────────────────────────────────────────────────────
     POST /api/feedback/:id/vote
     Upvote a feature request.
     No authentication required — identified only by voterEmail.
     Idempotent: if the same email already voted, returns the
     current count without throwing.
     ────────────────────────────────────────────────────────────── */

  async voteFeedback(
    payload: VoteFeedbackPayload,
  ): Promise<VoteResult> {
    const { featureRequestId, voterEmail } = payload;

    /* 1. Verify the feature request exists and is not deleted ─────── */
    const featureRequest = await prisma.featureRequest.findUnique({
      where: { id: featureRequestId, deletedAt: null },
      select: {
        id:         true,
        votesCount: true,
        board: {
          select: { isPublic: true, deletedAt: true },
        },
      },
    });

    if (!featureRequest) {
      throw new AppError(status.NOT_FOUND, FEEDBACK_MESSAGES.REQUEST_NOT_FOUND);
    }

    /*
     * Also guard against voting on a request whose board has been
     * soft-deleted or made private after the request was created.
     */
    if (
      featureRequest.board.deletedAt !== null ||
      !featureRequest.board.isPublic
    ) {
      throw new AppError(status.FORBIDDEN, FEEDBACK_MESSAGES.BOARD_PRIVATE);
    }

    /* 2. Idempotency — check for an existing vote ───────────────────
     *
     * The schema enforces @@unique([featureRequestId, voterEmail]).
     * We check explicitly so we can return a meaningful response
     * rather than letting Prisma surface a raw unique constraint error.
     * ────────────────────────────────────────────────────────────── */
    const existingVote = await prisma.vote.findUnique({
      where: {
        featureRequestId_voterEmail: { featureRequestId, voterEmail },
      },
      select: { id: true },
    });

    if (existingVote) {
      /* Already voted — return current state, no error, no duplicate write */
      return {
        featureRequestId,
        votesCount: featureRequest.votesCount,
        voted:      false,
      };
    }

    /* 3. Create vote + increment denormalised counter atomically ──── */
    const updatedRequest = await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: { featureRequestId, voterEmail },
      });

      return tx.featureRequest.update({
        where: { id: featureRequestId },
        data:  { votesCount: { increment: 1 } },
        select: { votesCount: true },
      });
    });

    return {
      featureRequestId,
      votesCount: updatedRequest.votesCount,
      voted:      true,
    };
  },
};