"use client";
import Navbar from "@/src/components/Navbar";
import UsersTable from "@/src/components/UsersTable";
import { mockUsers } from "./mockUsersData";

export default function Users() {
  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={[]}
        selectedCampaignId={0}
        onCampaignSelect={() => {}}
      />
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
              <select className="border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-gray-700 bg-white outline-none cursor-pointer appearance-none">
                <option>2026</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <UsersTable initialData={mockUsers} />
        </div>
      </div>
    </div>
  );
}
