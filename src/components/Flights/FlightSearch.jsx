import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { searchFlights } from "./searchFlightsApi";

export default function FlightSearch() {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    departure_date: "",
    adults: 1,
    cabin_class: "economy",
  });
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOffers([]);
    if (!form.origin || !form.destination || !form.departure_date) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      const results = await searchFlights(form);
      setOffers(results);
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3">
      <h2 className="text-center text-white/90 text-2xl md:text-3xl font-bold drop-shadow-sm">
        Find Your Flight
      </h2>

      {/* compact row form */}
      <form
        onSubmit={onSubmit}
        className="mt-4 flex flex-wrap items-center gap-2 p-8 rounded-full border border-white/15 bg-white/10 backdrop-blur-md p-2"
      >
        <input
          name="origin"
          value={form.origin}
          onChange={onChange}
          placeholder="From (LHR)"
          className="flex-1 min-w-[100px] rounded-full bg-white/90 text-sm text-slate-900 placeholder-slate-500 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          name="destination"
          value={form.destination}
          onChange={onChange}
          placeholder="To (JFK)"
          className="flex-1 min-w-[100px] rounded-full bg-white/90 text-sm text-slate-900 placeholder-slate-500 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          type="date"
          name="departure_date"
          value={form.departure_date}
          onChange={onChange}
          className="flex-1 min-w-[120px] rounded-full bg-white/90 text-sm text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          type="number"
          min="1"
          name="adults"
          value={form.adults}
          onChange={onChange}
          placeholder="Adults"
          className="w-20 rounded-full bg-white/90 text-sm text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />
        <select
          name="cabin_class"
          value={form.cabin_class}
          onChange={onChange}
          className="w-32 rounded-full bg-white/90 text-sm text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="economy">Economy</option>
          <option value="premium_economy">Premium</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>

        {/* small search button inline */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-b from-sky-400 to-sky-600 p-2 text-white hover:brightness-110 transition disabled:opacity-60"
        >
          <FiSearch className={`text-lg ${loading ? "animate-pulse" : ""}`} />
        </button>
      </form>

      {/* error */}
      {error && (
        <div className="mt-3 rounded-xl border border-red-400/40 bg-red-500/15 text-red-100 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* results */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {offers.length === 0 && !loading && !error && (
          <div className="col-span-full text-center text-white/70 text-sm">
            No flights yet — try searching.
          </div>
        )}

        {offers.map((o) => (
          <div
            key={o.id}
            className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-3 text-white text-sm"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                {o.owner?.name || o.owner?.iata_code || "Airline"}
              </div>
              <div className="text-base font-bold">
                {o.total_amount} {o.total_currency}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {(o.slices || []).map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs"
                >
                  {s.origin?.iata_code} → {s.destination?.iata_code}
                </span>
              ))}
            </div>

            {o.total_duration && (
              <div className="mt-1 text-xs text-white/80">
                Duration: {o.total_duration.replace("PT", "")}
              </div>
            )}

            <button className="mt-3 w-full rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold hover:bg-white/20 transition text-sm">
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
