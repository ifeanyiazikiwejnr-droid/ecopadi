import { useParams } from 'react-router-dom';

const PLACEHOLDER_PAGES = {
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
};

const PRIVACY_SECTIONS = [
  {
    heading: 'What does this policy cover?',
    paragraphs: [
      "This policy describes the Company's processing of your personal data.",
      'References in this policy to the Company, we or us shall mean Ecopadi UK Ltd with registration number: 17215991.',
      'For the purposes of applicable data protection law (including UK GDPR, the Data Protection Act 2018, and the General Data Protection Regulation 2016/679), the Company is the data controller of your personal data.',
    ],
  },
  {
    heading: 'What personal data is collected?',
    paragraphs: [
      'The following categories of personal data will be collected about you in connection with this policy.',
      '1. Personal data collected from you: depending on how you interact with Ecopadi UK — filling out the VIP Customer registration form, registering a minor child as a Customer, purchasing products, subscribing to newsletters, participating in discussion boards or social media features, entering a competition or survey, or otherwise contacting Customer Services:',
    ],
    bullets: [
      'name *',
      'user name *',
      'date of birth',
      'postal address *',
      'product delivery address *',
      'email address *',
      'phone number and mobile phone number',
      'your password *',
    ],
    afterBullets: [
      'The fields above marked with a (*) are mandatory — if you do not provide this personal data, the Company will not be able to fulfil the applicable purposes described in this notice. For example, if you do not provide your postal address, we may not be able to deliver your order to you.',
      '2. Personal data collected about you: your purchase history, product preferences and how often you shop with us; if you register via a third-party platform (Facebook, Apple, Google) we may automatically receive personal data from that provider (see Appendix 1); technical information from each visit to the website (IP address, browser type, time-zone, operating system); information about your visit (pages viewed, search queries, click-through behaviour, cookies); opinions or statements you post on discussion boards, social media or in communications with us; and data needed to analyse the effectiveness of our communications with you (email, SMS, WhatsApp and similar, and push notifications).',
      "If you are a parent or guardian of a minor who registers as a Customer, we process the phone number provided by the child. Where the Company requires personal data to conclude a contract or fulfil a legal obligation, providing that data is mandatory — without it, we may not be able to establish or manage that relationship, or fulfil our obligations. We will always explain which fields are mandatory when collecting data.",
    ],
  },
  {
    heading: 'How is your personal data used, and what is the legal basis for this use?',
    paragraphs: [
      'The Company processes your personal data for the following purposes:',
    ],
    bullets: [
      'Contractual Necessity — to establish and fulfil a contract with you (or your minor child), including verifying your identity, taking payments, communicating with you, providing customer service, and arranging delivery.',
      "Legitimate Interests — to communicate with you; invite you to market research; monitor, improve and protect our products, content, services and website; personalise our website and products for you; send marketing communications by post; investigate and handle complaints; monitor accounts to prevent fraud or crime; and measure the effectiveness of our advertising.",
      'Legal Compliance — to comply with applicable laws and protect our legitimate business interests, including accounting, billing, legal claims, compliance, regulatory, tax and investigative purposes.',
      'Consent — for specific enhancing tools, products or services, we may ask for your specific consent.',
    ],
    afterBullets: [
      'Direct marketing: we may use your contact data, based on our legitimate interest, to contact you about products and services similar to those you have already purchased, by email, SMS, other instant messaging technologies, or phone. You can opt out at any time via the link in any marketing communication.',
    ],
  },
  {
    heading: 'Automated decision-making and profiling',
    paragraphs: [
      'We do not use fully automated decision-making to execute our contractual relationship with you.',
      'We do process your data on a partially automated basis to evaluate certain characteristics of yours (profiling), so we can provide tailored information and recommend products and services that we think might be suitable for you.',
    ],
  },
  {
    heading: 'Who will your personal data be shared with, and where?',
    paragraphs: ['The Company will share your personal data with:'],
    bullets: [
      'Government authorities and/or law enforcement officials, where required by law or for the legal protection of our legitimate interests.',
      'Third-party service providers and group companies who process data on our behalf — including couriers for delivery of your orders, customer service operations, and marketing providers.',
      'In the event the business is sold or integrated with another business, your personal data will be disclosed to our advisers, any prospective purchaser\'s advisers, and passed to the new owners.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: ['You are entitled to ask the Company:'],
    bullets: [
      'For a copy of your personal data (in a commonly used electronic form, if requested electronically);',
      'To correct your personal data, if inaccurate, incomplete or out of date;',
      "To 'port' your personal data to you or another data controller;",
      'To erase your personal data; or',
      'To restrict its processing.',
    ],
    afterBullets: [
      'You also have the right to object to processing based on our legitimate interests, and to processing for direct marketing purposes. Where we have asked for your consent, you may withdraw it at any time.',
      'These rights are limited in some situations — for example, where we can demonstrate a legal requirement to process your data. Where we require your personal data to comply with a legal or contractual obligation, providing that data is mandatory; without it, we may not be able to manage our relationship with you or meet our obligations.',
      'If you have any concerns about how we process your personal data, our data protection contact is privacy.ecopadi@gmail.com. If unresolved, you also have the right to complain to your local data protection authority.',
    ],
  },
  {
    heading: 'How long will you hold my data?',
    paragraphs: [
      'We will keep your personal data for as long as necessary to perform the purposes set out in this notice, as required by law (such as for tax and accounting purposes), or as otherwise communicated to you. Retention periods vary by data type, but the longest we will normally hold data relating to order processing is 10 years.',
    ],
  },
  {
    heading: 'Changes to this privacy notice',
    paragraphs: [
      'Any changes we make to this notice in future will be posted on the website and, where appropriate, notified to you by email or otherwise.',
    ],
  },
  {
    heading: 'Appendix 1 — Logging in using third-party credentials',
    paragraphs: [
      'Instead of registering directly, you can register and log in using Facebook, Google or Apple. If you do, and link your account, we may receive data including your email address, first name, last name, date of birth, profile picture and language, depending on your privacy settings with that provider.',
      'Ecopadi UK stores personal data obtained from these providers to create, share and personalise your account. To request deletion of this data, contact us at privacy.ecopadi@gmail.com. You can also remove the connection directly from your Facebook, Google or Apple account settings at any time.',
    ],
  },
];

function PrivacyPolicy() {
  return (
    <>
      {PRIVACY_SECTIONS.map((section) => (
        <div key={section.heading} style={{ marginBottom: 34 }}>
          <h2 style={{ fontSize: 19, color: 'var(--pantry)', marginBottom: 10 }}>{section.heading}</h2>
          {section.paragraphs?.map((p, i) => (
            <p key={i} className="muted" style={{ lineHeight: 1.75, marginBottom: 10 }}>{p}</p>
          ))}
          {section.bullets && (
            <ul style={{ margin: '10px 0 10px 20px', color: 'var(--charcoal-soft)', lineHeight: 1.75 }}>
              {section.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
          {section.afterBullets?.map((p, i) => (
            <p key={i} className="muted" style={{ lineHeight: 1.75, marginBottom: 10 }}>{p}</p>
          ))}
        </div>
      ))}
    </>
  );
}

export default function Legal() {
  const { page } = useParams();

  if (page === 'privacy') {
    return (
      <section className="section" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="eyebrow">Legal</div>
        <h1 style={{ fontSize: 34, margin: '14px 0 6px', color: 'var(--pantry)' }}>Privacy Policy</h1>
        <p className="muted" style={{ marginBottom: 34, fontSize: 13.5 }}>Publication date: August 2026</p>
        <PrivacyPolicy />
      </section>
    );
  }

  const content = PLACEHOLDER_PAGES[page] || PLACEHOLDER_PAGES.terms;
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
