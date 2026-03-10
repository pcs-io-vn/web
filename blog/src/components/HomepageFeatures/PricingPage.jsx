import React, { useState } from 'react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    emoji: '🌱',
    priceVND: '365,000',
    priceUSD: '14.99',
    tagline: 'Keep your device safe & updated',
    highlight: false,
    paypalLink: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-8NF75640KE862722RNGXIUKI',
    acbContent: 'PCS TraiNghiem',
  },
  {
    id: 'peace',
    name: 'Peace of Mind',
    emoji: '🛡️',
    priceVND: '999,000',
    priceUSD: '39.99',
    tagline: 'Support when you need it most',
    highlight: true,
    paypalLink: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-2VY35053U2778302PNGXIZTY',
    acbContent: 'PCS AnTam',
  },
  {
    id: 'fullcare',
    name: 'Full Care',
    emoji: '⭐',
    priceVND: '1,999,000',
    priceUSD: '79.99',
    tagline: 'Full priority support, always',
    highlight: false,
    paypalLink: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-71852329KJ631745YNGXI2CQ',
    acbContent: 'PCS ChamSoc',
  },
];

const features = [
  {
    category: 'Core',
    items: [
      { label: 'Automatic security patch updates', starter: true, peace: true, fullcare: true },
      { label: 'Action1 agent initial setup', starter: true, peace: true, fullcare: true },
      { label: 'Email support', starter: true, peace: true, fullcare: true },
    ],
  },
  {
    category: 'Remote Support',
    items: [
      { label: 'Remote technical support hours/year', starter: '—', peace: '5 hrs', fullcare: '10 hrs' },
      { label: 'Max per session', starter: '—', peace: '1 hr', fullcare: '1 hr' },
      { label: 'Priority response time', starter: '—', peace: 'Best effort', fullcare: '1–2 working hrs' },
    ],
  },
  {
    category: 'Device Health',
    items: [
      { label: 'Annual device check-up & optimization', starter: '—', peace: '1× / year', fullcare: '2× / year' },
      { label: 'Check-up counts toward support hours', starter: '—', peace: false, fullcare: false },
    ],
  },
  {
    category: 'On-site (Ho Chi Minh City)',
    items: [
      { label: 'On-site visit available', starter: true, peace: true, fullcare: true },
      { label: 'On-site fee', starter: '+150k–250k ₫', peace: '+150k–250k ₫', fullcare: '+150k–250k ₫' },
    ],
  },
  {
    category: 'Billing',
    items: [
      { label: 'Billing cycle', starter: '12 months', peace: '12 months', fullcare: '12 months' },
      { label: 'Auto-renewal', starter: true, peace: true, fullcare: true },
      { label: 'Cancel anytime', starter: true, peace: true, fullcare: true },
      { label: '7-day full refund', starter: true, peace: true, fullcare: true },
    ],
  },
];

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ display: 'inline' }}>
      <circle cx="9" cy="9" r="9" fill="#16a34a" opacity="0.12" />
      <path d="M5 9.5l3 3 5-5.5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ display: 'inline' }}>
      <circle cx="9" cy="9" r="9" fill="#94a3b8" opacity="0.12" />
      <path d="M6 6l6 6M12 6l-6 6" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FeatureValue({ value }) {
  if (value === true) return <CheckIcon />;
  if (value === false) return <CrossIcon />;
  if (value === '—') return <span style={{ color: '#94a3b8', fontSize: '1.1rem' }}>—</span>;
  return <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{value}</span>;
}

export default function PricingPage() {
  const [lang, setLang] = useState('en');

  const t = {
    en: {
      title: 'Simple, honest pricing',
      sub: 'One annual fee. No hidden charges. Cancel anytime.',
      perYear: '/ year',
      popular: 'Most Popular',
      paypal: '▶ Subscribe with PayPal',
      acb: '🏦 Pay via ACB Bank Transfer',
      acbNote: (content) => `Content: "${content} [your name]"`,
      compare: 'Compare all features',
      note: 'All plans auto-renew annually. 7-day full refund if unused. On-site service limited to Ho Chi Minh City.',
      tos: 'Terms of Service',
      privacy: 'Privacy Policy',
      contact: 'Need help choosing?',
    },
    vi: {
      title: 'Bảng giá rõ ràng, không ẩn phí',
      sub: 'Một mức phí hàng năm. Không phí ẩn. Hủy bất cứ lúc nào.',
      perYear: '/ năm',
      popular: 'Phổ biến nhất',
      paypal: '▶ Đăng ký qua PayPal',
      acb: '🏦 Chuyển khoản ACB',
      acbNote: (content) => `Nội dung: "${content} [tên của bạn]"`,
      compare: 'So sánh chi tiết các gói',
      note: 'Tất cả gói tự động gia hạn hàng năm. Hoàn tiền 100% trong 7 ngày nếu chưa dùng. Hỗ trợ tại chỗ chỉ tại TP.HCM.',
      tos: 'Điều khoản dịch vụ',
      privacy: 'Chính sách bảo mật',
      contact: 'Cần tư vấn thêm?',
    },
  };

  const tx = t[lang];

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      maxWidth: 1100,
      margin: '0 auto',
      padding: '3rem 1.5rem 5rem',
      color: '#111827',
    }}>

      {/* Lang toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem', gap: 8 }}>
        {['en', 'vi'].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: '4px 14px',
            borderRadius: 20,
            border: '1.5px solid',
            borderColor: lang === l ? '#2563eb' : '#d1d5db',
            background: lang === l ? '#2563eb' : 'transparent',
            color: lang === l ? '#fff' : '#6b7280',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}>{l.toUpperCase()}</button>
        ))}
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          margin: '0 0 0.75rem',
          color: '#0f172a',
        }}>{tx.title}</h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>{tx.sub}</p>
      </div>

      {/* Plan Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '4rem',
        alignItems: 'start',
      }}>
        {plans.map(plan => (
          <div key={plan.id} style={{
            borderRadius: 20,
            border: plan.highlight ? '2px solid #2563eb' : '1.5px solid #e5e7eb',
            background: plan.highlight ? 'linear-gradient(145deg, #eff6ff, #fff)' : '#fff',
            padding: '2rem',
            position: 'relative',
            boxShadow: plan.highlight ? '0 8px 32px rgba(37,99,235,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = plan.highlight
                ? '0 16px 48px rgba(37,99,235,0.18)'
                : '0 8px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = plan.highlight
                ? '0 8px 32px rgba(37,99,235,0.12)'
                : '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            {plan.highlight && (
              <div style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#2563eb',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 16px',
                borderRadius: 20,
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>{tx.popular}</div>
            )}

            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{plan.emoji}</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#0f172a' }}>
              {plan.name}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.5rem' }}>{plan.tagline}</p>

            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                  {lang === 'vi' ? `${plan.priceVND} ₫` : `$${plan.priceUSD}`}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{tx.perYear}</span>
              </div>
              {lang === 'vi' && (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>(${plan.priceUSD} USD)</div>
              )}
            </div>

            {/* PayPal button */}
            <a href={plan.paypalLink} target="_blank" rel="noopener noreferrer" style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.7rem 1rem',
              borderRadius: 10,
              background: plan.highlight ? '#2563eb' : '#0f172a',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              marginBottom: '0.75rem',
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >{tx.paypal}</a>

            {/* ACB */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '0.75rem 1rem',
              fontSize: '0.82rem',
              color: '#374151',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{tx.acb}</div>
              <div style={{ color: '#64748b' }}>ACB – 20699307 – HỒNG BẢO NGÂN</div>
              <div style={{ color: '#94a3b8', marginTop: 2, fontStyle: 'italic' }}>{tx.acbNote(plan.acbContent)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#0f172a',
          letterSpacing: '-0.02em',
        }}>{tx.compare}</h2>

        <div style={{ overflowX: 'auto', borderRadius: 16, border: '1.5px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, width: '40%' }}></th>
                {plans.map(p => (
                  <th key={p.id} style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: p.highlight ? '#2563eb' : '#0f172a',
                    borderLeft: '1px solid #e5e7eb',
                  }}>
                    {p.emoji} {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((group, gi) => (
                <React.Fragment key={gi}>
                  <tr>
                    <td colSpan={4} style={{
                      padding: '0.6rem 1.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: '#f8fafc',
                      borderTop: gi > 0 ? '1px solid #e5e7eb' : 'none',
                    }}>{group.category}</td>
                  </tr>
                  {group.items.map((item, ii) => (
                    <tr key={ii} style={{
                      background: ii % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <td style={{
                        padding: '0.85rem 1.25rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        borderTop: '1px solid #f1f5f9',
                      }}>{item.label}</td>
                      {(['starter', 'peace', 'fullcare']).map(key => (
                        <td key={key} style={{
                          padding: '0.85rem',
                          textAlign: 'center',
                          borderTop: '1px solid #f1f5f9',
                          borderLeft: '1px solid #f1f5f9',
                          background: plans.find(p => p.id === key)?.highlight ? 'rgba(37,99,235,0.02)' : 'transparent',
                        }}>
                          <FeatureValue value={item[key]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <div style={{
        textAlign: 'center',
        padding: '1.5rem 2rem',
        background: '#f8fafc',
        borderRadius: 14,
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
      }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#64748b' }}>{tx.note}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a href="/tos" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none' }}>{tx.tos}</a>
          <a href="/privacy" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none' }}>{tx.privacy}</a>
          <a href="https://wa.me/84977733339" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none' }}>
            💬 {tx.contact}
          </a>
        </div>
      </div>
    </div>
  );
}