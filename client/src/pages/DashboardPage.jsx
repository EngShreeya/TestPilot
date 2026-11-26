import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandMark } from "../components/BrandUI";
import { useAuth } from "../context/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const formattedCreatedAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : "—";

  return (
    <div className="min-h-screen bg-[#292B3A] text-[#D7E8FA]">
      <header className="border-b border-[#D7E8FA]/12 bg-[#222432]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandMark size="sm" />

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-[#00FFBA]/30 bg-[#00FFBA]/10 px-3 py-1 text-xs font-medium text-[#00FFBA] sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-[#00FFBA]" />
              Authenticated Session
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

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-[#D7E8FA]/15 bg-[#222432] p-6 shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#D7E8FA]/10 pb-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#00FFBA]/12 px-3 py-1 text-xs font-semibold text-[#00FFBA]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FFBA]" />
                Workspace Active
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#D7E8FA] sm:text-3xl">
                Welcome, {user?.name}
              </h1>
              <p className="mt-1 text-sm text-[#D7E8FA]/70">
                Your TestPilot account is authenticated via an HttpOnly cookie
                session and verified against the backend.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[#D7E8FA]/10 bg-[#292B3A] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/55">
                Account Name
              </p>
              <p className="mt-1.5 text-base font-semibold text-[#D7E8FA]">
                {user?.name}
              </p>
            </div>

            <div className="rounded-xl border border-[#D7E8FA]/10 bg-[#292B3A] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/55">
                Email Address
              </p>
              <p className="mt-1.5 truncate text-base font-semibold text-[#D7E8FA]">
                {user?.email}
              </p>
            </div>

            <div className="rounded-xl border border-[#D7E8FA]/10 bg-[#292B3A] p-4 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/55">
                Session Security
              </p>
              <p className="mt-1.5 text-base font-semibold text-[#00FFBA]">
                HttpOnly JWT + CSRF Protected
              </p>
              <p className="mt-1 text-xs text-[#D7E8FA]/60">
                Created: {formattedCreatedAt}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

