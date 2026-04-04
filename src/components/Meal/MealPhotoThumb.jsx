import React, { useRef, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useMealPhotos } from '../../hooks/useMealPhotos';

export default function MealPhotoThumb({ mealId, photo = null, size = 'md', editable = false, onSaved }) {
  const { t } = useLanguage();
  const { savePhoto } = useMealPhotos();
  const [current, setCurrent] = useState(photo);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl text-xl',
    md: 'w-14 h-14 rounded-2xl text-2xl',
    lg: 'w-20 h-20 rounded-2xl text-4xl',
  }[size];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const thumb = await savePhoto(mealId, file);
    if (thumb) { setCurrent(thumb); onSaved?.(thumb); }
    setLoading(false);
  };

  // Show existing photo
  if (current) {
    return (
      <div className={`relative flex-shrink-0 ${sizeClasses} overflow-hidden`}>
        <img src={current} alt="" className="w-full h-full object-cover" />
        {editable && (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
          </>
        )}
      </div>
    );
  }

  // No photo, not editable
  if (!editable) {
    return (
      <div className={`flex-shrink-0 bg-gray-100 flex items-center justify-center ${sizeClasses}`}>
        <span>🍽️</span>
      </div>
    );
  }

  // Add photo button
  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={`flex-shrink-0 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-emerald-400
          flex flex-col items-center justify-center gap-0.5 transition-all ${sizeClasses}`}
        title={t('meal.add_photo')}
      >
        {loading
          ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/>
          : <>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {size !== 'sm' && <span className="text-xs text-gray-400 leading-none">Foto</span>}
            </>
        }
      </button>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile}/>
    </>
  );
}
