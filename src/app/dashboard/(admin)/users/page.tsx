"use client";
import { useMemo, useState } from "react";
import Navbar from "@/src/components/Navbar";
import UsersTable from "@/src/components/UsersTable";
import useAllUsersWithCampaigns from "@/src/hooks/users/useAllUsersWithCampaigns";
import useAllCompetitions from "@/src/hooks/competition-metadata/useAllCompetitions";

export default function Users() {
  const { data: usersTableRows = [], isLoading: isLoadingUsers } = useAllUsersWithCampaigns();
  const { data: competitions = [], isLoading: isLoadingCompetitions } = useAllCompetitions();


  const competitionYearMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const comp of competitions) {
      map.set(comp.competition_id, new Date(comp.start_date).getFullYear());
    }
    return map;
  }, [competitions]);

  const availableYears = useMemo(() => {
    const years = new Set(competitionYearMap.values());
    return Array.from(years).sort((a, b) => b - a);
  }, [competitionYearMap]);

  const currentCompetition = competitions.find((c) => c.is_current);
  const currentYear = currentCompetition
    ? new Date(currentCompetition.start_date).getFullYear()
    : new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const activeYear = selectedYear ?? currentYear;

  const isLoading = isLoadingUsers || isLoadingCompetitions;

  return (
    <div className="flex min-h-screen bg-[#fbfcfb]">
      <Navbar />
      <div className="flex-1 bg-gray-50 px-4 py-6 md:p-10">
        <div className="md:hidden">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-[40px] font-bold leading-[1.05] text-[#123A1E]">
              List of Users
            </h3>

            <div className="relative shrink-0">
              <label className="absolute -top-2.5 left-4 bg-gray-50 px-1 text-xs text-gray-500">
                Year
              </label>
              <select
                value={activeYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-14 min-w-[190px] cursor-pointer appearance-none rounded-[10px] border border-[#C8D0C8] bg-white px-4 pr-10 text-[16px] text-[#1f2320] outline-none shadow-[0_4px_10px_rgba(31,60,44,0.08)]"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <h3 className="text-4xl font-bold text-[#096B2E]">List of Users</h3>
          <div className="mx-6 h-10 w-px border border-[#1A4A28]" />
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Select year to view:</span>
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-gray-50 px-1 text-xs text-gray-400">
                Year
              </label>
              <select
                value={activeYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-8 text-gray-700 outline-none"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-6">
          {isLoading ? (
            <div className="text-center text-gray-500 py-10">
              Loading users…
            </div>
          ) : (
            <UsersTable
              initialData={usersTableRows}
              competitionYearMap={competitionYearMap}
              selectedYear={activeYear}
              currentYear={currentYear}
            />
          )}
        </div>
      </div>
    </div>
  );
}
