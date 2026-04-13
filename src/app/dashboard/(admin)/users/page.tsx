"use client";
import { useMemo, useState } from "react";
import Navbar from "@/src/components/Navbar";
import UsersTable from "@/src/components/UsersTable";
import useAllUsersWithCampaigns from "@/src/hooks/users/useAllUsersWithCampaigns";
import useAllCompetitions from "@/src/hooks/competition-metadata/useAllCompetitions";

export default function Users() {
  const { data: usersTableRows = [], isLoading: isLoadingUsers } =
    useAllUsersWithCampaigns();
  const { data: competitions = [], isLoading: isLoadingCompetitions } =
    useAllCompetitions();

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
  const defaultYear = currentCompetition
    ? new Date(currentCompetition.start_date).getFullYear()
    : new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const activeYear = selectedYear ?? defaultYear;

  const isLoading = isLoadingUsers || isLoadingCompetitions;

  return (
    <div className="flex min-h-screen">
      <Navbar/>
      <div className="flex-1 bg-gray-50 p-10">
        <div className="flex items-center gap-4">
          <h3 className="text-4xl font-bold text-[#096B2E]">List of Users</h3>
          <div className="w-px mx-6 h-10 border border-[#1A4A28]" />
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Select year to view:</span>
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-gray-50 px-1 text-xs text-gray-400">
                Year
              </label>
              <select
                value={activeYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-gray-700 bg-white outline-none cursor-pointer appearance-none"
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
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center text-gray-500 py-10">
              Loading users…
            </div>
          ) : (
            <UsersTable
              initialData={usersTableRows}
              competitionYearMap={competitionYearMap}
              selectedYear={activeYear}
            />
          )}
        </div>
      </div>
    </div>
  );
}
