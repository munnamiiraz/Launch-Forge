import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponce";
import { AiInsightsService } from "./ai-insights.service";

const getDashboardInsights = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const user = req.user as any;

  const result = await AiInsightsService.generateDashboardInsights(
    workspaceId as string,
    user.id
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "AI Dashboard insights generated successfully",
    data: result,
  });
});

export const AiInsightsController = {
  getDashboardInsights,
};
