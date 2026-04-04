import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { fetchByBarcode, searchByName, scaleToGrams } from '../../services/openFoodFacts';

// ZXing is loaded via CDN fallback; also works via npm @zxing/library
let BrowserMultiFormatReader;
async function getReader() {
  if (BrowserMultiFormatReader) return new BrowserMultiFormatReader();
  try {
    const mod = await import('@zxing/library');
    BrowserMultiFormatReader = mod.BrowserMultiFormatReader;
  } catch {
    throw new Error('Barkod kütüphanesi yüklenemedi. npm install @zxing/library çalıştırın.');
  }
  return new BrowserMultiFormatReader();
}

const PHASE = { SCAN: 'scan', SEARCHING: 'searching', FOUND: 'found', NOT_FOUND: 'not_found', MANUAL: 'manual' };

export default function BarcodeScanner({ onResult, onClose }) {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [phase, setPhase] = useState(PHASE.SCAN);
  const [product, setProduct] = useState(null);
  const [portionGrams, setPortionGrams] = useState(100);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadErr, setLoadErr] = useState(null);

  // Start ZXing scanner
  useEffect(() => {
    if (phase !== PHASE.SCAN) return;
    let active = true;

    (async () => {
      try {
        const reader = await getReader();
        readerRef.current = reader;
        if (!active || !videoRef.current) return;
        await reader.decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
          if (!result || !active) return;
          reader.reset();
          setPhase(PHASE.SEARCHING);
          const found = await fetchByBarcode(result.getText());
          if (!active) return;
          if (found) {
            setProduct(found);
            setPortionGrams(parseInt(found.servingSize) || 100);
            setPhase(PHASE.FOUND);
          } else {
            setPhase(PHASE.NOT_FOUND);
          }
        });
      } catch (e) {
        if (active) setLoadErr(e.message);
      }
    })();

    return () => {
      active = false;
      try { readerRef.current?.reset(); } catch (_) {}
    };
  }, [phase]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const results = await searchByName(query);
    setSearchResults(results);
    setSearching(false);
  };

  const selectProduct = (p) => {
    setProduct(p);
    setPortionGrams(parseInt(p.servingSize) || 100);
    setPhase(PHASE.FOUND);
  };

  const handleConfirm = () => {
    if (!product) return;
    const scaled = scaleToGrams(product, portionGrams);
    onResult({ ...scaled, name: product.name, icon: '🏷️', timestamp: Date.now() });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe-top py-3 text-white flex-shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h2 className="text-base font-bold">{t('barcode.title')}</h2>
        <button onClick={() => setPhase(PHASE.MANUAL)} className="text-sm text-emerald-400 font-semibold px-2 py-1 rounded-lg hover:bg-white/10">
          {t('barcode.manual_search')}
        </button>
      </div>

      {/* Camera view */}
      {(phase === PHASE.SCAN || phase === PHASE.SEARCHING) && (
        <div className="flex-1 relative overflow-hidden">
          {loadErr ? (
            <div className="flex flex-col items-center justify-center h-full text-white gap-4 px-6">
              <span className="text-5xl">⚠️</span>
              <p className="text-center text-sm text-gray-300">{loadErr}</p>
              <button onClick={() => setPhase(PHASE.MANUAL)} className="px-5 py-2.5 bg-emerald-500 rounded-2xl font-semibold text-sm">
                {t('barcode.manual_search')}
              </button>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
              {/* Viewfinder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-44">
                  <div className="absolute inset-0 border-2 border-emerald-400/50 rounded-xl" />
                  {['tl','tr','bl','br'].map(c => (
                    <div key={c} className={`absolute w-7 h-7 border-emerald-400
                      ${c==='tl'?'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl':''}
                      ${c==='tr'?'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl':''}
                      ${c==='bl'?'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl':''}
                      ${c==='br'?'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl':''}`}
                    />
                  ))}
                  {phase === PHASE.SEARCHING && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                      <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-10 left-0 right-0 text-center">
                <span className="text-white text-sm bg-black/40 px-4 py-2 rounded-full">
                  {phase === PHASE.SEARCHING ? t('barcode.scanning') : t('barcode.align')}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Manual Search */}
      {phase === PHASE.MANUAL && (
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input
                autoFocus
                type="text" value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('barcode.search_placeholder')}
                className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm"
              />
              <button type="submit" disabled={searching}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold text-sm disabled:opacity-50 transition-colors">
                {searching ? '…' : t('barcode.search_button')}
              </button>
            </form>
            <p className="text-xs text-center text-gray-400 mb-3">{t('barcode.source')}</p>

            <div className="space-y-2">
              {searchResults.map((p, i) => (
                <button key={p.barcode || i} onClick={() => selectProduct(p)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 text-left border border-gray-100 transition-colors">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-14 h-14 object-contain rounded-xl bg-gray-100 flex-shrink-0"/>
                    : <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">🏷️</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    {p.brand && <p className="text-xs text-gray-400 truncate">{p.brand}</p>}
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">{p.calories} kcal <span className="font-normal text-gray-400">{t('barcode.per_100g')}</span></p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product found */}
      {phase === PHASE.FOUND && product && (
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-5">
            {/* Product header */}
            <div className="flex items-start gap-4 mb-5">
              {product.image
                ? <img src={product.image} alt={product.name} className="w-20 h-20 object-contain rounded-2xl bg-gray-50 border border-gray-100 flex-shrink-0"/>
                : <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-4xl flex-shrink-0">🏷️</div>
              }
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-base leading-tight">{product.name}</h3>
                {product.brand && <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>}
                <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium">
                  ✓ {t('barcode.found')}
                </span>
              </div>
            </div>

            {/* Portion slider */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Porsiyon</span>
                <span className="text-xl font-black text-emerald-600">{portionGrams}g</span>
              </div>
              <input type="range" min="10" max="500" step="5"
                value={portionGrams}
                onChange={e => setPortionGrams(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Macros grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {[
                { label: t('nutrition.calories'), val: Math.round(product.calories * portionGrams / 100), unit: 'kcal', cls: 'bg-orange-50 text-orange-600' },
                { label: t('nutrition.protein'),  val: r1(product.protein  * portionGrams / 100), unit: 'g', cls: 'bg-blue-50 text-blue-600' },
                { label: t('nutrition.carbs'),    val: r1(product.carbs    * portionGrams / 100), unit: 'g', cls: 'bg-yellow-50 text-yellow-600' },
                { label: t('nutrition.fat'),      val: r1(product.fat      * portionGrams / 100), unit: 'g', cls: 'bg-red-50 text-red-500' },
              ].map(item => (
                <div key={item.label} className={`rounded-2xl p-3.5 ${item.cls}`}>
                  <p className="text-xs opacity-70 mb-0.5">{item.label}</p>
                  <p className="text-xl font-black leading-none">{item.val} <span className="text-xs font-normal">{item.unit}</span></p>
                </div>
              ))}
            </div>

            {/* Micros */}
            {(product.fiber > 0 || product.sodium > 0 || product.vitaminC > 0) && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2.5">{t('nutrition.micros')}</p>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-sm">
                  {[
                    { label: t('nutrition.fiber'),     val: r1(product.fiber     * portionGrams / 100), unit: 'g' },
                    { label: t('nutrition.sodium'),    val: Math.round(product.sodium    * portionGrams / 100), unit: 'mg' },
                    { label: t('nutrition.potassium'), val: Math.round(product.potassium * portionGrams / 100), unit: 'mg' },
                    { label: t('nutrition.calcium'),   val: Math.round(product.calcium   * portionGrams / 100), unit: 'mg' },
                    { label: t('nutrition.iron'),      val: r1(product.iron      * portionGrams / 100), unit: 'mg' },
                    { label: t('nutrition.vitamin_c'), val: r1(product.vitaminC  * portionGrams / 100), unit: 'mg' },
                  ].filter(m => m.val > 0).map(m => (
                    <div key={m.label} className="flex justify-between text-gray-600">
                      <span className="text-xs text-gray-500">{m.label}</span>
                      <span className="text-xs font-semibold">{m.val}{m.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleConfirm}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-lg transition-colors">
              Ekle — {Math.round(product.calories * portionGrams / 100)} kcal
            </button>
          </div>
        </div>
      )}

      {/* Not found */}
      {phase === PHASE.NOT_FOUND && (
        <div className="flex-1 flex flex-col items-center justify-center text-white gap-4 px-8">
          <div className="text-6xl">😕</div>
          <p className="text-xl font-bold">{t('barcode.not_found')}</p>
          <p className="text-sm text-gray-400 text-center">{t('barcode.not_found_detail')}</p>
          <div className="flex gap-3 w-full">
            <button onClick={() => setPhase(PHASE.SCAN)} className="flex-1 py-3 border-2 border-white/30 rounded-2xl font-semibold text-sm">
              Tekrar Tara
            </button>
            <button onClick={() => setPhase(PHASE.MANUAL)} className="flex-1 py-3 bg-emerald-500 rounded-2xl font-semibold text-sm">
              {t('barcode.manual_search')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function r1(v) { return Math.round(v * 10) / 10; }
