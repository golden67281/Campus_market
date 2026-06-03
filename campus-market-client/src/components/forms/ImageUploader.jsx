import { useDropzone } from 'react-dropzone';

export default function ImageUploader({ images, onAdd, onRemove }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 6 - images.length,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: onAdd,
  });

  return (
    <div className="space-y-3">
      {images.length < 6 && (
        <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition">
          <input {...getInputProps()} />
          <p className="text-gray-500 text-sm">📸 Drag & drop or <span className="text-indigo-600 font-medium">browse</span></p>
          <p className="text-xs text-gray-400 mt-1">Up to 6 images, max 5MB each</p>
        </div>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square">
              <img src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                className="w-full h-full object-cover rounded-lg" alt="" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded">Cover</span>
              )}
              <button onClick={() => onRemove(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
