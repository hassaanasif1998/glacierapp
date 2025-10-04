// hotelSearchApi.js
// Frontend wrapper for your Node server hotel routes
// Works with the routes you exposed in server/server.js

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3001";

// ---- tiny helper
async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.error ||
      json?.errors?.[0]?.title ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

// ---- SERP shape helpers (be defensive about upstream shapes)
export function parseSerpItems(serp) {
  // common shapes:
  // { data: { hotels: [...] } }    // typical
  // { data: { items:  [...] } }    // some accounts
  // { hotels: [...] }              // (rare) forwarded inner
  // { items:  [...] }
  return (
    serp?.data?.hotels || serp?.data?.items || serp?.hotels || serp?.items || []
  );
}

export function normalizeHotels(serp) {
  const items = parseSerpItems(serp);
  return items.map((it) => {
    const h = it.hotel || it;
    const firstOffer = (it.offers && it.offers[0]) || null;
    const price = firstOffer?.price || firstOffer?.amount || {};
    const priceTotal = price.total || price.gross || price.value || null;
    const priceCurrency = price.currency || price.ccy || "";

    const lat = h?.location?.lat;
    const lng = h?.location?.lng;
    const mapUrl =
      lat != null && lng != null
        ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            h?.name || "Hotel"
          )}`;

    return {
      id: h.id,
      hid: h.hid,
      name: h.name,
      address: h?.address?.text || h?.address || "",
      lat,
      lng,
      mapUrl,
      price_total: priceTotal,
      price_currency: priceCurrency,
      first_offer_id: firstOffer?.offer_id || firstOffer?.id || null,
      raw: it,
    };
  });
}

// -----------------------------------------------
// 0) Multicomplete helper (get a City region_id)
// -----------------------------------------------
async function getRegionIdByQuery(query, language = "en") {
  const multi = await post("/api/hotels/multicomplete", { query, language });
  const city =
    (multi?.data?.regions || []).find((r) => r.type === "City") ||
    (multi?.data?.regions || [])[0];
  return { region: city || null, multi };
}

// -----------------------------------------------
// 1) Search by human query (e.g., "Reykjavik")
//    -> multicomplete (City region) → SERP
// -----------------------------------------------
export async function searchHotelsByQuery({
  query,
  checkin,
  checkout,
  adults = 2,
  currency = "EUR",
  residency = "gb",
  language = "en",
  hotels_limit = 200,
}) {
  if (!query) throw new Error("Destination query is required");

  const { region } = await getRegionIdByQuery(query, language);
  if (!region?.id) throw new Error(`No city region found for "${query}".`);

  const serp = await post("/api/hotels/serp/region", {
    region_id: region.id,
    checkin,
    checkout,
    guests: [{ adults }],
    residency,
    language,
    currency,
    hotels_limit,
  });

  return {
    region,
    items: parseSerpItems(serp), // raw SERP items (recommended for rendering)
    hotels: normalizeHotels(serp), // optional simplified list
    raw: serp, // keep full payload for debugging
  };
}

// -----------------------------------------------
// 2) Search by known region_id (skip multicomplete)
// -----------------------------------------------
export async function searchHotelsByRegion({
  region_id,
  checkin,
  checkout,
  adults = 2,
  currency = "EUR",
  residency = "gb",
  language = "en",
  hotels_limit = 200,
}) {
  if (!region_id) throw new Error("region_id is required");
  const serp = await post("/api/hotels/serp/region", {
    region_id,
    checkin,
    checkout,
    guests: [{ adults }],
    residency,
    language,
    currency,
    hotels_limit,
  });
  return {
    items: parseSerpItems(serp),
    hotels: normalizeHotels(serp),
    raw: serp,
  };
}

// -----------------------------------------------
// 3) HP (hotel page): deeper rates for 1 hotel
// -----------------------------------------------
export async function getHotelRates({
  id,
  hid,
  checkin,
  checkout,
  adults = 2,
  currency = "EUR",
  residency = "gb",
  language = "en",
}) {
  if (!id && !hid) throw new Error("Provide hotel id or hid");
  const hp = await post("/api/hotels/hp", {
    id,
    hid,
    checkin,
    checkout,
    guests: [{ adults }],
    residency,
    language,
    currency,
  });
  return hp?.data || hp;
}

// -----------------------------------------------
// 4) Prebook: lock price/availability for an offer
// -----------------------------------------------
export async function prebookOffer(offer_id) {
  if (!offer_id) throw new Error("offer_id is required");
  return post("/api/hotels/prebook", { offer_id });
}

// -----------------------------------------------
// 5) Rich content for one hotel
// -----------------------------------------------
export async function getHotelInfo({ id, hid, language = "en" }) {
  if (!id && !hid) throw new Error("Provide hotel id or hid");
  return post("/api/hotels/info", { id, hid, language });
}

// -----------------------------------------------
// 6) Full search (SERP + INFO, optional HP subset)
//    Use this when you want complete data merged
// -----------------------------------------------
export async function fullHotelSearchByRegion({
  region_id,
  checkin,
  checkout,
  adults = 2,
  currency = "EUR",
  residency = "gb",
  language = "en",
  hotels_limit = 30,
  include_hp = false,
  hp_limit = 1,
}) {
  if (!region_id) throw new Error("region_id is required");
  const payload = {
    region_id,
    checkin,
    checkout,
    guests: [{ adults }],
    residency,
    language,
    currency,
    hotels_limit,
    include_hp,
    hp_limit,
  };
  // shape: { status, meta, data: [{ serp_item, info, hp? }, ...] }
  return post("/api/hotels/full", payload);
}
