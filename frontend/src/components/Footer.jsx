import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <img src="/brand/logo-white.png" alt="Ecopadi — groceries from home" className="logo-badge logo-badge-footer" />
            </div>
            <p>Ecopadi UK Limited is committed to bringing authentic African food products closer to Africans living in the United Kingdom.</p>
            <p style={{ marginTop: 10, fontSize: 12.5, opacity: .6 }}>Registered in England &amp; Wales, Company No. 17215991.</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop">All Products</Link>
            <Link to="/vip">Become a VIP</Link>
            <Link to="/delivery">Delivery Info</Link>
            <Link to="/faq">FAQ</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/legal/terms">Terms &amp; Conditions</Link>
            <Link to="/legal/returns">Returns &amp; Refunds</Link>
            <Link to="/legal/privacy">Privacy Policy</Link>
            <Link to="/order-lookup">Track an Order</Link>
          </div>
          <div className="footer-col">
            <h4>Get In Touch</h4>
            <p>172 St. Paul's Road, Birmingham</p>
            <p>+44 (0)7901 555647</p>
            <a href="mailto:ecopadilimiteduk@gmail.com">ecopadilimiteduk@gmail.com</a>
            <a href="#" target="_blank" rel="noreferrer">Facebook: Ecopadi UK</a>
            <a href="#" target="_blank" rel="noreferrer">Instagram: @ecopadiuk</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ecopadi UK Limited. Bringing Africa closer to home.</span>
          <div className="footer-dots"><span /><span /><span /></div>
        </div>
      </div>
    </footer>
  );
}
