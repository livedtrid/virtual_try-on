const PRODUCTS = [
  { id: "sweater", label: "Sweater", asset: "products/sweater.jpg" },
  { id: "trousers", label: "Trousers", asset: "products/trousers.jpg" },
];

export default function ProductSelector({ value, onChange }) {
  return (
    <div>
      <label htmlFor="product-selector">Select product</label>
      <select id="product-selector" value={value} onChange={(event) => onChange(event.target.value)}>
        {PRODUCTS.map((product) => (
          <option key={product.id} value={product.id}>
            {product.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { PRODUCTS };

