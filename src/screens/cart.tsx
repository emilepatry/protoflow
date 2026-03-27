import { DEVICE_WIDTH, DEVICE_HEIGHT } from "@/lib/utils";

export default function CartScreen() {
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
        <div className="flex items-center gap-3">
          <button
            className="heron-body-md"
            style={{ color: "var(--heron-text-tertiary)" }}
            data-pf-action="go-back"
          >
            ← Back
          </button>
          <h1 className="heron-title-lg" data-pf-id="cart-title">
            Your Cart
          </h1>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4">
        <div
          className="space-y-3 rounded-xl p-4"
          style={{
            background: "var(--heron-bg-card)",
            boxShadow: "var(--heron-shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg"
                style={{ background: "var(--heron-bg-global)" }}
              />
              <div>
                <p className="heron-label-md" data-pf-id="cart-item-1">
                  Vitamin D3 2000 IU
                </p>
                <p
                  className="heron-body-sm"
                  style={{ color: "var(--heron-text-tertiary)" }}
                >
                  Qty: 1
                </p>
              </div>
            </div>
            <p
              className="heron-label-md"
              style={{ color: "var(--heron-text-price-regular)" }}
              data-pf-id="cart-price-1"
            >
              $24.99
            </p>
          </div>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--heron-bg-card)",
            boxShadow: "var(--heron-shadow-xs)",
          }}
        >
          <div className="flex items-center justify-between">
            <p
              className="heron-body-md"
              style={{ color: "var(--heron-text-secondary)" }}
              data-pf-id="cart-subtotal-label"
            >
              Subtotal
            </p>
            <p
              className="heron-label-lg"
              style={{
                fontWeight: "var(--heron-weight-semibold)",
              }}
              data-pf-id="cart-subtotal"
            >
              $24.99
            </p>
          </div>
        </div>

        <button
          className="heron-label-md w-full rounded-xl py-3.5 text-white"
          style={{ background: "var(--heron-text-primary)" }}
          data-pf-action="checkout"
          data-pf-id="cart-cta"
        >
          Proceed to Checkout
        </button>
      </main>
    </div>
  );
}
