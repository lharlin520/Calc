export default function GasMeterUpgradeCalculator() {
  const React = window.React;
  const { useMemo, useState } = React;

  const meterOptions = {
    AC: [
      { id: "250-275", shortLabel: "250–275", maxBTU: 400000 },
      { id: "415-425", shortLabel: "415–425", maxBTU: 630000 },
      { id: "630", shortLabel: "630", maxBTU: 924000 },
    ],
    LC: [
      { id: "250-275", shortLabel: "250–275", maxBTU: 600000 },
      { id: "415-425", shortLabel: "415–425", maxBTU: 900000 },
      { id: "630", shortLabel: "630", maxBTU: 1300000 },
    ],
  };

  const applianceCatalog = [
    { key: "gen14", name: "14kW Generator", btu: 230000 },
    { key: "gen18", name: "18kW Generator", btu: 300000 },
    { key: "gen22", name: "22kW Generator", btu: 360000 },
    { key: "gen24", name: "24kW Generator", btu: 390000 },
    { key: "gen26", name: "26kW Generator", btu: 420000 },
    { key: "pool_heater", name: "Pool Heater", btu: 400000 },
    { key: "central_heat", name: "Central Heat", btu: 100000 },
    { key: "water_heater", name: "Tanked Water Heater", btu: 50000 },
    { key: "cooktop", name: "Cooktop", btu: 50000 },
    { key: "fireplace", name: "Fireplace", btu: 40000 },
    { key: "grill", name: "Grill", btu: 30000 },
    { key: "oven", name: "Oven", btu: 20000 },
    { key: "dryer", name: "Dryer", btu: 20000 },
  ];

  const makeInitialCounts = () =>
    applianceCatalog.reduce((acc, item) => {
      acc[item.key] = 0;
      return acc;
    }, {});

  const [meterClass, setMeterClass] = useState("AC");
  const [selectedMeterId, setSelectedMeterId] = useState("415-425");
  const [counts, setCounts] = useState(makeInitialCounts);

  const activeMeterOptions = meterOptions[meterClass] || meterOptions.AC;
  const selectedMeter = activeMeterOptions.find((m) => m.id === selectedMeterId) || activeMeterOptions[0];

  const result = useMemo(() => {
    const lineItems = applianceCatalog
      .map((item) => {
        const qty = Number(counts[item.key] || 0);
        const total = qty * item.btu;
        return { ...item, qty, total };
      })
      .filter((item) => item.qty > 0);

    const totalLoad = lineItems.reduce((sum, item) => sum + item.total, 0);
    const remaining = selectedMeter.maxBTU - totalLoad;
    const percentUsed = selectedMeter.maxBTU > 0 ? (totalLoad / selectedMeter.maxBTU) * 100 : 0;
    const overloaded = totalLoad > selectedMeter.maxBTU;

    return {
      lineItems,
      totalLoad,
      remaining,
      percentUsed,
      overloaded,
    };
  }, [counts, selectedMeter]);

  const setQty = (key, value) => {
    const cleaned = Math.max(0, Number(value || 0));
    setCounts((prev) => ({ ...prev, [key]: cleaned }));
  };

  const resetAll = () => setCounts(makeInitialCounts());

  const handleMeterClassChange = (nextClass) => {
    setMeterClass(nextClass);
    setSelectedMeterId("415-425");
  };

  const fmt = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(n || 0));

  const inputClass =
    "w-full rounded-2xl border border-slate-300 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-slate-400";
  const cardClass = "rounded-2xl bg-white p-4 shadow-sm border border-slate-200";

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-6">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Simplified Field Tool
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight">
            Gas Meter Load Calculator
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Select the meter type, enter how many of each gas appliance the home has, and the calculator totals the BTU load against the selected meter capacity.
          </p>
        </div>

        <div className={cardClass}>
          <div className="mb-2 block text-sm font-medium text-slate-700">Meter Sizing Type</div>
          <div className="grid grid-cols-2 gap-3">
            {["AC", "LC"].map((type) => {
              const active = meterClass === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleMeterClassChange(type)}
                  className={`rounded-2xl border px-4 py-3 text-base font-semibold shadow-sm ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          <label className="mb-2 mt-4 block text-sm font-medium text-slate-700">Gas Meter Size</label>
          <div className="grid grid-cols-3 gap-3">
            {activeMeterOptions.map((option) => {
              const active = selectedMeterId === option.id;
              return (
                <button
                  key={`${meterClass}-${option.id}`}
                  type="button"
                  onClick={() => setSelectedMeterId(option.id)}
                  className={`rounded-2xl border px-3 py-3 text-center text-base font-semibold shadow-sm ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {option.shortLabel}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {meterClass} sizing selected. Current max meter load: {fmt(selectedMeter.maxBTU)} BTU.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Appliance Counts</div>
              <div className="text-xs text-slate-500">Enter quantity for each connected gas load.</div>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3">
            {applianceCatalog.map((item) => (
              <div key={item.key} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{fmt(item.btu)} BTU each</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Qty</div>
                    <div className="text-lg font-bold text-slate-900">{counts[item.key]}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-[56px_1fr_56px] gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(item.key, Math.max(0, Number(counts[item.key] || 0) - 1))}
                    className="rounded-2xl border border-slate-300 bg-white px-3 py-3 text-2xl font-bold text-slate-700 shadow-sm active:scale-[0.98]"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={`${inputClass} text-center font-semibold`}
                    value={counts[item.key]}
                    onChange={(e) => setQty(item.key, e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setQty(item.key, Number(counts[item.key] || 0) + 1)}
                    className="rounded-2xl border border-slate-300 bg-white px-3 py-3 text-2xl font-bold text-slate-700 shadow-sm active:scale-[0.98]"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-3xl p-5 shadow-lg ${result.overloaded ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
            Result
          </div>
          <div className="mt-2 text-2xl font-bold">
            Max Meter Load: {fmt(selectedMeter.maxBTU)} BTU
          </div>
          <div className="mt-2 text-base font-semibold">
            Total Connected Load: {fmt(result.totalLoad)} BTU
          </div>
          <div className="mt-2 text-sm opacity-90">
            {result.overloaded
              ? `Over meter capacity by ${fmt(Math.abs(result.remaining))} BTU`
              : `Remaining capacity: ${fmt(result.remaining)} BTU`}
          </div>
          <div className="mt-1 text-sm opacity-90">
            Meter utilization: {result.percentUsed.toFixed(1)}%
          </div>
        </div>

        <div className={cardClass}>
          <div className="text-sm font-semibold text-slate-900">Selected Load Breakdown</div>
          {result.lineItems.length === 0 ? (
            <div className="mt-2 text-sm text-slate-500">No appliances added yet.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {result.lineItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                  <div className="text-sm text-slate-700">
                    {item.name} × {item.qty}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{fmt(item.total)} BTU</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
          This version is intentionally simplified for phone use. It screens total connected BTU load against the selected gas meter type using the appliance and meter values from your sheet.
        </div>
      </div>
    </div>
  );
}
