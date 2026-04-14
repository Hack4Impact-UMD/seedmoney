import type { ReactNode } from "react";

type SummaryCardProps = {
  label: string;
  value: string;
  icon?: ReactNode;
};

export default function SummaryCard({ label, value, icon }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg border border-1 border-[#e5e5e5] p-6 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-2">{label}</p>
        <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
      </div>
      {icon && (
        <div className="shrink-0 w-10 h-10 rounded-full bg-[#e8f5ec] text-[#2D7A45] flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  );
}
