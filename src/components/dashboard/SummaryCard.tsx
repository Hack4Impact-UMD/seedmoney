type SummaryCardProps = {
  label: string;
  value: string;
};

export default function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg border border-1 border-[#e5e5e5] p-6">
      <p className="text-sm text-gray-500 font-medium mb-2">{label}</p>
      <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
    </div>
  );
}
