export function MetricCard({ title, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border border-[#f3ead0] hover:shadow-md transition-all">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className={`text-2xl font-bold mt-2 ${color}`}>
        {value}
      </h3>
    </div>
  );
}