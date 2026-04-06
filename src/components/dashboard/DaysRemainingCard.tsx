import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { CardHeader } from "./CardHeader";
import moment from "moment";

export function DaysRemainingCard({ startDate, endDate, is_current }: { startDate: string | null, endDate: string | null, is_current: boolean }) {
  function getDaysRemaining() {
    const today = moment().startOf("day");
    if (today.isAfter(moment(startDate)) && is_current) {
      const end = moment(endDate);
      return Math.max(0, end.diff(today, "days"));
    } else {
      return null;
    }
  }

  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-white rounded-lg border border-1 border-[#e5e5e5] p-6">
      <CardHeader label="Days Remaining" icon={<TrendingUpIcon />} />
      <h2 className="text-3xl font-bold text-gray-900 my-3">
        {daysRemaining ?? "—"}
      </h2>
      <p className="text-sm text-gray-500">days until campaign ends</p>
    </div>
  );
}