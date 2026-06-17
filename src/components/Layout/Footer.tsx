import './Footer.css';

export default function Footer() {
  return (
    <footer className="saic-footer">
      <span>© {new Date().getFullYear()} Stewardship Agribusiness Incubation Center — EMIS</span>
      <span className="footer-tagline">Transforming Agriculture Through Innovation</span>
    </footer>
  );
}
