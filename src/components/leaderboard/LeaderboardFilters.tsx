import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { LeaderboardSort } from "@/src/types/frontend/leaderboard";
import leaderboardTypography from "./leaderboardTypography.module.css";

type LeaderboardFiltersProps = {
  gardenCategories: string[];
  searchQuery: string;
  selectedGarden: string;
  selectedSort: LeaderboardSort;
  onSearchChange: (value: string) => void;
  onGardenChange: (value: string) => void;
  onSortChange: (value: LeaderboardSort) => void;
};

const SORT_LABELS: Record<Exclude<LeaderboardSort, "grantStat">, string> = {
  mostRaised: "Most Raised",
  leastRaised: "Least Raised",
  mostDonors: "Most Donors",
};

export default function LeaderboardFilters({
  gardenCategories,
  searchQuery,
  selectedGarden,
  selectedSort,
  onSearchChange,
  onGardenChange,
  onSortChange,
}: LeaderboardFiltersProps) {
  return (
    <section className="bg-[#123A1E] px-6 pb-8 md:px-10 lg:px-16">
      <div className="mx-auto flex max-w-[1728px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex h-12 w-full items-center rounded-full border border-[#D8D7D2] bg-white px-4 text-[#666666] lg:max-w-[495px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search value by campaign"
            className={`${leaderboardTypography.openSans} w-full bg-transparent text-[16px] outline-none placeholder:text-[#777777]`}
          />
          <SearchIcon className="text-[#1B1B1B]" fontSize="small" />
        </label>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-3">
            {Object.entries(SORT_LABELS).map(([sortValue, label]) => {
              const isSelected = selectedSort === sortValue;

              return (
                <button
                  key={sortValue}
                  type="button"
                  onClick={() =>
                    onSortChange(
                      sortValue as Exclude<LeaderboardSort, "grantStat">,
                    )
                  }
                  className={[
                    leaderboardTypography.openSans,
                    "h-[37px] rounded-full border px-5 text-[16px] font-semibold transition-colors",
                    isSelected
                      ? "border-[#55BD61] bg-[#55BD61] text-[#132B18]"
                      : "border-white/20 bg-transparent text-white hover:border-[#55BD61]/60 hover:text-white",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}

            <button
              type="button"
              disabled
              className={`${leaderboardTypography.openSans} h-[37px] rounded-full border border-white/15 bg-white/5 px-5 text-[16px] font-semibold text-white/45`}
            >
              Grant Stat
            </button>
          </div>

          <label className="flex h-12 min-w-[250px] items-center rounded-full border border-[#D8D7D2] bg-white px-4 text-[#1B1B1B] md:min-w-[346px]">
            <select
              value={selectedGarden}
              onChange={(event) => onGardenChange(event.target.value)}
              className={`${leaderboardTypography.openSans} w-full appearance-none bg-transparent pr-8 text-[16px] outline-none`}
            >
              <option value="all">All Gardens</option>
              {gardenCategories.map((gardenCategory) => (
                <option key={gardenCategory} value={gardenCategory}>
                  {gardenCategory}
                </option>
              ))}
            </select>
            <KeyboardArrowDownIcon className="-ml-6 text-[#6B6B6B]" />
          </label>
        </div>
      </div>
    </section>
  );
}
