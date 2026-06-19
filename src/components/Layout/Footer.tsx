import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="saic-footer">
      <div className="footer-left">
        <img src="/logo.png" alt="SAIC" className="footer-logo" />
        <span className="footer-copy">© {year} Stewardship Agribusiness Incubation Center</span>
      </div>
      <span className="footer-tagline">Transforming Agriculture Through Innovation</span>
    </footer>
  );
}
