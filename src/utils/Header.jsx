import { useEffect, useState } from "react";
import Logo from "../assets/logo.webp";
// icons
import {
  MdFlight,
  MdHotel,
  MdDirectionsCar,
  MdBeachAccess,
} from "react-icons/md";

const NAV = [
  { name: "Flights", href: "#flights", Icon: MdFlight },
  { name: "Hotels", href: "#hotels", Icon: MdHotel },
  { name: "Car Rental", href: "#rental", Icon: MdDirectionsCar },
  { name: "Holidays", href: "#holidays", Icon: MdBeachAccess },
];

export function Header({ initialTab = "Flights" }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(
    NAV.find((x) => x.name === initialTab)?.name ?? NAV[0].name
  );

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16">
      {/* glassy backdrop */}
      <div className="absolute bg-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* LEFT: Logo */}
        <a
          href="/"
          className="flex items-center gap-3 text-white"
          aria-label="Glacier home"
        >
          <img
            src={Logo}
            alt="Glacier"
            className="h-8 sm:h-40 w-auto select-none"
            draggable="false"
            loading="eager"
            decoding="async"
          />
        </a>

        {/* CENTER: Desktop nav */}
        <nav className="hidden md:flex items-center gap-2" aria-label="Primary">
          {NAV.map(({ name, href, Icon }) => {
            const isActive = active === name;
            return (
              <a
                key={name}
                href={href}
                onClick={() => setActive(name)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-[6px] text-sm font-semibold transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  isActive
                    ? "border-transparent bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-sm"
                    : "border-white/25 bg-white/10 text-white hover:bg-white/20",
                ].join(" ")}
              >
                <Icon className="text-lg" aria-hidden="true" />
                <span>{name}</span>
              </a>
            );
          })}
        </nav>

        {/* RIGHT: Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-[6px] text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Change language"
          >
            <span className="text-base leading-none">🌐</span>
            <span>EN</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-full bg-gradient-to-b from-sky-400 to-sky-600 px-4 py-[6px] text-sm font-semibold text-white shadow-sm hover:brightness-110 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Sign in
          </button>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden inline-flex items-center rounded-full border border-white/25 bg-white/10 p-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="space-y-1">
            <span
              className={`block h-0.5 w-6 bg-white transition ${
                open ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition ${
                open ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile sheet */}
      <div
        className={`md:hidden fixed inset-0 top-16 z-40 bg-black/50 backdrop-blur-sm transition ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className="m-3 rounded-2xl border border-white/20 bg-slate-900/90 p-3 pt-[max(0px,env(safe-area-inset-top))]"
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="grid gap-2" aria-label="Mobile primary">
            {NAV.map(({ name, href, Icon }) => {
              const isActive = active === name;
              return (
                <a
                  key={name}
                  href={href}
                  onClick={() => {
                    setActive(name);
                    setOpen(false);
                  }}
                  className={[
                    "flex items-center gap-3 rounded-xl border px-4 py-3 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                    isActive
                      ? "border-transparent bg-gradient-to-b from-sky-400 to-sky-600 text-white"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20",
                  ].join(" ")}
                >
                  <Icon className="text-xl" aria-hidden="true" />
                  <span>{name}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="bg-white/10 px-4 py-3 text-white font-semibold hover:bg-white/20 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
              🌐 EN
            </button>
            <button className="rounded-xl bg-gradient-to-b from-sky-400 to-sky-600 px-4 py-3 text-white font-semibold hover:brightness-110 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
