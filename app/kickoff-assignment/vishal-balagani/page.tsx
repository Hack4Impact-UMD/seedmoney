export default function VishalPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Vishal Balagani
          </h1>
          <p className="text-slate-600 mb-4">
            First-year Computer Science student at UMD
          </p>
          <p className="text-slate-700 leading-relaxed">
            Hi I'm Vishal, I am an engineer here on the SeedMoney team. Outside
            of school I enjoy cooking, photography, and hiking!
          </p>
        </div>
      </div>
    </div>
  );
}
