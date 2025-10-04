// simple wrapper for your server POST /api/offer-requests
export async function searchFlights(form) {
  const res = await fetch("http://localhost:3001/api/offer-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.errors?.[0]?.title || "Search failed");
  // Duffel returns { data: { offers: [...] } } for v2 after creating an offer_request.
  // If your server forwards the whole response, adapt here:
  return data?.data?.offers || data?.offers || [];
}
