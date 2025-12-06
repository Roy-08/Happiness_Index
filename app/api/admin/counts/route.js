import mongoose from "mongoose";
import Assessment from "@/models/Assessment";

export async function GET() {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const totalUsers = await Assessment.countDocuments();

    const categoryCounts = await Assessment.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = { totalUsers };

    categoryCounts.forEach((c) => {
      counts[c._id] = c.count;
    });

    const categories = ["luminary", "creator", "innovator", "prodigy", "seeker"];
    categories.forEach((cat) => {
      if (!counts[cat]) counts[cat] = 0;
    });

    return new Response(JSON.stringify(counts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message,
      totalUsers: 0,
      luminary: 0,
      creator: 0,
      innovator: 0,
      prodigy: 0,
      seeker: 0,
    }), { status: 500 });
  }
}
