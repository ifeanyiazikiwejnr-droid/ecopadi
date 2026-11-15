import { useParams } from 'react-router-dom';

// Small helper: **bold** markers in the document text become <strong>.
function rich(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

const CONTACT_EMAIL = 'ecopadiuk@gmail.com';
const CONTACT_PHONE = '+447901555647';

// Block types: p (paragraph), h3 (sub-heading), ul (bullet list),
// contact (label / value lines, optionally linked).
const LEGAL_DOCS = {
  returns: {
    title: 'Returns and Refund Policy',
    intro: [],
    sections: [
      {
        heading: '1. Returns Policy',
        blocks: [
          { type: 'p', text: 'As our goods are organically sourced without preservatives, we **do not accept returns** for any food stuff once they have been delivered or collected.' },
        ],
      },
      {
        heading: '2. Refunds & Replacements',
        blocks: [
          { type: 'p', text: 'We understand that issues may arise, and we are happy to provide a **refund or replacement** in the following circumstances:' },
          { type: 'h3', text: 'Damaged or Incorrect Items' },
          { type: 'p', text: 'If you receive an item that is:' },
          { type: 'ul', items: ['Damaged or spoiled upon arrival.', 'Incorrect (not the product you ordered)'] },
          { type: 'p', text: '**Action Required:**' },
          {
            type: 'ul',
            items: [
              'Contact us within **24 hours** of receiving your order.',
              'Provide clear photos of the damaged or incorrect item, including the packaging.',
              'Once verified, we will offer a refund or send a replacement at no additional cost.',
            ],
          },
        ],
      },
      {
        heading: '3. Missing Items',
        blocks: [
          { type: 'p', text: 'If an item from your order is missing, please contact us within **24 hours** of delivery. We will verify the issue and either refund the missing item or send a replacement.' },
        ],
      },
      {
        heading: '4. Cancellation & Order Modifications',
        blocks: [
          {
            type: 'ul',
            items: [
              'Cancellations: Orders can be cancelled within 24 hours of placement for a full refund. After this window, cancellations may not be possible as sourcing begins immediately.',
              'Modifications: If you need to change your order, please contact us as soon as possible. While we will do the best we can to accommodate changes, we can not guarantee modifications after sourcing has been made.',
            ],
          },
        ],
      },
      {
        heading: '5. Refund Processing',
        blocks: [
          {
            type: 'ul',
            items: [
              'Approved refunds will be processed within 5-7 business days back to the original payment method.',
              'If you do not receive your refund within this period, please check with your bank or payment provider before contacting us.',
            ],
          },
        ],
      },
      {
        heading: '6. Contact Us',
        blocks: [
          { type: 'p', text: 'For any refund or return inquiries, please contact us:' },
          {
            type: 'contact',
            lines: [
              { label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
              { label: 'Phone', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}` },
              { label: 'Address', value: "St. Paul's Road, Birmingham, United Kingdom, B12 8LZ." },
            ],
          },
        ],
      },
    ],
    outro: ['We value our customers and will do our best to resolve any issues fairly and promptly. Thank you for choosing Ecopadi UK Ltd!'],
  },

  terms: {
    title: 'Terms and Conditions of Use',
    intro: [
      'Welcome to Ecopadi UK Ltd! By accessing or using our website, https://ecopadi.com/, you agree to be bound by these Terms of Use.',
      'If you do not agree with any part of these terms, please do not use our website.',
    ],
    sections: [
      {
        heading: '1. Use of Our Website',
        blocks: [{ type: 'ul', items: [
          'You must be at least 18 years of age to use this website or have a parental or guardian consent.',
          'You agree to use this website only for lawful purposes and in accordance with all applicable laws and regulations.',
          'You must not engage in any activity that disrupts or interferes with the proper functioning of the website.',
        ] }],
      },
      {
        heading: '2. Intellectual Property Rights',
        blocks: [{ type: 'ul', items: [
          'All content on this website including text, images, logos, and graphics, is the property of Ecopadi UK and is protected by copyright and trademark laws.',
          'You may not reproduce, distribute, or use any content from this site without our prior written consent.',
        ] }],
      },
      {
        heading: '3. Products & Pricing',
        blocks: [{ type: 'ul', items: [
          'All products listed on the website are subject to availability.',
          'Prices may change without prior notice, and we reserve the right to modify or discontinue any product at any time.',
          'We strive to ensure that product descriptions and prices are accurate, but we do not guarantee that all information is error free.',
        ] }],
      },
      {
        heading: '4. Orders & Payments',
        blocks: [{ type: 'ul', items: [
          'By placing an order, you agree to provide accurate and complete information.',
          'We accept payments through secure and authorised payment gateways.',
          'Ecopadi UK reserves the right to refuse or cancel any order due to suspected fraud, incorrect pricing, or product unavailability.',
        ] }],
      },
      {
        heading: '5. Delivery & Returns',
        blocks: [{ type: 'ul', items: [
          'Delivery times vary based on location and product availability.',
          'If you receive a defective or incorrect item, you must notify us within 7 days for a replacement or refund.',
          'We do not accept returns for perishable food items unless there is a product defect.',
        ] }],
      },
      {
        heading: '6. User Accounts',
        blocks: [{ type: 'ul', items: [
          'You may be required to create an account to access certain features.',
          'You are responsible for maintaining the confidentiality of your account credentials.',
          'We reserve the right to suspend or terminate accounts that violate our policies.',
        ] }],
      },
      {
        heading: '7. Limitation of Liability',
        blocks: [{ type: 'ul', items: [
          'Ecopadi UK is not liable for any direct, indirect, incidental, or consequential damages arising from the use of our website or products.',
          'We do not guarantee that our website will always be error free or uninterrupted.',
        ] }],
      },
      {
        heading: '8. Third-party Links',
        blocks: [{ type: 'ul', items: [
          'Our website may contain links to third-party websites for additional information.',
          'We do not endorse or take responsibility for the content, privacy policies, or practices of any third-party sites.',
        ] }],
      },
      {
        heading: '9. Privacy Policy',
        blocks: [{ type: 'ul', items: [
          'Your use of our website is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal data.',
        ] }],
      },
      {
        heading: '10. Changes to Terms of Use',
        blocks: [{ type: 'ul', items: [
          'We reserve the right to modify these terms at any time without prior notice.',
          'Continued use of our website after changes are made constitutes acceptance of the revised terms.',
        ] }],
      },
      {
        heading: '11. Contact Information',
        blocks: [
          { type: 'p', text: 'For any questions regarding these Terms of Use, please contact us at:' },
          {
            type: 'contact',
            lines: [
              { value: 'Ecopadi UK' },
              { label: 'Phone', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}` },
              { label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
            ],
          },
        ],
      },
    ],
    outro: ['By using this website, you acknowledge that you have read, understood, and agreed to these Terms of Use.'],
    footnote: 'UK Registration Company Number: 17215991',
  },
};

function LegalDocument({ doc }) {
  return (
    <>
      {doc.intro.map((t, i) => (
        <p key={i} className="muted" style={{ lineHeight: 1.75, marginBottom: 12 }}>
          {t.includes('https://ecopadi.com/')
            ? <>{t.split('https://ecopadi.com/')[0]}<a href="https://ecopadi.com/" style={{ color: 'var(--pantry)', textDecoration: 'underline' }}>https://ecopadi.com/</a>{t.split('https://ecopadi.com/')[1]}</>
            : t}
        </p>
      ))}
      {doc.sections.map((section) => (
        <div key={section.heading} style={{ margin: '30px 0 0' }}>
          <h2 style={{ fontSize: 19, color: 'var(--pantry)', marginBottom: 10 }}>{section.heading}</h2>
          {section.blocks.map((block, i) => {
            if (block.type === 'p') return <p key={i} className="muted" style={{ lineHeight: 1.75, marginBottom: 10 }}>{rich(block.text)}</p>;
            if (block.type === 'h3') return <h3 key={i} style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--charcoal)', margin: '16px 0 6px' }}>{block.text}</h3>;
            if (block.type === 'ul') {
              return (
                <ul key={i} style={{ margin: '8px 0 10px 20px', color: 'var(--charcoal-soft)', lineHeight: 1.75 }}>
                  {block.items.map((item, j) => <li key={j}>{rich(item)}</li>)}
                </ul>
              );
            }
            if (block.type === 'contact') {
              return (
                <div key={i} className="muted" style={{ lineHeight: 1.9, marginBottom: 10 }}>
                  {block.lines.map((l, j) => (
                    <div key={j}>
                      {l.label && <strong style={{ color: 'var(--charcoal)' }}>{l.label}: </strong>}
                      {l.href ? <a href={l.href} style={{ color: 'var(--pantry)', textDecoration: 'underline' }}>{l.value}</a> : l.value}
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      ))}
      {doc.outro?.map((t, i) => (
        <p key={i} className="muted" style={{ lineHeight: 1.75, margin: '30px 0 10px' }}>{t}</p>
      ))}
      {doc.footnote && (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>{doc.footnote}</p>
      )}
    </>
  );
}

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
      <section className="section">
       <div className="wrap legal-wrap" style={{ maxWidth: 760 }}>
        <div className="eyebrow">Legal</div>
        <h1 style={{ fontSize: 'clamp(26px, 7vw, 34px)', margin: '14px 0 6px', color: 'var(--pantry)' }}>Privacy Policy</h1>
        <p className="muted" style={{ marginBottom: 34, fontSize: 13.5 }}>Publication date: August 2026</p>
        <PrivacyPolicy />
       </div>
      </section>
    );
  }

  const doc = LEGAL_DOCS[page] || LEGAL_DOCS.terms;
  return (
    <section className="section">
     <div className="wrap legal-wrap" style={{ maxWidth: 760 }}>
      <div className="eyebrow">Legal</div>
      <h1 style={{ fontSize: 'clamp(26px, 7vw, 34px)', margin: '14px 0 20px', color: 'var(--pantry)' }}>{doc.title}</h1>
      <LegalDocument doc={doc} />
     </div>
    </section>
  );
}
