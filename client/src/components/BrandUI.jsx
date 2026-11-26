export function BrandMark({ size = "md" }) {
  const boxSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  return (
    <div className="inline-flex items-center gap-3">
      <div
        className={`${boxSize} flex items-center justify-center rounded-xl bg-[#3B1EFF] text-[#D7E8FA] shadow-lg shadow-[#3B1EFF]/30 ring-1 ring-[#D7E8FA]/20`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2L3 7l9 5 9-5-9-5z" />
          <path d="M3 17l9 5 9-5" />
          <path d="M3 12l9 5 9-5" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-lg font-semibold tracking-tight text-[#D7E8FA]">
          TestPilot
        </span>
        <span className="text-[11px] font-medium uppercase tracking-widest text-[#D7E8FA]/60">
          Autonomous QA
        </span>
      </div>
    </div>
  );
}

export function FullScreenLoader({ label = "Verifying session..." }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#292B3A] px-4 text-[#D7E8FA]">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#D7E8FA]/12 bg-[#232533] px-8 py-7 shadow-2xl">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#D7E8FA]/20 border-t-[#00FFBA]" />
        <p className="text-sm font-medium tracking-wide text-[#D7E8FA]/85">
          {label}
        </p>
      </div>
    </div>
  );
}

