import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/useAuth";
import { websiteApi } from "../services/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentWebsites, setRecentWebsites] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, paused: 0 });
  const [loadingSites, setLoadingSites] = useState(true);

  useEffect(() => {
    let active = true;

    websiteApi
      .list()
      .then((response) => {
        if (!active) return;
        setRecentWebsites((response.data?.websites || []).slice(0, 4));
        setSummary(
          response.data?.summary || { total: 0, active: 0, paused: 0 }
        );
      })
      .catch(() => {
        if (!active) return;
      })
      .finally(() => {
        if (!active) return;
        setLoadingSites(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const formattedCreatedAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : "—";

  return (
    <AppShell>
      <div className="space-y-6">
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
                Manage your registered target websites and monitor workspace
                configuration.
              </p>
            </div>

            <Link
              to="/websites"
              className="inline-flex items-center justify-center rounded-xl bg-[#3B1EFF] px-4 py-2.5 text-sm font-semibold text-[#D7E8FA] shadow-lg shadow-[#3B1EFF]/30 transition hover:brightness-110"
            >
              Manage Websites
            </Link>
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

        {/* Registered Websites Summary */}
        <section className="rounded-2xl border border-[#D7E8FA]/15 bg-[#222432] p-6 shadow-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D7E8FA]/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#D7E8FA]">
                Registered Websites
              </h2>
              <p className="text-xs text-[#D7E8FA]/65">
                {summary.total} total · {summary.active} active ·{" "}
                {summary.paused} paused
              </p>
            </div>
            <Link
              to="/websites"
              className="text-sm font-semibold text-[#00FFBA] underline-offset-4 hover:underline"
            >
              View all &rarr;
            </Link>
          </div>

          {loadingSites ? (
            <p className="py-6 text-sm text-[#D7E8FA]/65">
              Loading websites...
            </p>
          ) : recentWebsites.length === 0 ? (
            <div className="py-6 text-sm text-[#D7E8FA]/70">
              No websites registered yet.{" "}
              <Link
                to="/websites"
                className="font-semibold text-[#00FFBA] underline-offset-4 hover:underline"
              >
                Add your first website
              </Link>
              .
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recentWebsites.map((site) => (
                <Link
                  key={site.id}
                  to={`/websites/${site.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#D7E8FA]/10 bg-[#292B3A] p-4 transition hover:border-[#3B1EFF]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#D7E8FA]">
                      {site.name}
                    </p>
                    <p className="truncate text-xs text-[#D7E8FA]/60">
                      {site.url}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                      site.status === "active"
                        ? "bg-[#00FFBA]/15 text-[#00FFBA]"
                        : "bg-[#222432] text-[#D7E8FA]/65"
                    }`}
                  >
                    {site.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
