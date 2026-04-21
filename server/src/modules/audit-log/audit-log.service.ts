import { prisma } from "../../lib/prisma";

export const auditLogService = {
  async getLogs(query: {
    page?:       number;
    limit?:      number;
    search?:     string;
    action?:     string;
    entity?:     string;
    userId?:     string;
    startDate?:  string;
    endDate?:    string;
  }) {
    const page  = Number(query.page)  || 1;
    const limit = Number(query.limit) || 20;
    const skip  = (page - 1) * limit;

    const where: any = {};

    if (query.action) {
      where.action = query.action;
    }

    if (query.entity) {
      where.entity = query.entity;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate)   where.createdAt.lte = new Date(query.endDate);
    }

    if (query.search) {
      where.OR = [
        { ipAddress: { contains: query.search, mode: "insensitive" } },
        { userAgent: { contains: query.search, mode: "insensitive" } },
        { user: { name: { contains: query.search, mode: "insensitive" } } },
        { user: { email: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id:    true,
              name:  true,
              email: true,
              image: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
