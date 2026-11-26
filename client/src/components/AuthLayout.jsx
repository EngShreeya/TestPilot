import { BrandMark } from "./BrandUI";

const HIGHLIGHTS = [
  {
    title: "Autonomous Test Execution",
    desc: "Run resilient end-to-end browser verification pipelines continuously.",
  },
  {
    title: "AI Failure Diagnostics",
    desc: "Pinpoint root causes across DOM, network, and visual regressions.",
  },
  {
    title: "Zero-Trust Session Security",
    desc: "HttpOnly JWT cookies, CSRF protection, and server-side revocation.",
  },
];

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#292B3A] text-[#D7E8FA]">
      {/* Ambient background accents strictly within the TestPilot palette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#3B1EFF]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-[#00FFBA]/10 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8">
        {/* Brand & Platform Context Panel */}
        <aside className="mb-8 flex flex-col justify-between lg:col-span-6 lg:mb-0 lg:pr-6">
          <div>
            <BrandMark />

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#00FFBA]/30 bg-[#00FFBA]/10 px-3 py-1 text-xs font-medium text-[#00FFBA]">
              <span className="h-2 w-2 rounded-full bg-[#00FFBA]" />
              Platform Ready · Encrypted Auth
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#D7E8FA] sm:text-4xl">
              Ship reliable web apps with autonomous AI testing.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#D7E8FA]/75 sm:text-base">
              Access your TestPilot workspace to orchestrate browser test suites,
              inspect failures, and monitor release quality.
            </p>
          </div>

          <div className="mt-8 hidden space-y-4 lg:block">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-[#D7E8FA]/10 bg-[#232533]/90 p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#00FFBA]/15 text-[#00FFBA]">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.75-3.75a1 1 0 111.414-1.414l3.043 3.043 6.543-6.543a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[#D7E8FA]">
                    {item.title}
                  </h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#D7E8FA]/70">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Auth Form Card */}
        <main className="lg:col-span-6">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-[#D7E8FA]/15 bg-[#222432] p-6 shadow-2xl shadow-black/35 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[#D7E8FA]">
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-[#D7E8FA]/70">{subtitle}</p>
            </div>

            {children}

            {footer && (
              <div className="mt-6 border-t border-[#D7E8FA]/10 pt-5 text-center text-sm text-[#D7E8FA]/75">
                {footer}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

