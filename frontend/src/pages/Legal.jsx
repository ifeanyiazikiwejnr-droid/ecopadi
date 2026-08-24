import { useParams } from 'react-router-dom';

const PAGES = {
  terms: {
    title: 'Terms & Conditions',
    body: `This page is a placeholder. Your real Terms & Conditions document wasn't attached yet —
      once you send it over, this content will be replaced with your actual policy text
      (word-for-word, formatted for the web).`,
  },
  returns: {
    title: 'Returns & Refund Policy',
    body: `This page is a placeholder for your Returns & Refund Policy. Send over the document
      you have and it will be dropped in here in full.`,
  },
  privacy: {
    title: 'Privacy Policy',
    body: `This page is a placeholder for your Privacy Policy. Because the site collects customer
      accounts, order history and payment references, this page legally needs your real,
      reviewed policy text before the site goes live — please share the document you have.`,
  },
};

export default function Legal() {
  const { page } = useParams();
  const content = PAGES[page] || PAGES.terms;

  return (
    <section className="section" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="eyebrow">Legal</div>
      <h1 style={{ fontSize: 34, margin: '14px 0 20px', color: 'var(--pantry)' }}>{content.title}</h1>
      <div className="card" style={{ padding: 24, borderColor: 'rgba(178,58,46,0.3)', background: 'rgba(178,58,46,0.05)' }}>
        <span className="badge badge-placeholder">Placeholder — awaiting your document</span>
        <p className="muted" style={{ marginTop: 14, lineHeight: 1.7 }}>{content.body}</p>
      </div>
    </section>
  );
}
