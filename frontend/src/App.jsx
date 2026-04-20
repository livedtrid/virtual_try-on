import TryOnWidget from "./components/TryOnWidget";
import { PRODUCTS } from "./components/ProductSelector";

export default function App() {
  const featuredProduct = PRODUCTS[0];

  return (
    <main className="page">
      <section className="card product-card">
        <p className="eyebrow">Mock PDP</p>
        <h1>Urban {featuredProduct.label} 2026</h1>
        <img
          src={`${import.meta.env.BASE_URL}${featuredProduct.asset}`}
          alt={`Mock product ${featuredProduct.label.toLowerCase()}`}
          className="product-image"
        />
        <button className="primary-cta" type="button">
          Experimentar agora
        </button>
      </section>

      <section className="card">
        <TryOnWidget />
      </section>
    </main>
  );
}

