const FAQS = [
  { q: 'Is it really free to register?', a: 'Yes, it is completely free to register — no hidden sign-up fees.' },
  { q: 'Do I have to make a purchase, or is there a required minimum order?', a: 'No, not at all. When you create an account, there is no minimum order requirement, and you are not obligated to make any purchase.' },
  { q: 'How do grocery reward points work?', a: 'Orders worth £50 or more earn reward points — 50p in reward value for every £50 your order is worth (so a £100 order earns £1). Points build up in your account and become redeemable for money off once you\'ve accumulated £1.' },
  { q: 'Is delivery free?', a: 'Yes — delivery is free on every order of £100 or more within the UK. Smaller orders have a standard delivery charge, shown at checkout.' },
  { q: 'How long does delivery take?', a: 'Standard delivery within the UK is 2–3 working days. Standard delivery within Ireland is 3–5 working days.' },
  { q: 'Can I check out without creating an account?', a: 'Yes — guest checkout is available for every order, or you can create a free account to track order history and earn reward points.' },
  { q: 'What payment methods do you accept?', a: 'We accept PayPal, Mastercard, Visa, Apple Pay, and direct bank transfer.' },
];

export default function FAQ() {
  return (
    <section className="section" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="eyebrow">Support</div>
      <h1 style={{ fontSize: 36, margin: '14px 0 30px', color: 'var(--pantry)' }}>Frequently Asked Questions</h1>
      <div className="faq-list">
        {FAQS.map((f) => (
          <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
        ))}
      </div>
    </section>
  );
}
