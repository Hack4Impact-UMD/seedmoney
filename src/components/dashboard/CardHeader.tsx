export function CardHeader({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-gray-700 font-medium">{label}</p>
      <span className="text-gray-400">{icon}</span>
    </div>
  );
}
