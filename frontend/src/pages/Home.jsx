import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

const INGREDIENT_TICKER = ['Jollof Rice','Egusi','Suya Spice','Plantain','Palm Oil','Scotch Bonnet','Cassava','Dried Fish','Ogbono','Yam Flour'];

const WHY_ECOPADI = [
  { title: 'Authentic Sourcing', text: 'Our products are sourced from trusted suppliers who understand traditional African food processing methods.' },
  { title: 'Quality Assurance', text: 'We prioritize quality, hygiene, freshness, and proper packaging throughout our supply chain.' },
  { title: 'Reliable Supply', text: 'We are committed to maintaining consistent product availability for households, restaurants, and retailers.' },
  { title: 'Customer-Focused Service', text: 'We value relationships and strive to provide responsive support and dependable delivery.' },
  { title: 'Competitive Pricing', text: 'We work hard to bring authentic African food products to our customers at fair and competitive prices.' },
];

const WHO_WE_SERVE = [
  { title: 'Families & Households', text: 'Enjoy the familiar tastes of home without compromise.' },
  { title: 'African Restaurants', text: 'Reliable supply of authentic ingredients for your menu.' },
  { title: 'Grocery Stores', text: 'Consistent access to quality African food products.' },
  { title: 'Food Retailers & Wholesalers', text: 'Bulk supply options designed for business growth.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.getProducts().then((rows) => setFeatured(rows.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-cutout cutout-1" /><div className="hero-cutout cutout-2" />
        <div className="wrap hero-grid">
          <div>
            <div className="hero-eyebrow">Authentic African Foods, Spices &amp; Traditional Ingredients</div>
            <h1>bringing <em>africa</em> closer to home</h1>
            <p className="lede">Carefully sourced and delivered across the United Kingdom — for homes, restaurants, retailers, and food lovers everywhere.</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">Browse Groceries →</Link>
              <Link to="/vip" className="btn btn-ghost" style={{ color: 'var(--cream)', borderColor: 'rgba(248,245,239,0.4)' }}>Join VIP — It's Free</Link>
            </div>
            <div className="hero-tagline">Fresh <span>•</span> Authentic <span>•</span> Trusted</div>
          </div>
          <div className="hero-visual">
            <img src="/brand/spice-bowls.jpg" alt="Fresh African spices, herbs and ingredients" />
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((n) => (
            <span key={n}>{INGREDIENT_TICKER.map((w) => <span key={w}>{w} <span className="sep">●</span> </span>)}</span>
          ))}
        </div>
      </div>

      <section className="section story-section">
        <div className="wrap story-grid">
          <div>
            <div className="eyebrow">We Are Excited To Meet You!</div>
            <h2>Food is more than nourishment — it's culture, memories, family, and home.</h2>
            <p className="story-copy">
              At EcoPadi UK Limited, we understand that food carries identity. Founded with a passion for
              connecting Africans in the United Kingdom to the authentic tastes they grew up with, EcoPadi UK
              supplies carefully sourced African foods, spices, proteins, and traditional ingredients from
              trusted producers and processors.
            </p>
            <p className="story-copy">
              <strong>Our mission is simple:</strong> to make quality African food products accessible, affordable,
              and dependable for homes, restaurants, retailers, and food lovers across the UK.
            </p>
            <p className="story-copy">
              Whether you're preparing a traditional family meal or stocking your African grocery shelves,
              EcoPadi UK is committed to delivering products that preserve the true flavours of Africa.
            </p>
          </div>
          <div className="story-photo">
            <img src="/brand/market-produce.jpg" alt="Fresh African produce at market" />
          </div>
        </div>
      </section>

      <section className="section why-section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">What Sets Us Apart</div>
            <h2>Why choose EcoPadi?</h2>
          </div>
          <div className="why-grid">
            {WHY_ECOPADI.map((item) => (
              <div className="why-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section shop-preview">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Shop The Pantry</div>
            <h2>Everything for a proper African kitchen.</h2>
            <p>Premium spices, traditional ingredients and pantry essentials, sourced to preserve the taste and heritage of Africa.</p>
          </div>
          <div className="cat-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/shop" className="btn btn-dark">View Full Shop →</Link>
          </div>
        </div>
      </section>

      <section className="section serve-section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Who We Serve</div>
            <h2>Who we supply.</h2>
          </div>
          <div className="serve-grid">
            {WHO_WE_SERVE.map((item) => (
              <div className="serve-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>

          <div className="commitment-block">
            <h3>Our Commitment</h3>
            <p>
              At EcoPadi UK, every product represents our commitment to authenticity, quality, and customer
              satisfaction. We believe every African living abroad deserves easy access to the ingredients that
              connect them to their roots, traditions, and favourite meals. That is why we continually strive to
              source, package, and deliver products that bring the taste of home closer to you.
            </p>
          </div>
        </div>
      </section>

      <div className="promise-strip">
        <div className="wrap promise-inner">
          <h2>Let's bring <em>groceries from home</em> to your kitchen.</h2>
          <Link to="/shop" className="btn btn-primary">Start Shopping →</Link>
        </div>
      </div>
    </>
  );
}
