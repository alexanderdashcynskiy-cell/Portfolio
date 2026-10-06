import React, { useState } from 'react';
import { ArrowRight, Mail, MessageSquare, Send, User } from 'lucide-react';

const EMAIL = 'alexanderdashcynskiy@gmail.com';
// TODO: replace the placeholder handles with the real ones.
const TELEGRAM = 'yourname';
const LINKEDIN = 'yourname';

const PROJECT_TYPES = ['Website', 'App', 'Mini App', 'Dashboard', 'UX/UI', 'Other'];

const LinkedInMark = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h3.96V21H3V9.75Zm6.5 0h3.8v1.54h.05c.53-1 1.82-2.04 3.75-2.04 4.01 0 4.75 2.64 4.75 6.07V21h-3.96v-5.03c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21H9.5V9.75Z" />
  </svg>
);

const channels = [
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, Icon: Mail },
  { label: 'Telegram', value: `@${TELEGRAM}`, href: `https://t.me/${TELEGRAM}`, Icon: Send },
  { label: 'LinkedIn', value: `/${LINKEDIN}`, href: `https://www.linkedin.com/in/${LINKEDIN}`, Icon: LinkedInMark },
];

/** The fifth and last full-screen page, laid out on the shared stage (see .about-stage). */
export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('Website');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  // No backend: the message is handed to the visitor's mail app, addressed and filled in.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `New project: ${type} — ${name}`;
    const body = `${message}\n\n— ${name}\n${email}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <section className="contact-page about-page font-hero-sans text-[#f7efe6]">
      <div className="about-stage">
        <div className="contact-copy">
          <span data-reveal className="contact-eyebrow">05 / CONTACT</span>

          <h1 className="contact-title font-display uppercase">
            <span data-reveal="line">Let’s</span>
            <span data-reveal="line">Build</span>
            <span data-reveal="line">Something</span>
            <span data-reveal="line" className="contact-title-accent">Great.</span>
          </h1>

          <p data-reveal className="contact-intro">
            Have an idea, project or just a question?
            <br />
            Tell me what you’re working on.
          </p>

          <ul data-reveal className="contact-channels">
            {channels.map(({ label, value, href, Icon }) => (
              <li key={label}>
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="contact-channel">
                  <span className="contact-channel-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="contact-channel-text">
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form data-reveal className="contact-form glass-dark" onSubmit={onSubmit}>
          <span className="contact-form-eyebrow">Send a message</span>
          <h2 className="contact-form-title font-display">Tell me about your project.</h2>
          <p className="contact-form-sub">I’ll get back to you as soon as possible.</p>

          <div className="contact-form-row">
            <label className="contact-field">
              <User aria-hidden="true" />
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
            </label>
            <label className="contact-field">
              <Mail aria-hidden="true" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" autoComplete="email" />
            </label>
          </div>

          <span className="contact-form-label" id="contact-type">What are you looking to build?</span>
          <div className="contact-chips" role="radiogroup" aria-labelledby="contact-type">
            {PROJECT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => setType(t)}
                className={`contact-chip ${type === t ? 'is-on' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>

          <span className="contact-form-label">Tell me about it</span>
          <label className="contact-field contact-field-area">
            <MessageSquare aria-hidden="true" />
            <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share a few details about your project..." />
          </label>

          <button type="submit" className="contact-submit group">
            <span>{sent ? 'Opening your mail app…' : 'Send message'}</span>
            <ArrowRight className="contact-submit-arrow" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
};
