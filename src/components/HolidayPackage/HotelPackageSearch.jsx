// HotelPackageSearch.jsx
import { useMemo, useState } from "react";
import {
  FiSearch,
  FiMapPin,
  FiClock,
  FiAirplane,
  FiExternalLink,
} from "react-icons/fi";
import { searchFlights } from "../Flights/searchFlightsApi";
import {
  searchHotelsByQuery,
  getHotelRates,
  prebookOffer,
} from "../Hotel/hotelSearchApi";

function nightsBetween(checkin, checkout) {
  try {
    const a = new Date(checkin);
    const b = new Date(checkout);
    const n = Math.round((b - a) / (1000 * 60 * 60 * 24));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

// Very flexible image extractor (Worldota payloads vary)
function pickHotelImage(rawItem) {
  const h = rawItem?.hotel || rawItem;
  const images =
    h?.images || h?.image_urls || rawItem?.images || rawItem?.image_urls || [];

  if (Array.isArray(images) && images.length) {
    const first = images[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.urls?.[0]) return first.urls[0];
    if (first?.link) return first.link;
  }

  const groups = h?.image_groups || rawItem?.image_groups;
  if (Array.isArray(groups) && groups[0]?.images?.length) {
    const im = groups[0].images[0];
    return im?.url || im?.link || (im?.urls && im.urls[0]) || null;
  }

  // Fallback placeholder
  return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop";
}

function firstRoomName(rawItem) {
  const offer = rawItem?.offers?.[0] || null;
  return (
    offer?.room?.name ||
    offer?.room_name ||
    offer?.name ||
    "Double or Twin Standard"
  );
}

function firstOfferId(rawItem) {
  const offer = rawItem?.offers?.[0] || null;
  return offer?.offer_id || offer?.id || null;
}

function hotelCoords(rawItem) {
  const h = rawItem?.hotel || rawItem;
  return { lat: h?.location?.lat, lng: h?.location?.lng };
}

function mapsLinkFor(hotelName, rawItem, city = "") {
  const { lat, lng } = hotelCoords(rawItem);
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const q = encodeURIComponent(`${hotelName || ""} ${city || ""}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q || "hotel"}`;
}

export default function HotelPackageSearch() {
  const [form, setForm] = useState({
    destination_query: "", // placeholder only
    checkin: "", // placeholder only
    nights: "", // placeholder only
    adults: "", // placeholder only
    // Optional flight pairing (enter IATAs)
    depart_iata: "", // placeholder only
    arrive_iata: "", // placeholder only
    cabin_class: "economy",
  });

  const checkout = useMemo(() => {
    if (!form.checkin || !form.nights) return "";
    const dt = new Date(form.checkin);
    const n = Number(form.nights);
    if (!Number.isFinite(n) || n < 1) return "";
    dt.setDate(dt.getDate() + n);
    return dt.toISOString().slice(0, 10);
  }, [form.checkin, form.nights]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [region, setRegion] = useState(null);
  const [hotels, setHotels] = useState([]); // normalized
  const [rawItems, setRawItems] = useState([]); // raw from API
  const [hpCache, setHpCache] = useState({}); // id|hid -> hp payload
  const [flightCache, setFlightCache] = useState({}); // hotelId -> flight offer

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSearch(e) {
    e?.preventDefault?.();
    setError("");
    setLoading(true);
    setHotels([]);
    setRawItems([]);
    setRegion(null);
    setHpCache({});
    setFlightCache({});

    // Basic validation (placeholders mean user must fill)
    if (
      !form.destination_query ||
      !form.checkin ||
      !form.nights ||
      !form.adults
    ) {
      setLoading(false);
      setError("Please enter destination, check-in, nights, and adults.");
      return;
    }

    try {
      const {
        region,
        hotels: list,
        raw,
      } = await searchHotelsByQuery({
        query: form.destination_query,
        checkin: form.checkin,
        checkout,
        adults: Number(form.adults),
        currency: "EUR",
        residency: "gb",
        language: "en",
        hotels_limit: 60,
      });
      setRegion(region);
      setHotels(list);
      setRawItems(raw?.data?.hotels || raw?.data?.items || []);
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRates(h) {
    try {
      const hp = await getHotelRates({
        id: h.id,
        hid: h.hid,
        checkin: form.checkin,
        checkout,
        adults: Number(form.adults || 1),
        currency: "EUR",
        residency: "gb",
        language: "en",
      });
      setHpCache((m) => ({ ...m, [h.id || h.hid]: hp }));
    } catch (e) {
      alert("Could not load rates: " + (e?.message || e));
    }
  }

  async function fetchFlight(h) {
    if (!form.depart_iata || !form.arrive_iata) {
      alert("Enter Depart IATA and Arrive IATA to fetch flights.");
      return;
    }
    try {
      const results = await searchFlights({
        origin: form.depart_iata,
        destination: form.arrive_iata,
        departure_date: form.checkin,
        adults: Number(form.adults || 1),
        cabin_class: form.cabin_class || "economy",
      });
      const direct = results.find((o) =>
        (o.slices || []).every((s) => (s?.segments?.length || 0) === 1)
      );
      const chosen = direct || results[0] || null;
      setFlightCache((m) => ({ ...m, [h.id || h.hid]: chosen }));
    } catch (e) {
      alert("Flight search failed: " + (e.message || e));
    }
  }

  const dateRangeText =
    form.checkin && checkout
      ? `${new Date(form.checkin).toLocaleDateString()} – ${checkout}`
      : "Select dates";

  const nightsText = (() => {
    const n = Number(form.nights);
    if (!Number.isFinite(n) || n < 1) return "—";
    return `${n} night${n > 1 ? "s" : ""}`;
  })();

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <h2 className="text-center text-white/90 text-2xl md:text-3xl font-bold drop-shadow-sm">
        Build Your Weekend Package
      </h2>

      {/* Form row */}
      <form
        onSubmit={onSearch}
        className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3"
      >
        <input
          name="destination_query"
          value={form.destination_query}
          onChange={onChange}
          placeholder="City (e.g., Reykjavik, Ibiza, Mykonos)"
          className="flex-1 min-w-[180px] rounded-xl bg-white/90 text-sm text-slate-900 placeholder-slate-500 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          type="date"
          name="checkin"
          value={form.checkin}
          onChange={onChange}
          placeholder="YYYY-MM-DD"
          className="w-[160px] rounded-xl bg-white/90 text-sm text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          type="number"
          min="1"
          name="nights"
          value={form.nights}
          onChange={onChange}
          className="w-[120px] rounded-xl bg-white/90 text-sm text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Nights (e.g., 5)"
        />
        <input
          type="number"
          min="1"
          name="adults"
          value={form.adults}
          onChange={onChange}
          className="w-[120px] rounded-xl bg-white/90 text-sm text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Adults (e.g., 2)"
        />

        {/* Optional flight pairing */}
        <input
          name="depart_iata"
          value={form.depart_iata}
          onChange={onChange}
          placeholder="Depart IATA (e.g., LGW)"
          className="w-[160px] rounded-xl bg-white/90 text-sm text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          name="arrive_iata"
          value={form.arrive_iata}
          onChange={onChange}
          placeholder="Arrive IATA (e.g., KEF)"
          className="w-[160px] rounded-xl bg-white/90 text-sm text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-sky-400 to-sky-600 px-3 py-2 text-white hover:brightness-110 transition disabled:opacity-60"
        >
          <FiSearch className={loading ? "animate-pulse" : ""} />
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* error */}
      {error && (
        <div className="mt-3 rounded-xl border border-red-400/40 bg-red-500/15 text-red-100 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* results */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {!loading && hotels.length === 0 && !error && (
          <div className="col-span-full text-center text-white/70 text-sm">
            Enter your details above to see hotels.
          </div>
        )}

        {hotels.map((h, idx) => {
          const raw =
            rawItems[idx] ||
            rawItems.find((it) => (it?.hotel?.id || it?.id) === h.id) ||
            {};
          const img = pickHotelImage(raw);
          const room = firstRoomName(raw);
          const offerId = firstOfferId(raw);
          const mapUrl = mapsLinkFor(
            h.name,
            raw,
            region?.name || form.destination_query || ""
          );
          const reviews = raw?.hotel?.reviews_count || raw?.reviews_count || 0;

          const hp = hpCache[h.id] || null;
          const flight = flightCache[h.id] || null;

          return (
            <div
              key={h.id}
              className="rounded-2xl overflow-hidden border border-white/15 bg-white/10 backdrop-blur-md text-white"
            >
              {/* Image */}
              <div className="relative h-48 w-full bg-black/20">
                <img
                  src={img}
                  alt={h.name || "Hotel"}
                  className="object-cover w-full h-full opacity-95"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs">
                  <FiMapPin />{" "}
                  <a href={mapUrl} target="_blank" rel="noreferrer">
                    View in Map
                  </a>
                </div>
              </div>

              <div className="p-3">
                {/* Header: name + price */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">
                      {h.name || "Hotel name"}
                    </div>
                    <div className="text-white/80 text-xs">
                      in{" "}
                      {region?.name || form.destination_query || "Destination"}
                    </div>
                  </div>
                  <div className="text-right">
                    {h.price_total ? (
                      <div className="text-base font-bold">
                        {h.price_total} {h.price_currency}
                      </div>
                    ) : (
                      <div className="text-sm text-white/70">See rates</div>
                    )}
                    <div className="text-[11px] text-white/70">
                      for {form.adults || "—"} adult(s)
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <div className="inline-flex items-center gap-1">
                    <FiClock />
                    {dateRangeText} • {nightsText}
                  </div>
                  <div className="inline-flex items-center gap-1">
                    {reviews ? `${reviews} Reviews` : "New / unrated"}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-emerald-200">
                    Transfers included
                  </span>
                </div>

                {/* Room + actions */}
                <div className="mt-3 text-sm">
                  <div className="text-white/90">
                    <span className="font-semibold">{room}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => fetchRates(h)}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold hover:bg-white/20 transition text-xs"
                    >
                      See other dates & prices
                    </button>

                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 hover:bg-white/20 transition text-xs"
                    >
                      View in Map <FiExternalLink />
                    </a>

                    <button
                      onClick={() => fetchFlight(h)}
                      className="inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1 hover:bg-sky-500/25 transition text-xs"
                      title="Fetch a direct or cheapest flight"
                    >
                      Airplane  
                    </button>
                  </div>

                  {/* Flight summary */}
                  {flight && (
                    <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-2 text-xs">
                      <div className="font-semibold mb-1">
                        {flight.owner?.name ||
                          flight.owner?.iata_code ||
                          "Airline"}
                      </div>
                      {(flight.slices || []).map((s, i) => (
                        <div key={i} className="mb-1">
                          {s.origin?.iata_code} → {s.destination?.iata_code}{" "}
                          {s.segments?.length === 1
                            ? "• Direct"
                            : `• ${s.segments?.length - 1} stop(s)`}
                        </div>
                      ))}
                      <div className="mt-1 font-semibold">
                        {flight.total_amount} {flight.total_currency}
                      </div>
                    </div>
                  )}

                  {/* HP preview */}
                  {hp && (
                    <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-2 text-xs">
                      <div className="font-semibold mb-1">Sample rate</div>
                      {hp.offers?.[0] ? (
                        <div className="flex items-center justify-between">
                          <div>
                            {hp.offers[0].room?.name ||
                              hp.offers[0].room_name ||
                              "Room"}
                            {" — "}
                            {hp.offers[0].meal?.name ||
                              hp.offers[0].board_name ||
                              "Board"}
                          </div>
                          <div className="font-semibold">
                            {(hp.offers[0].price?.total ||
                              hp.offers[0].price?.gross ||
                              hp.offers[0].amount) ??
                              ""}{" "}
                            {hp.offers[0].price?.currency ||
                              hp.offers[0].price?.ccy ||
                              ""}
                          </div>
                        </div>
                      ) : (
                        <div>No rate parsed</div>
                      )}

                      {/* Prebook first offer */}
                      {hp.offers?.[0] && (
                        <button
                          className="mt-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 hover:bg-emerald-500/25 transition"
                          onClick={async () => {
                            try {
                              const oid =
                                hp.offers[0].offer_id ||
                                hp.offers[0].id ||
                                offerId;
                              const hold = await prebookOffer(oid);
                              alert("Prebook OK");
                              console.log("Prebook:", hold);
                            } catch (e) {
                              alert("Prebook failed: " + (e.message || e));
                            }
                          }}
                        >
                          Lock this price (Prebook)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional: autoload on mount
      useEffect(() => { onSearch(); }, []);
      */}
    </div>
  );
}
