import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import WebsiteFormModal from "../components/WebsiteFormModal";
import { websiteApi } from "../services/api";

export default function WebsiteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [website, setWebsite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let active = true;

    websiteApi
      .getById(id)
      .then((response) => {
        if (!active) return;
        setError("");
        setWebsite(response.data?.website || null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Unable to load website details");
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleUpdate = async (payload) => {
    const response = await websiteApi.update(id, payload);
    setWebsite(response.data?.website || null);
  };

  const handleToggleStatus = async () => {
    if (!website) return;
    setIsBusy(true);
    setError("");
    const nextStatus = website.status === "active" ? "paused" : "active";

    try {
      const response = await websiteApi.update(id, { status: nextStatus });
      setWebsite(response.data?.website || null);
    } catch (err) {
      setError(err.message || "Unable to update website status");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    setIsBusy(true);
    setError("");
    try {
      await websiteApi.remove(id);
      navigate("/websites", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to delete website");
      setIsBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            to="/websites"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D7E8FA]/75 transition hover:text-[#00FFBA]"
          >
            <span aria-hidden="true">&larr;</span>
            Back to Websites
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-[#D7E8FA]/12 bg-[#222432] py-16">
            <div className="flex items-center gap-3 text-sm text-[#D7E8FA]/75">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D7E8FA]/25 border-t-[#00FFBA]" />
              Loading website details...
            </div>
          </div>
        ) : error && !website ? (
          <div
            role="alert"
            className="rounded-2xl border border-[#D7E8FA]/15 bg-[#222432] p-8 text-center"
          >
            <h1 className="text-xl font-bold text-[#D7E8FA]">
              Website Unavailable
            </h1>
            <p className="mt-2 text-sm text-[#D7E8FA]/70">{error}</p>
            <Link
              to="/websites"
              className="mt-5 inline-block rounded-xl bg-[#3B1EFF] px-4 py-2 text-sm font-semibold text-[#D7E8FA]"
            >
              Return to Websites
            </Link>
          </div>
        ) : website ? (
          <section className="rounded-2xl border border-[#D7E8FA]/15 bg-[#222432] p-6 shadow-xl sm:p-8">
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-[#D7E8FA]/25 bg-[#292B3A] px-4 py-3 text-sm text-[#D7E8FA]"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col justify-between gap-4 border-b border-[#D7E8FA]/10 pb-6 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      website.status === "active"
                        ? "border border-[#00FFBA]/30 bg-[#00FFBA]/12 text-[#00FFBA]"
                        : "border border-[#D7E8FA]/15 bg-[#292B3A] text-[#D7E8FA]/70"
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
                  <span className="rounded-lg border border-[#D7E8FA]/15 bg-[#292B3A] px-2.5 py-1 text-xs font-semibold capitalize text-[#D7E8FA]/80">
                    {website.environment}
                  </span>
                </div>

                <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-[#D7E8FA] sm:text-3xl">
                  {website.name}
                </h1>
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block break-all text-sm text-[#00FFBA] underline-offset-4 hover:underline"
                >
                  {website.url}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={isBusy}
                  className="cursor-pointer rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-2 text-xs font-semibold text-[#D7E8FA] transition hover:border-[#00FFBA]/50 disabled:opacity-60 sm:text-sm"
                >
                  {website.status === "active" ? "Pause Target" : "Activate Target"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  disabled={isBusy}
                  className="cursor-pointer rounded-xl bg-[#3B1EFF] px-4 py-2 text-xs font-semibold text-[#D7E8FA] shadow-lg shadow-[#3B1EFF]/30 transition hover:brightness-110 disabled:opacity-60 sm:text-sm"
                >
                  Edit Website
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete((prev) => !prev)}
                  disabled={isBusy}
                  className="cursor-pointer rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-2 text-xs font-semibold text-[#D7E8FA]/80 transition hover:border-[#D7E8FA]/40 hover:text-[#D7E8FA] disabled:opacity-60 sm:text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            {confirmDelete && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-3">
                <p className="text-sm text-[#D7E8FA]">
                  Confirm removing <strong>{website.name}</strong> from your
                  account?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isBusy}
                    className="cursor-pointer rounded-lg border border-[#D7E8FA]/20 px-3 py-1.5 text-xs font-semibold text-[#D7E8FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isBusy}
                    className="cursor-pointer rounded-lg bg-[#3B1EFF] px-3 py-1.5 text-xs font-semibold text-[#D7E8FA] hover:brightness-110"
                  >
                    {isBusy ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-[#D7E8FA]/10 bg-[#292B3A] p-4 sm:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/55">
                  Description
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#D7E8FA]/85">
                  {website.description || "No description provided."}
                </p>
              </div>

              <div className="rounded-xl border border-[#D7E8FA]/10 bg-[#292B3A] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/55">
                  Website ID
                </p>
                <p className="mt-1.5 truncate font-mono text-xs text-[#D7E8FA]/85">
                  {website.id}
                </p>
              </div>

              <div className="rounded-xl border border-[#D7E8FA]/10 bg-[#292B3A] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/55">
                  Created
                </p>
                <p className="mt-1.5 text-sm font-medium text-[#D7E8FA]">
                  {new Date(website.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-[#D7E8FA]/10 bg-[#292B3A] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/55">
                  Last Updated
                </p>
                <p className="mt-1.5 text-sm font-medium text-[#D7E8FA]">
                  {new Date(website.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {editOpen && website && (
        <WebsiteFormModal
          initialWebsite={website}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdate}
        />
      )}
    </AppShell>
  );
}
