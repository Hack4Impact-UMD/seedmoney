import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { CardHeader } from "./CardHeader";

export function TotalDonorsCard({
  totalDonors,
  donorsChangePercent,
}: {
  totalDonors: number;
  donorsChangePercent: number | null;
}) {
  return (
    <div className="bg-white rounded-lg border border-1 border-[#e5e5e5] p-6">
      <CardHeader label="Total Donors" icon={<PeopleOutlineIcon />} />
      <h2 className="text-3xl font-bold text-gray-900 my-3">{totalDonors}</h2>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Donors</p>
        <p
          className={`text-sm font-medium ${
            donorsChangePercent === null
              ? "text-gray-400"
              : donorsChangePercent < 0
                ? "text-[#D32F2F]"
                : "text-[#00A63E]"
          }`}
        >
          {donorsChangePercent === null
            ? "—% from last week"
            : `${donorsChangePercent > 0 ? "+" : ""}${donorsChangePercent}% from last week`}
        </p>
      </div>
    </div>
  );
}
