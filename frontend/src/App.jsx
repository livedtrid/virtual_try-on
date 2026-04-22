import { useEffect, useState } from "react";

import VirtualTryOnWidget from "./components/VirtualTryOnWidget";
import { PRODUCT_DETAIL } from "./products";

export default function App() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [showTryOnWidget, setShowTryOnWidget] = useState(false);

  function handleOpenTryOn(product) {
    setActiveProduct(product);
    setShowTryOnWidget(true);
  }

  function handleCloseTryOn() {
    setShowTryOnWidget(false);
  }

  useEffect(() => {
    if (!showTryOnWidget) return undefined;
    function onKeyDown(e) {
      if (e.key === "Escape") handleCloseTryOn();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showTryOnWidget]);

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
          <div className="media-grid" aria-label="Product photos">
            {PRODUCT_DETAIL.media.map((media) => (
              <div key={media.id} className="hero-media">
                <img src={`${import.meta.env.BASE_URL}${media.asset}`} alt={media.label} className="hero-image" />
                <button className="primary-cta primary-cta--overlay" type="button" onClick={() => handleOpenTryOn(media)}>
                  {media.tryOnCtaLabel || "Experimenta agora"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="details-column">
          <h1>{PRODUCT_DETAIL.title}</h1>
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
        <div className="widget-overlay" role="dialog" aria-modal="true" aria-label="Virtual Try-On">
          <div className="widget-overlay__backdrop" onClick={handleCloseTryOn} aria-hidden="true" />
          <div className="widget-overlay__panel">
            <VirtualTryOnWidget selectedProduct={activeProduct} onClose={handleCloseTryOn} />
          </div>
        </div>
      ) : null}
    </main>
  );
}

