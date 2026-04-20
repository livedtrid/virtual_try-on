import { useState } from "react";

import TryOnWidget from "./components/TryOnWidget";
import { PRODUCTS } from "./products";

export default function App() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [showTryOnWidget, setShowTryOnWidget] = useState(false);

  function handleOpenTryOn(product) {
    setActiveProduct(product);
    setShowTryOnWidget(true);
  }

  return (
    <main className="page">
      {PRODUCTS.map((product) => (
        <section className="card product-card" key={product.id}>
          <p className="eyebrow">Mock PDP</p>
          <h1>Urban {product.label} 2026</h1>
          <div className="product-media">
            <img
              src={`${import.meta.env.BASE_URL}${product.asset}`}
              alt={`Mock product ${product.label.toLowerCase()}`}
              className="product-image"
            />
            {product.tryOnEnabled ? (
              <button className="primary-cta primary-cta--overlay" type="button" onClick={() => handleOpenTryOn(product)}>
                {product.tryOnCtaLabel || "Experimentar agora"}
              </button>
            ) : null}
          </div>
        </section>
      ))}

      {showTryOnWidget && activeProduct ? (
        <section className="card widget-card">
          <TryOnWidget selectedProduct={activeProduct} />
        </section>
      ) : null}
    </main>
  );
}

