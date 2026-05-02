import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { CardHeader } from "./CardHeader";
import moment from "moment";

export function DaysRemainingCard({ startDate, endDate, is_current }: { startDate: string | null, endDate: string | null, is_current: boolean }) {
  function getDaysRemaining() {
    if (!is_current || !startDate || !endDate) {
      return null;
    }

    const today = moment().startOf("day");
    const start = moment(startDate);
    const end = moment(endDate);

    if (!start.isValid() || !end.isValid()) {
      return null;
    }

    if (!today.isAfter(start)) {
      return null;
    }

    const daysRemaining = end.diff(today, "days");

    if (Number.isNaN(daysRemaining)) {
      return null;
    }

    return Math.max(0, daysRemaining);
  }

  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] p-4 overflow-hidden">
      <CardHeader label="Days Remaining" icon={<TrendingUpIcon />} />
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 my-3">
        {daysRemaining ?? "—"}
      </h2>
      <p className="text-sm text-gray-500">days until campaign ends</p>
    </div>
  );
}
