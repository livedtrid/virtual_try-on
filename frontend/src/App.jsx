import { useState } from "react";

import TryOnWidget from "./components/TryOnWidget";
import { PRODUCTS } from "./products";

export default function App() {
  const [selectedMediaId, setSelectedMediaId] = useState(PRODUCTS[0]?.id || "");
  const [activeProduct, setActiveProduct] = useState(null);
  const [showTryOnWidget, setShowTryOnWidget] = useState(false);

  const selectedMedia = PRODUCTS.find((product) => product.id === selectedMediaId) || PRODUCTS[0] || null;
  const firstTryOnProduct = PRODUCTS.find((product) => product.tryOnEnabled) || null;
  const tryOnProduct = selectedMedia?.tryOnEnabled ? selectedMedia : firstTryOnProduct;

  function handleOpenTryOn(product) {
    setActiveProduct(product);
    setShowTryOnWidget(true);
  }

  function handleCloseTryOn() {
    setShowTryOnWidget(false);
  }

  return (
    <main className="store-page">
      <header className="store-header">
        <div className="header-left" aria-hidden="true">
          <span className="header-icon">Menu</span>
          <span className="header-icon">Search</span>
        </div>
        <div className="header-logo">SLB</div>
        <div className="header-right" aria-hidden="true">
          <span className="header-icon">Bag</span>
          <span className="header-icon">User</span>
          <span className="header-icon">Lang</span>
        </div>
      </header>

      <div className="promo-bar">Sou Benfica | Inicia sessao para teres descontos exclusivos. <b>Iniciar sessao</b></div>

      <section className="pdp-layout">
        <div className="gallery-column">
          <div className="thumbnail-list" role="tablist" aria-label="Product media">
            {PRODUCTS.map((product) => (
              <button
                key={product.id}
                type="button"
                className={`thumbnail ${selectedMedia?.id === product.id ? "thumbnail--active" : ""}`}
                onClick={() => setSelectedMediaId(product.id)}
              >
                <img src={`${import.meta.env.BASE_URL}${product.asset}`} alt={product.label} />
              </button>
            ))}
          </div>

          <div className="hero-media">
            {selectedMedia ? (
              <img src={`${import.meta.env.BASE_URL}${selectedMedia.asset}`} alt={selectedMedia.label} className="hero-image" />
            ) : null}

            {tryOnProduct ? (
              <button className="primary-cta primary-cta--overlay" type="button" onClick={() => handleOpenTryOn(tryOnProduct)}>
                {tryOnProduct.tryOnCtaLabel || "Experimentar agora"}
              </button>
            ) : null}
          </div>
        </div>

        <aside className="details-column">
          <h1>Sweatshirt Vermelha para Crianca SLB</h1>
          <div className="price-block">
            <p><span>Socio</span> 44,99EUR</p>
            <p><span>Adepto</span> 49,99EUR</p>
            <p><span>PVP</span> 49,99EUR</p>
          </div>

          <div className="sizes-row" aria-label="Sizes">
            <span>4 anos</span><span>6 anos</span><span>8 anos</span><span>10 anos</span><span>12 anos</span>
          </div>

          <div className="actions-row">
            <button type="button" className="ghost-btn">Adicionar</button>
            <button type="button" className="dark-btn">Comprar Ja</button>
          </div>

          <section className="text-block">
            <h2>Detalhes</h2>
            <p>Sweatshirt com capuz vermelha do Sport Lisboa e Benfica, para crianca, com a inscricao "SLB" ao centro em branco.</p>
          </section>

          <section className="text-block">
            <h2>Entregas e devolucoes</h2>
            <p><b>Oferta de portes</b> de envio para Portugal Continental e Ilhas.</p>
            <p><b>30 dias</b> para troca e devolucao a partir da rececao da encomenda.</p>
          </section>
        </aside>
      </section>

      {showTryOnWidget && activeProduct ? (
        <section className="tryon-panel">
          <TryOnWidget selectedProduct={activeProduct} onClose={handleCloseTryOn} />
        </section>
      ) : null}
    </main>
  );
}

