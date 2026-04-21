import { PRODUCT_DETAIL } from "../products";

export default function ProductSelector({ value, onChange }) {
  return (
    <div>
      <label htmlFor="product-selector">Select product</label>
      <select id="product-selector" value={value} onChange={(event) => onChange(event.target.value)}>
        {PRODUCT_DETAIL.media.map((media) => (
          <option key={media.id} value={media.id}>
            {media.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { PRODUCT_DETAIL };

