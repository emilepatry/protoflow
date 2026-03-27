import { DEVICE_WIDTH, DEVICE_HEIGHT } from "@/lib/utils";

export default function HomeScreen() {
  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: DEVICE_HEIGHT,
        width: DEVICE_WIDTH,
        fontFamily: "var(--heron-font-base)",
        background: "var(--heron-bg-global)",
        color: "var(--heron-text-primary)",
      }}
    >
      <header
        className="px-5 pb-4 pt-14"
        style={{ background: "var(--heron-bg-card)" }}
      >
        <h1 className="heron-heading-sm" data-pf-id="home-title">
          Fullscript
        </h1>
        <p
          className="heron-body-md mt-1"
          style={{ color: "var(--heron-text-secondary)" }}
          data-pf-id="home-subtitle"
        >
          Your personalized wellness plan
        </p>
      </header>

      <main className="flex-1 space-y-3 p-4">
        <section
          className="rounded-xl p-4"
          style={{
            background: "var(--heron-bg-card)",
            boxShadow: "var(--heron-shadow-sm)",
          }}
        >
          <h2
            className="heron-label-sm mb-3"
            style={{ color: "var(--heron-text-tertiary)" }}
            data-pf-id="home-section-title"
          >
            Active Plan
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-[var(--heron-bg-global)] p-3">
              <div
                className="h-10 w-10 rounded-full"
                style={{ background: "var(--heron-pill-info-bg)" }}
              />
              <div>
                <p className="heron-label-md" data-pf-id="home-product-1">
                  Vitamin D3 2000 IU
                </p>
                <p
                  className="heron-body-sm"
                  style={{ color: "var(--heron-text-tertiary)" }}
                >
                  1 capsule daily
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-[var(--heron-bg-global)] p-3">
              <div
                className="h-10 w-10 rounded-full"
                style={{ background: "var(--heron-pill-success-bg)" }}
              />
              <div>
                <p className="heron-label-md" data-pf-id="home-product-2">
                  Omega-3 Fish Oil
                </p>
                <p
                  className="heron-body-sm"
                  style={{ color: "var(--heron-text-tertiary)" }}
                >
                  2 softgels daily with food
                </p>
              </div>
            </div>
          </div>
        </section>

        <button
          className="heron-label-md w-full rounded-xl py-3.5 text-white"
          style={{ background: "var(--heron-text-primary)" }}
          data-pf-action="browse-catalog"
          data-pf-id="home-cta"
        >
          Browse Catalog
        </button>
      </main>
    </div>
  );
}
