import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserAnalyticsWithChartService } from "@/lib/services/analytics";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { from, to } = req.query;

    const filter = {
      dateFrom: from ? new Date(from as string) : undefined,
      dateTo: to ? new Date(to as string) : undefined,
    };

    const result = await getUserAnalyticsWithChartService(session.user.id, filter);

    return res.status(200).json({
      message: "User analytics retrieved successfully",
      ...result,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
