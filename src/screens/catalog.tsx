const CATEGORIES = [
  { name: "Probiotics", count: 42 },
  { name: "Vitamins", count: 67 },
  { name: "Minerals", count: 31 },
  { name: "Herbs", count: 28 },
];

export default function CatalogScreen() {
  return (
    <div
      className="flex min-h-[667px] w-[375px] flex-col"
      style={{
        fontFamily: "var(--heron-font-base)",
        background: "var(--heron-bg-global)",
        color: "var(--heron-text-primary)",
      }}
    >
      <header
        className="px-5 pb-4 pt-14"
        style={{ background: "var(--heron-bg-card)" }}
      >
        <div className="flex items-center gap-3">
          <button
            className="heron-body-md"
            style={{ color: "var(--heron-text-tertiary)" }}
            data-pf-action="go-back"
          >
            ← Back
          </button>
          <h1 className="heron-title-lg" data-pf-id="catalog-title">
            Catalog
          </h1>
        </div>
        <div
          className="mt-3 rounded-lg px-3 py-2.5"
          style={{
            background: "var(--heron-bg-global)",
            border: "1px solid transparent",
          }}
        >
          <span
            className="heron-body-md"
            style={{ color: "var(--heron-text-tertiary)" }}
            data-pf-id="catalog-search"
          >
            Search supplements...
          </span>
        </div>
      </header>

      <main className="flex-1 space-y-2 p-4">
        {CATEGORIES.map((category) => (
          <div
            key={category.name}
            className="flex items-center justify-between rounded-xl p-4"
            style={{
              background: "var(--heron-bg-card)",
              boxShadow: "var(--heron-shadow-xs)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg"
                style={{ background: "var(--heron-bg-global)" }}
              />
              <div>
                <p className="heron-label-md">{category.name}</p>
                <p
                  className="heron-body-sm"
                  style={{ color: "var(--heron-text-tertiary)" }}
                >
                  {category.count} products
                </p>
              </div>
            </div>
            <span style={{ color: "var(--heron-text-tertiary)" }}>→</span>
          </div>
        ))}
      </main>
    </div>
  );
}
