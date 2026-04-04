import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useLanguage } from '../../hooks/useLanguage';
import { analyzeFood, analyzeFoodByText, rescaleNutrition } from '../../services/aiService';
import { useMealPhotos } from '../../hooks/useMealPhotos';
import PortionEstimator from '../Analysis/PortionEstimator';
import ResultModal from '../Analysis/ResultModal';
import BarcodeScanner from '../Barcode/BarcodeScanner';

const MODE = { IDLE: 'idle', CAMERA: 'camera', VOICE: 'voice', BARCODE: 'barcode' };
const STATUS = { IDLE: 'idle', ANALYZING: 'analyzing', PORTION: 'portion', RESULT: 'result', ERROR: 'error' };

export default function CameraView({ onMealAdded }) {
  const { t, lang } = useLanguage();
  const { savePhoto } = useMealPhotos();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode]         = useState(MODE.IDLE);
  const [status, setStatus]     = useState(STATUS.IDLE);
  const [rawResult, setRaw]     = useState(null);
  const [capturedImg, setCap]   = useState(null);
  const [voiceText, setVT]      = useState('');
  const [error, setError]       = useState('');
  const [listening, setListen]  = useState(false);
  const [facingMode, setFacing] = useState('environment'); // ön/arka kamera

  // ── Analyze image ────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async (dataURL, mediaType = 'image/jpeg') => {
    setStatus(STATUS.ANALYZING);
    setCap(dataURL);
    try {
      const [, base64] = dataURL.split(',');
      const result = await analyzeFood(base64, mediaType, lang);
      setRaw(result);
      setStatus(STATUS.PORTION);
    } catch (e) {
      setError(e.message);
      setStatus(STATUS.ERROR);
    }
  }, [lang]);

  // ── Capture from webcam ──────────────────────────────────────────────────
  const handleCapture = useCallback(() => {
    const dataURL = webcamRef.current?.getScreenshot();
    if (!dataURL) return;
    setMode(MODE.IDLE);
    runAnalysis(dataURL);
  }, [runAnalysis]);

  // ── Gallery upload ────────────────────────────────────────────────────────
  const handleGallery = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => runAnalysis(ev.target.result, file.type);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Voice / text analysis ────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';
    rec.onstart  = () => setListen(true);
    rec.onend    = () => setListen(false);
    rec.onresult = (e) => setVT(e.results[0][0].transcript);
    rec.start();
  };

  const handleVoiceAnalyze = async () => {
    if (!voiceText.trim()) return;
    setMode(MODE.IDLE);
    setStatus(STATUS.ANALYZING);
    setCap(null);
    try {
      const result = await analyzeFoodByText(voiceText, lang);
      setRaw(result);
      setStatus(STATUS.PORTION);
    } catch (e) {
      setError(e.message);
      setStatus(STATUS.ERROR);
    }
  };

  // ── Portion confirmed ────────────────────────────────────────────────────
  const handlePortionConfirm = async (grams) => {
    const meal = rescaleNutrition(rawResult, rawResult.portionEstimateGrams, grams);
    // Save photo if available
    let photoThumb = null;
    if (capturedImg) {
      const mealId = `meal_${Date.now()}`;
      photoThumb = await savePhoto(mealId, capturedImg);
      meal.id = mealId;
    }
    meal.photo = photoThumb;
    meal.timestamp = Date.now();
    setRaw(meal);
    setStatus(STATUS.RESULT);
  };

  // ── Add to meals ──────────────────────────────────────────────────────────
  const handleAddMeal = () => {
    onMealAdded?.(rawResult);
    reset();
  };

  // ── Barcode result ────────────────────────────────────────────────────────
  const handleBarcodeResult = (product) => {
    setMode(MODE.IDLE);
    onMealAdded?.({ ...product, timestamp: Date.now() });
  };

  const reset = () => {
    setStatus(STATUS.IDLE); setRaw(null); setCap(null); setError(''); setVT('');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Input buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode(MODE.CAMERA)}
          className="flex items-center justify-center gap-2.5 py-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-all"
        >
          <span className="text-2xl">📷</span>
          <span>{t('camera.take_photo')}</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2.5 py-[22px] rounded-2xl bg-gray-800 border-2 border-gray-700 text-white font-semibold shadow-md hover:bg-gray-700 hover:scale-[1.03] active:scale-95 transition-all"
        >
          <span className="text-[26px] leading-none">🖼️</span>
          <span>{t('camera.gallery')}</span>
        </button>
        <button
          onClick={() => setMode(MODE.BARCODE)}
          className="flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-semibold active:scale-95 transition-all hover:border-emerald-300"
        >
          <span className="text-2xl">📊</span>
          <span>{t('camera.barcode')}</span>
        </button>
        <button
          onClick={() => setMode(MODE.VOICE)}
          className="flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-semibold active:scale-95 transition-all hover:border-emerald-300"
        >
          <span className="text-2xl">🎤</span>
          <span>{t('camera.voice')}</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGallery}/>

      {/* Analyzing overlay */}
      {status === STATUS.ANALYZING && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-5">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"/>
          <p className="text-white font-bold text-lg">{t('camera.analyzing')}</p>
          <p className="text-gray-400 text-sm">{t('camera.analyzing_detail')}</p>
        </div>
      )}

      {/* Error */}
      {status === STATUS.ERROR && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-700">{t('common.error')}</p>
            <p className="text-sm text-red-500 mt-0.5">{error}</p>
            <button onClick={reset} className="text-sm text-red-600 font-semibold mt-2 underline">
              {t('common.retry')}
            </button>
          </div>
        </div>
      )}

      {/* Camera modal */}
      {mode === MODE.CAMERA && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-safe-top py-3 text-white flex-shrink-0">
            <button onClick={() => setMode(MODE.IDLE)} className="p-2.5 rounded-full hover:bg-white/10 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <span className="font-semibold">{t('camera.take_photo')}</span>
            {/* Kamera çevirme butonu — sağ üst */}
            <button
              onClick={() => setFacing(f => f === 'environment' ? 'user' : 'environment')}
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/30 shadow-md transition-all hover:scale-110 active:scale-95"
              title="Kamerayı Çevir"
            >
              {/* Çevirme ikonu: iki ok çember */}
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Webcam */}
          <div className="flex-1 relative overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.85}
              videoConstraints={{ facingMode, width: 1280, height: 720 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Bottom: galeri kısayolu + çekim butonu */}
          <div className="flex items-center justify-between px-10 py-8 flex-shrink-0">
            {/* Galeri kısayolu */}
            <button
              onClick={() => { setMode(MODE.IDLE); fileInputRef.current?.click(); }}
              className="w-14 h-14 rounded-2xl bg-white/20 hover:bg-white/35 border-2 border-white/30 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              title={t('camera.gallery')}
            >
              <span className="text-2xl">🖼️</span>
            </button>

            {/* Çekim butonu */}
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full bg-white border-4 border-emerald-400 shadow-xl flex items-center justify-center active:scale-90 transition-transform"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-400"/>
            </button>

            {/* Sağ boşluk dengeleme */}
            <div className="w-14"/>
          </div>
        </div>
      )}

      {/* Voice modal */}
      {mode === MODE.VOICE && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{t('voice.title')}</h3>
                <p className="text-purple-200 text-sm">{t('voice.or_type')}</p>
              </div>
              <button onClick={() => setMode(MODE.IDLE)} className="p-2 rounded-full hover:bg-white/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={startListening}
                className={`w-full flex flex-col items-center py-6 rounded-2xl border-2 transition-all
                  ${listening
                    ? 'border-purple-400 bg-purple-50 animate-pulse'
                    : 'border-gray-200 hover:border-purple-300'
                  }`}
              >
                <span className="text-5xl mb-2">{listening ? '🎙️' : '🎤'}</span>
                <span className="text-sm font-medium text-gray-600">
                  {listening ? t('voice.listening') : t('voice.tap_to_start')}
                </span>
              </button>

              <textarea
                value={voiceText}
                onChange={e => setVT(e.target.value)}
                placeholder={t('voice.placeholder')}
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none resize-none text-sm"
              />

              <button
                onClick={handleVoiceAnalyze}
                disabled={!voiceText.trim()}
                className="w-full py-3.5 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-2xl transition-colors"
              >
                {t('voice.analyze')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode scanner */}
      {mode === MODE.BARCODE && (
        <BarcodeScanner
          onResult={handleBarcodeResult}
          onClose={() => setMode(MODE.IDLE)}
        />
      )}

      {/* Portion estimator */}
      {status === STATUS.PORTION && rawResult && (
        <PortionEstimator
          mealName={rawResult.name}
          aiEstimate={rawResult.portionEstimateGrams}
          onConfirm={handlePortionConfirm}
          onCancel={reset}
        />
      )}

      {/* Result modal */}
      {status === STATUS.RESULT && rawResult && (
        <ResultModal
          result={rawResult}
          photo={capturedImg}
          onAdd={handleAddMeal}
          onClose={reset}
        />
      )}
    </div>
  );
}
