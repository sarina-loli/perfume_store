import Footer from '../components/Footer'

/* ════════════════════════════════════
   CONTACT
════════════════════════════════════ */
export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-inner">
        <div className="contact-left">
          <p className="section-eyebrow" style={{ marginBottom: '1rem' }}>Get in Touch</p>
          <h1>
            We'd love to<br />
            <em>hear from you</em>
          </h1>
          <p>
            Whether you have a question about our fragrances, need help selecting your scent, or wish to inquire about wholesale partnerships — our team is delighted to assist.
          </p>

          <div className="contact-info-list">
            <div className="contact-info-item">
              <div className="contact-icon">✉</div>
              <div>
                <p className="label">Email</p>
                <p className="value">hello@victoriaperfume.com<br />press@victoriaperfume.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">☎</div>
              <div>
                <p className="label">Phone</p>
                <p className="value">+1 (212) 555 0184<br />Mon – Fri, 9am – 6pm EST</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">◈</div>
              <div>
                <p className="label">Address</p>
                <p className="value">12 Rue du Faubourg Saint-Honoré<br />75008 Paris, France</p>
              </div>
            </div>
          </div>

          <div className="contact-social">
            <p className="label">Follow Victoria</p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Instagram">IG</a>
              <a href="#" className="social-link" aria-label="Pinterest">PI</a>
              <a href="#" className="social-link" aria-label="TikTok">TK</a>
              <a href="#" className="social-link" aria-label="Facebook">FB</a>
            </div>
          </div>
        </div>

        <div className="contact-right">
          <h3>Send a Message</h3>

          <div className="form-field">
            <label>Full Name</label>
            <input type="text" placeholder="Your name" />
          </div>
          <div className="form-field">
            <label>Email Address</label>
            <input type="email" placeholder="your@email.com" />
          </div>
          <div className="form-field">
            <label>Subject</label>
            <input type="text" placeholder="How can we help?" />
          </div>
          <div className="form-field">
            <label>Message</label>
            <textarea placeholder="Tell us more…" />
          </div>

          <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={e => e.preventDefault()}>
            Send Message
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
