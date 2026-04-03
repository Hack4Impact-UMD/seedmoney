import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { CardHeader } from "./CardHeader";

export function DaysRemainingCard({ daysRemaining }: { daysRemaining: number }) {
  return (
    <div className="bg-white rounded-lg border border-1 border-[#e5e5e5] p-6">
      <CardHeader label="Days Remaining" icon={<TrendingUpIcon />} />
      <h2 className="text-3xl font-bold text-gray-900 my-3">{daysRemaining}</h2>
      <p className="text-sm text-gray-500">days until campaign ends</p>
    </div>
  );
}
