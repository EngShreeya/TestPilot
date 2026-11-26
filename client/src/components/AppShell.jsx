import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { BrandMark } from "./BrandUI";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Websites", to: "/websites" },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isNavActive = (to) => {
    if (to === "/websites") {
      return location.pathname.startsWith("/websites");
    }
    return location.pathname === to;
  };

  return (
    <div className="min-h-screen bg-[#292B3A] text-[#D7E8FA]">
      <header className="border-b border-[#D7E8FA]/12 bg-[#222432]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/dashboard" className="focus:outline-none">
              <BrandMark size="sm" />
            </Link>

            <nav aria-label="Primary navigation" className="flex items-center gap-2">
              {NAV_ITEMS.map((item) => {
                const active = isNavActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      active
                        ? "bg-[#3B1EFF] text-[#D7E8FA] shadow-sm shadow-[#3B1EFF]/30"
                        : "text-[#D7E8FA]/75 hover:bg-[#292B3A] hover:text-[#D7E8FA]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-[#00FFBA]/30 bg-[#00FFBA]/10 px-3 py-1 text-xs font-medium text-[#00FFBA] sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-[#00FFBA]" />
              <span className="max-w-[160px] truncate">{user?.email}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-2 text-xs font-semibold text-[#D7E8FA] transition hover:border-[#3B1EFF] hover:bg-[#3B1EFF] focus:ring-2 focus:ring-[#00FFBA]/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {children}
      </main>
    </div>
  );
}

