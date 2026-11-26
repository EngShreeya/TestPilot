import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import WebsiteFormModal from "../components/WebsiteFormModal";
import { websiteApi } from "../services/api";

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, paused: 0 });
  const [search, setSearch] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyWebsiteId, setBusyWebsiteId] = useState(null);

  const fetchWebsites = useCallback(async () => {
    setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (environmentFilter) params.environment = environmentFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await websiteApi.list(params);
      setWebsites(response.data?.websites || []);
      setSummary(response.data?.summary || { total: 0, active: 0, paused: 0 });
    } catch (err) {
      setError(err.message || "Failed to load websites");
    } finally {
      setIsLoading(false);
    }
  }, [search, environmentFilter, statusFilter]);

  useEffect(() => {
    let active = true;
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (environmentFilter) params.environment = environmentFilter;
    if (statusFilter) params.status = statusFilter;

    websiteApi
      .list(params)
      .then((response) => {
        if (!active) return;
        setError("");
        setWebsites(response.data?.websites || []);
        setSummary(response.data?.summary || { total: 0, active: 0, paused: 0 });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load websites");
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, environmentFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingWebsite(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (website) => {
    setEditingWebsite(website);
    setModalOpen(true);
  };

  const handleSaveWebsite = async (payload) => {
    if (editingWebsite) {
      await websiteApi.update(editingWebsite.id, payload);
      setFeedback(`Updated "${payload.name}" successfully.`);
    } else {
      await websiteApi.create(payload);
      setFeedback(`Added "${payload.name}" to your workspace.`);
    }
    await fetchWebsites();
  };

  const handleToggleStatus = async (website) => {
    setError("");
    setFeedback("");
    setBusyWebsiteId(website.id);
    const nextStatus = website.status === "active" ? "paused" : "active";

    try {
      await websiteApi.update(website.id, { status: nextStatus });
      setFeedback(`"${website.name}" is now ${nextStatus}.`);
      await fetchWebsites();
    } catch (err) {
      setError(err.message || "Failed to update website status");
    } finally {
      setBusyWebsiteId(null);
    }
  };

  const handleDelete = async (website) => {
    setError("");
    setFeedback("");
    setBusyWebsiteId(website.id);

    try {
      await websiteApi.remove(website.id);
      setConfirmDeleteId(null);
      setFeedback(`Removed "${website.name}" from your workspace.`);
      await fetchWebsites();
    } catch (err) {
      setError(err.message || "Failed to delete website");
    } finally {
      setBusyWebsiteId(null);
    }
  };

  const hasFilters = Boolean(search.trim() || environmentFilter || statusFilter);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#D7E8FA] sm:text-3xl">
              Websites
            </h1>
            <p className="mt-1 text-sm text-[#D7E8FA]/70">
              Manage the web applications registered under your TestPilot account.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3B1EFF] px-4 py-2.5 text-sm font-semibold text-[#D7E8FA] shadow-lg shadow-[#3B1EFF]/30 transition hover:brightness-110 focus:ring-2 focus:ring-[#00FFBA]/60 focus:outline-none"
          >
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            Add Website
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#D7E8FA]/12 bg-[#222432] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/60">
              Total Websites
            </p>
            <p className="mt-2 text-2xl font-bold text-[#D7E8FA]">
              {summary.total}
            </p>
          </div>

          <div className="rounded-2xl border border-[#D7E8FA]/12 bg-[#222432] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/60">
              Active Targets
            </p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-[#00FFBA]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00FFBA]" />
              {summary.active}
            </p>
          </div>

          <div className="rounded-2xl border border-[#D7E8FA]/12 bg-[#222432] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/60">
              Paused Targets
            </p>
            <p className="mt-2 text-2xl font-bold text-[#D7E8FA]/80">
              {summary.paused}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#D7E8FA]/12 bg-[#222432] p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label htmlFor="website-search" className="sr-only">
              Search websites
            </label>
            <input
              id="website-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by website name or URL..."
              className="w-full rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-2 text-sm text-[#D7E8FA] placeholder-[#D7E8FA]/40 outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              aria-label="Filter by environment"
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              className="rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-3 py-2 text-sm text-[#D7E8FA] outline-none focus:border-[#3B1EFF]"
            >
              <option value="">All environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-3 py-2 text-sm text-[#D7E8FA] outline-none focus:border-[#3B1EFF]"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-[#00FFBA]/30 bg-[#00FFBA]/10 px-4 py-3 text-sm text-[#00FFBA]"
          >
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback("")}
              className="cursor-pointer text-xs font-semibold underline-offset-4 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-[#D7E8FA]/25 bg-[#222432] px-4 py-3 text-sm text-[#D7E8FA]"
          >
            {error}
          </div>
        )}

        {/* Website List */}
        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-[#D7E8FA]/12 bg-[#222432] py-16">
            <div className="flex items-center gap-3 text-sm text-[#D7E8FA]/75">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D7E8FA]/25 border-t-[#00FFBA]" />
              Loading websites...
            </div>
          </div>
        ) : websites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D7E8FA]/20 bg-[#222432] px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-[#D7E8FA]">
              {hasFilters ? "No matching websites found" : "No websites added yet"}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-[#D7E8FA]/65">
              {hasFilters
                ? "Try clearing your search or filters to view all registered websites."
                : "Add your first web application to manage target URLs and environments in TestPilot."}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setEnvironmentFilter("");
                    setStatusFilter("");
                  }}
                  className="cursor-pointer rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-2 text-sm font-semibold text-[#D7E8FA] transition hover:border-[#3B1EFF]"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="cursor-pointer rounded-xl bg-[#3B1EFF] px-5 py-2.5 text-sm font-semibold text-[#D7E8FA] shadow-lg shadow-[#3B1EFF]/30 transition hover:brightness-110"
                >
                  + Add Your First Website
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {websites.map((website) => {
              const isBusy = busyWebsiteId === website.id;
              const isConfirmingDelete = confirmDeleteId === website.id;

              return (
                <article
                  key={website.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#D7E8FA]/12 bg-[#222432] p-5 shadow-lg transition hover:border-[#D7E8FA]/25"
                >
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/websites/${website.id}`}
                          className="block truncate text-lg font-semibold text-[#D7E8FA] transition hover:text-[#00FFBA]"
                        >
                          {website.name}
                        </Link>
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 block truncate text-xs text-[#D7E8FA]/65 underline-offset-4 hover:text-[#D7E8FA] hover:underline"
                        >
                          {website.url}
                        </a>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-lg border border-[#D7E8FA]/15 bg-[#292B3A] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#D7E8FA]/80">
                          {website.environment}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                            website.status === "active"
                              ? "border border-[#00FFBA]/30 bg-[#00FFBA]/12 text-[#00FFBA]"
                              : "border border-[#D7E8FA]/15 bg-[#292B3A] text-[#D7E8FA]/65"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              website.status === "active"
                                ? "bg-[#00FFBA]"
                                : "bg-[#D7E8FA]/45"
                            }`}
                          />
                          {website.status}
                        </span>
                      </div>
                    </div>

                    {website.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-[#D7E8FA]/70">
                        {website.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 border-t border-[#D7E8FA]/10 pt-4">
                    {isConfirmingDelete ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[#D7E8FA]/85">
                          Delete this website permanently?
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={isBusy}
                            className="cursor-pointer rounded-lg border border-[#D7E8FA]/20 bg-[#292B3A] px-3 py-1.5 text-xs font-semibold text-[#D7E8FA]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(website)}
                            disabled={isBusy}
                            className="cursor-pointer rounded-lg bg-[#3B1EFF] px-3 py-1.5 text-xs font-semibold text-[#D7E8FA] transition hover:brightness-110 disabled:opacity-60"
                          >
                            {isBusy ? "Deleting..." : "Confirm Delete"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-[#D7E8FA]/50">
                          Updated{" "}
                          {new Date(website.updatedAt).toLocaleDateString()}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/websites/${website.id}`}
                            className="rounded-lg border border-[#D7E8FA]/15 bg-[#292B3A] px-3 py-1.5 text-xs font-semibold text-[#D7E8FA] transition hover:border-[#3B1EFF]"
                          >
                            Details
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(website)}
                            disabled={isBusy}
                            className="cursor-pointer rounded-lg border border-[#D7E8FA]/15 bg-[#292B3A] px-3 py-1.5 text-xs font-semibold text-[#D7E8FA] transition hover:border-[#00FFBA]/50 disabled:opacity-60"
                          >
                            {website.status === "active" ? "Pause" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(website)}
                            disabled={isBusy}
                            className="cursor-pointer rounded-lg border border-[#D7E8FA]/15 bg-[#292B3A] px-3 py-1.5 text-xs font-semibold text-[#D7E8FA] transition hover:border-[#3B1EFF] disabled:opacity-60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(website.id)}
                            disabled={isBusy}
                            className="cursor-pointer rounded-lg border border-[#D7E8FA]/15 bg-[#292B3A] px-3 py-1.5 text-xs font-semibold text-[#D7E8FA]/75 transition hover:border-[#D7E8FA]/40 hover:text-[#D7E8FA] disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <WebsiteFormModal
          initialWebsite={editingWebsite}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSaveWebsite}
        />
      )}
    </AppShell>
  );
}
