// GlacierApp.jsx — single-file React mock (no external UI libs)
import React, { useMemo, useState } from "react";

/* ----- minimal styles (scoped via a wrapper class) ----- */
const styles = `
.glacier * { box-sizing: border-box; }
.glacier { --bg:#f6fbff; --card:#fff; --text:#0f172a; --muted:#64748b; --border:#e2e8f0; --brand:#0ea5e9; --brand-2:#0369a1; }
.glacier { min-height: 100vh; background: linear-gradient(#fff, var(--bg)); color: var(--text); font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
.glacier .container { max-width: 1080px; margin: 0 auto; padding: 16px; }
.glacier .header { position: sticky; top: 0; z-index: 10; backdrop-filter: blur(8px); background: rgba(255,255,255,.75); border-bottom: 1px solid var(--border); }
.glacier .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: -0.02em; }
.glacier .badge { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: #e2f2ff; color: #044e7c; }
.glacier .nav { display: none; gap: 18px; font-size: 14px; }
@media (min-width: 800px){ .glacier .nav{ display:flex } }
.glacier .nav button { background: transparent; border: 0; cursor: pointer; color: var(--text); }
.glacier .nav button:hover { text-decoration: underline; }

.glacier .grid { display: grid; gap: 20px; }
@media (min-width: 900px){ .glacier .grid-2{ grid-template-columns: 1.2fr 1fr } }
@media (min-width: 900px){ .glacier .grid-3{ grid-template-columns: repeat(3,1fr) } }

.glacier .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 2px 8px rgba(2,6,23,.04); }
.glacier .card-head { padding: 16px 18px; border-bottom: 1px solid var(--border); font-weight: 600; }
.glacier .card-body { padding: 16px 18px; }

.glacier h1 { font-size: clamp(28px, 4vw, 48px); line-height: 1.1; margin: 0; }
.glacier p.muted { color: var(--muted); margin: 8px 0 0; }
.glacier .row { display: flex; gap: 10px; align-items: center; }
.glacier .wrap { flex-wrap: wrap; }
.glacier .pill { display:inline-flex; align-items:center; gap:6px; font-size: 13px; color: var(--muted); }

.glacier .btn { appearance: none; border: 0; border-radius: 14px; padding: 12px 16px; font-weight: 600; cursor: pointer; }
.glacier .btn.primary { background: var(--brand); color: #fff; }
.glacier .btn.primary:hover { background: var(--brand-2); }
.glacier .btn.ghost { background: #fff; border:1px solid var(--border); }
.glacier .btn.ghost:hover { background: #f8fafc; }

.glacier .field { display: grid; gap: 6px; }
.glacier label { font-size: 13px; color: var(--muted); }
.glacier input, .glacier select { width: 100%; padding: 12px 12px; border:1px solid var(--border); border-radius: 12px; font-size: 14px; }
.glacier input[type=\"number\"] { -moz-appearance: textfield; }
.glacier input::-webkit-outer-spin-button, .glacier input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.glacier .price { font-size: 20px; font-weight: 700; }
.glacier .list { display: grid; gap: 14px; }
.glacier .item { border:1px solid var(--border); border-radius: 14px; padding: 14px; }
.glacier .item h3 { margin: 0 0 6px; font-size: 16px; }
.glacier .item .meta { display:flex; justify-content:space-between; align-items:center; font-size: 14px; color: var(--muted); }

.glacier .tabs { display: grid; gap: 8px; }
.glacier .tabbar { display:grid; grid-template-columns: repeat(3,1fr); gap:6px; }
.glacier .tabbar button { border:1px solid var(--border); background:#fff; padding:10px 12px; border-radius:12px; font-weight:600; cursor:pointer; }
.glacier .tabbar button[aria-selected=\"true\"]{ background:#eef7ff; border-color:#bfe4ff; }

.glacier .status { font-size: 12px; padding:4px 8px; border-radius: 999px; background:#ecfeff; color:#155e75; }
.glacier .footer { border-top:1px solid var(--border); margin-top: 28px; }
.glacier .footer .inner { display:flex; flex-direction:column; gap:10px; align-items:center; justify-content:space-between; padding:18px; color: var(--muted); }
@media (min-width:800px){ .glacier .footer .inner{ flex-direction:row } }
`;

/* ----- fake data ----- */
const BASES = [
  { id: "REK", name: "Reykjavík (REK)" },
  { id: "AEY", name: "Akureyri (AEY)" },
  { id: "VIK", name: "Vík (VIK)" },
];

const EXPERIENCES = [
  {
    id: "glacier",
    name: "Glacier Landing",
    minutes: 45,
    blurb: "Land atop pristine icefields.",
    price: 349,
  },
  {
    id: "volcano",
    name: "Volcano Overflight",
    minutes: 35,
    blurb: "Circle active fissures safely.",
    price: 299,
  },
  {
    id: "coast",
    name: "South Coast Special",
    minutes: 60,
    blurb: "Black sands, waterfalls, cliffs.",
    price: 389,
  },
];

const SLOTS = ["09:00", "11:30", "14:15", "16:45"];

/* ----- helpers ----- */
const money = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(
    n
  );

/* ----- subcomponents (all in-file) ----- */
function Header({ onNav }) {
  return (
    <div className="header">
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
        }}
      >
        <div className="brand">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "#e0f2fe",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
            }}
          >
            ❄️
          </div>
          <span>GlacierApp</span>
          <span className="badge">beta</span>
        </div>
        <div className="nav">
          <button onClick={() => onNav("home")}>Home</button>
          <button onClick={() => onNav("discover")}>Discover</button>
          <button onClick={() => onNav("book")}>Book</button>
          <button onClick={() => onNav("manage")}>Manage</button>
        </div>
      </div>
    </div>
  );
}

function QuickQuote() {
  const [base, setBase] = useState("REK");
  const [exp, setExp] = useState("glacier");
  const [pax, setPax] = useState(2);
  const price = useMemo(() => {
    const p = EXPERIENCES.find((e) => e.id === exp)?.price ?? 0;
    return p * (Number.isFinite(pax) ? pax : 0);
  }, [exp, pax]);

  return (
    <div className="list" aria-label="Quick quote form">
      <div className="field">
        <label htmlFor="qq-base">Base</label>
        <select
          id="qq-base"
          value={base}
          onChange={(e) => setBase(e.target.value)}
        >
          {BASES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="qq-exp">Experience</label>
        <select
          id="qq-exp"
          value={exp}
          onChange={(e) => setExp(e.target.value)}
        >
          {EXPERIENCES.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} · {e.minutes}m
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="qq-pax">Passengers</label>
        <input
          id="qq-pax"
          type="number"
          min={1}
          max={6}
          value={pax}
          onChange={(e) => setPax(parseInt(e.target.value || "1", 10))}
        />
      </div>

      <div
        className="row"
        style={{ justifyContent: "space-between", paddingTop: 6 }}
      >
        <span className="pill">Estimated total</span>
        <span className="price">{money(price)}</span>
      </div>

      <button className="btn primary" type="button">
        Continue to booking
      </button>
    </div>
  );
}

function Hero({ onStart }) {
  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 28 }}>
      <div className="grid grid-2">
        <div>
          <h1>
            Helicopter adventures across Iceland — book in under a minute.
          </h1>
          <p className="muted">
            Real-time seats, weather-aware scheduling, and instant vouchers.
            Built for Glacier Heli / Glacier Ventures.
          </p>
          <div className="row wrap" style={{ marginTop: 16 }}>
            <button className="btn primary" onClick={onStart}>
              Start booking
            </button>
            <button className="btn ghost" type="button">
              Watch demo
            </button>
          </div>
          <div className="row wrap" style={{ gap: 16, marginTop: 12 }}>
            <span className="pill">✅ Secure checkout</span>
            <span className="pill">✅ Weather holds handled</span>
            <span className="pill">✅ Instant confirmations</span>
          </div>
        </div>

        <div className="card">
          <div className="card-head">Quick quote</div>
          <div className="card-body">
            <QuickQuote />
          </div>
        </div>
      </div>
    </div>
  );
}

function Discover() {
  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div className="grid grid-3">
        {EXPERIENCES.map((e) => (
          <div key={e.id} className="card">
            <div className="card-head">{e.name}</div>
            <div className="card-body">
              <p className="muted" style={{ marginTop: 0 }}>
                {e.blurb}
              </p>
              <div className="meta" style={{ marginTop: 10 }}>
                <span>{e.minutes} min</span>
                <strong>{money(e.price)}</strong>
              </div>
              <button
                className="btn ghost"
                type="button"
                style={{ marginTop: 12, width: "100%" }}
              >
                View details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Book() {
  const [base, setBase] = useState("REK");
  const [exp, setExp] = useState("glacier");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [pax, setPax] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState("card");

  const selected = EXPERIENCES.find((x) => x.id === exp);
  const total = (selected?.price ?? 0) * (Number.isFinite(pax) ? pax : 0);
  const canPay = base && exp && date && slot && name && email;

  return (
    <div
      className="container"
      style={{ paddingTop: 24, paddingBottom: 24, maxWidth: 840 }}
    >
      <div className="card">
        <div className="card-head">Book your seat</div>
        <div className="card-body">
          <div
            className="grid"
            style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div className="field">
              <label htmlFor="bk-base">Base</label>
              <select
                id="bk-base"
                value={base}
                onChange={(e) => setBase(e.target.value)}
              >
                {BASES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="bk-exp">Experience</label>
              <select
                id="bk-exp"
                value={exp}
                onChange={(e) => setExp(e.target.value)}
              >
                {EXPERIENCES.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name} · {x.minutes}m
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="bk-date">Date</label>
              <input
                id="bk-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="bk-slot">Time</label>
              <select
                id="bk-slot"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
              >
                <option value="" disabled>
                  Select time
                </option>
                {SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="bk-pax">Passengers</label>
              <input
                id="bk-pax"
                type="number"
                min={1}
                max={6}
                value={pax}
                onChange={(e) => setPax(parseInt(e.target.value || "1", 10))}
              />
            </div>
            <div className="field">
              <label>Estimated total</label>
              <div className="price">{money(total)}</div>
            </div>
          </div>

          <div
            className="grid"
            style={{ gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}
          >
            <div className="field">
              <label htmlFor="bk-name">Full name</label>
              <input
                id="bk-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="field">
              <label htmlFor="bk-email">Email</label>
              <input
                id="bk-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="tabs" style={{ marginTop: 12 }}>
            <div className="tabbar" role="tablist" aria-label="Payment method">
              {["card", "apple", "voucher"].map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t === "card"
                    ? "Card"
                    : t === "apple"
                    ? "Apple Pay"
                    : "Voucher"}
                </button>
              ))}
            </div>

            {tab === "card" && (
              <div
                className="grid"
                style={{ gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}
              >
                <div className="field">
                  <label>Card number</label>
                  <input placeholder="4242 4242 4242 4242" />
                </div>
                <div className="field">
                  <label>MM/YY</label>
                  <input placeholder="12/26" />
                </div>
                <div className="field">
                  <label>CVC</label>
                  <input placeholder="123" />
                </div>
              </div>
            )}
            {tab === "apple" && (
              <div className="item" style={{ marginTop: 6 }}>
                Apple Pay placeholder
              </div>
            )}
            {tab === "voucher" && (
              <div className="row" style={{ marginTop: 6 }}>
                <input placeholder="Voucher code" />
                <button className="btn ghost" type="button">
                  Apply
                </button>
              </div>
            )}
          </div>

          <button
            className="btn primary"
            disabled={!canPay}
            style={{ marginTop: 14 }}
            type="button"
          >
            Pay &amp; confirm
          </button>
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            By continuing you agree to our Terms &amp; Conditions and Weather
            Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Manage() {
  const [code, setCode] = useState("");
  const [found, setFound] = useState(false);

  return (
    <div
      className="container"
      style={{ paddingTop: 24, paddingBottom: 24, maxWidth: 720 }}
    >
      <div className="card">
        <div className="card-head">Manage booking</div>
        <div className="card-body">
          <div className="row">
            <input
              placeholder="Enter booking code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Booking code"
            />
            <button
              className="btn primary"
              disabled={!code}
              onClick={() => setFound(true)}
            >
              Find
            </button>
          </div>

          {found && (
            <div className="item" style={{ marginTop: 12 }}>
              <div className="meta">
                <div>
                  <div style={{ fontWeight: 700 }}>Volcano Overflight</div>
                  <div className="muted">Vík · 11:30 · 26 Nov 2025</div>
                </div>
                <span className="status">CONFIRMED</span>
              </div>
              <div className="row" style={{ gap: 8, marginTop: 10 }}>
                <button className="btn ghost">Change time</button>
                <button className="btn ghost">Cancel</button>
                <button className="btn primary">Download ticket</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----- root ----- */
export default function GlacierApp() {
  const [route, setRoute] = useState("home");

  return (
    <div className="glacier">
      <style>{styles}</style>

      <div className="header">
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
          }}
        >
          <div className="brand">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "#e0f2fe",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
              }}
            >
              ❄️
            </div>
            <span>GlacierApp</span>
            <span className="badge">beta</span>
          </div>
          <div className="nav">
            <button onClick={() => setRoute("home")}>Home</button>
            <button onClick={() => setRoute("discover")}>Discover</button>
            <button onClick={() => setRoute("book")}>Book</button>
            <button onClick={() => setRoute("manage")}>Manage</button>
          </div>
        </div>
      </div>

      {route === "home" && <Hero onStart={() => setRoute("book")} />}
      {route === "discover" && <Discover />}
      {route === "book" && <Book />}
      {route === "manage" && <Manage />}

      <div className="footer">
        <div className="container inner">
          <div>📍 Iceland • Glacier Ventures</div>
          <div>
            ➡️ MVP mock — replace with real APIs (inventory, weather, payments)
          </div>
        </div>
      </div>
    </div>
  );
}
