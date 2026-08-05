export default function ProductPreview() {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-2xl w-64">
      <div className="h-40 rounded-2xl bg-slate-200"></div>

      <p className="mt-4 text-xs uppercase text-slate-400">
        Home & Living
      </p>

      <h3 className="mt-1 font-semibold text-lg">
        Minimal Desk Lamp
      </h3>

      <p className="mt-2 text-2xl font-bold">
        $64
      </p>
    </div>
  );
}