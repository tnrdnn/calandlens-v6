import React, { useState } from 'react';

// strings shape:
// { label, title, sub, monthlyBadge, yearlyBadge, popular, saveTag,
//   plans: [{ name, price, period, highlight, cta, features:[{text,ok}] }] }

export default function PricingSection({ strings, dark = false, onCta }) {
  const [hover, setHover] = useState(null);

  const base  = dark ? 'bg-gray-950 text-white'    : 'bg-white text-gray-900';
  const card  = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const muted = dark ? 'text-gray-400'              : 'text-gray-500';

  return (
    <section id="pricing" className={`${base} py-24`}>
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-emerald-500 font-semibold text-sm mb-2 uppercase tracking-wider">
            {strings.label}
          </p>
          <h2 className={`text-4xl font-black mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
            {strings.title}
          </h2>
          <p className={`text-lg ${muted}`}>{strings.sub}</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {strings.plans.map((plan, i) => (
            <div
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={`relative rounded-3xl border-2 p-7 flex flex-col transition-all duration-200 ${
                plan.highlight
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 scale-105'
                  : `${card} border ${hover === i ? 'border-emerald-400' : ''}`
              }`}
              style={plan.highlight && !dark ? { background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' } : {}}
            >
              {/* Popular badge */}
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow">
                    {strings.popular}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-5">
                <p className={`text-sm font-bold mb-1 ${plan.highlight ? 'text-emerald-500' : muted}`}>
                  {plan.name}
                </p>

                {/* Price */}
                <div className="flex items-end gap-1">
                  <span className={`text-5xl font-black ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm mb-2 ${muted}`}>{plan.period}</span>
                  )}
                </div>

                {/* Save tag */}
                {plan.saveTag && (
                  <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                    {plan.saveTag}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span className={`flex-shrink-0 mt-0.5 text-base ${f.ok ? 'text-emerald-500' : (dark ? 'text-gray-700' : 'text-gray-300')}`}>
                      {f.ok ? '✓' : '✕'}
                    </span>
                    <span className={`text-sm leading-snug ${f.ok ? (dark ? 'text-gray-200' : 'text-gray-700') : (dark ? 'text-gray-600' : 'text-gray-400')}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => onCta?.(plan)}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all ${
                  plan.highlight
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : dark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className={`text-center text-xs ${muted} mt-10`}>{strings.note}</p>
      </div>
    </section>
  );
}
