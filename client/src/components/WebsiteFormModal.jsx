import { useState } from "react";

const ENVIRONMENTS = ["production", "staging", "development"];
const STATUSES = ["active", "paused"];

function validateForm(values) {
  const errors = {};
  const name = values.name.trim();
  const url = values.url.trim();
  const description = values.description.trim();

  if (!name) {
    errors.name = "Website name is required";
  } else if (name.length < 2 || name.length > 100) {
    errors.name = "Website name must be between 2 and 100 characters";
  }

  if (!url) {
    errors.url = "Website URL is required";
  } else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.url = "URL must use http:// or https:// protocol";
      } else if (
        !parsed.hostname ||
        (!parsed.hostname.includes(".") && parsed.hostname !== "localhost")
      ) {
        errors.url = "Please provide a valid website hostname";
      }
    } catch {
      errors.url = "Please provide a valid URL starting with http:// or https://";
    }
  }

  if (description.length > 500) {
    errors.description = "Description cannot exceed 500 characters";
  }

  return errors;
}

export default function WebsiteFormModal({
  initialWebsite = null,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(initialWebsite);

  const [formData, setFormData] = useState({
    name: initialWebsite?.name || "",
    url: initialWebsite?.url || "",
    environment: initialWebsite?.environment || "production",
    status: initialWebsite?.status || "active",
    description: initialWebsite?.description || "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        url: formData.url.trim(),
        environment: formData.environment,
        status: formData.status,
        description: formData.description.trim(),
      });
      onClose();
    } catch (error) {
      if (error.errors) {
        setFieldErrors((prev) => ({ ...prev, ...error.errors }));
      }
      setApiError(error.message || "Unable to save website. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="website-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#D7E8FA]/15 bg-[#222432] p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#D7E8FA]/10 pb-4">
          <div>
            <h2
              id="website-modal-title"
              className="text-xl font-bold text-[#D7E8FA]"
            >
              {isEditing ? "Edit Website" : "Add Website"}
            </h2>
            <p className="mt-1 text-xs text-[#D7E8FA]/65">
              {isEditing
                ? "Update target website configuration and environment settings."
                : "Register a target web application in your TestPilot workspace."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-1.5 text-[#D7E8FA]/60 transition hover:bg-[#292B3A] hover:text-[#D7E8FA]"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {apiError && (
            <div
              role="alert"
              className="rounded-xl border border-[#D7E8FA]/25 bg-[#292B3A] px-4 py-3 text-sm text-[#D7E8FA]"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3B1EFF]" />
                <span>{apiError}</span>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="website-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
            >
              Website Name
            </label>
            <input
              id="website-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Customer Portal"
              aria-invalid={Boolean(fieldErrors.name)}
              className="w-full rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-2.5 text-sm text-[#D7E8FA] placeholder-[#D7E8FA]/40 transition outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
            />
            {fieldErrors.name && (
              <p className="mt-1.5 text-xs font-medium text-[#D7E8FA]/90">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="website-url"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
            >
              Target URL
            </label>
            <input
              id="website-url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://app.example.com"
              aria-invalid={Boolean(fieldErrors.url)}
              className="w-full rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-2.5 text-sm text-[#D7E8FA] placeholder-[#D7E8FA]/40 transition outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
            />
            {fieldErrors.url && (
              <p className="mt-1.5 text-xs font-medium text-[#D7E8FA]/90">
                {fieldErrors.url}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="website-environment"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
              >
                Environment
              </label>
              <select
                id="website-environment"
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-3.5 py-2.5 text-sm capitalize text-[#D7E8FA] transition outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env} className="capitalize">
                    {env}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="website-status"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
              >
                Status
              </label>
              <select
                id="website-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-3.5 py-2.5 text-sm capitalize text-[#D7E8FA] transition outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status} className="capitalize">
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="website-description"
                className="block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
              >
                Description (Optional)
              </label>
              <span className="text-[11px] text-[#D7E8FA]/50">
                {formData.description.length}/500
              </span>
            </div>
            <textarea
              id="website-description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Core checkout and onboarding flows..."
              aria-invalid={Boolean(fieldErrors.description)}
              className="w-full resize-none rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-2.5 text-sm text-[#D7E8FA] placeholder-[#D7E8FA]/40 transition outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
            />
            {fieldErrors.description && (
              <p className="mt-1.5 text-xs font-medium text-[#D7E8FA]/90">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-2.5 text-sm font-semibold text-[#D7E8FA] transition hover:border-[#D7E8FA]/40 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3B1EFF] px-5 py-2.5 text-sm font-semibold text-[#D7E8FA] shadow-lg shadow-[#3B1EFF]/30 transition hover:brightness-110 focus:ring-2 focus:ring-[#00FFBA]/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D7E8FA]/30 border-t-[#D7E8FA]" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Website"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

