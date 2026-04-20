export default function ImageUploader({ onFileChange, previewUrl }) {
  return (
    <div>
      <label htmlFor="person-image">Upload your image</label>
      <input
        id="person-image"
        type="file"
        accept="image/*"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
      />
      {previewUrl ? <img className="preview" src={previewUrl} alt="Person preview" /> : null}
    </div>
  );
}

