import React, { useState } from 'react';
import { ArrowRight, Mail, MessageSquare, Send, User } from 'lucide-react';

const EMAIL = 'alexanderdashcynskiy@gmail.com';
// TODO: replace the placeholder LinkedIn handle with the real one.
const LINKEDIN = 'yourname';
// WhatsApp and Telegram open a chat on this number; the number itself is not shown.
const PHONE = '375333604902'; // international format, digits only

const PROJECT_TYPES = ['Website', 'App', 'Mini App', 'Dashboard', 'UX/UI', 'Other'];

const LinkedInMark = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h3.96V21H3V9.75Zm6.5 0h3.8v1.54h.05c.53-1 1.82-2.04 3.75-2.04 4.01 0 4.75 2.64 4.75 6.07V21h-3.96v-5.03c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21H9.5V9.75Z" />
  </svg>
);

// WhatsApp mark from Simple Icons (CC0).
const WhatsAppMark = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const channels = [
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, Icon: Mail },
  { label: 'WhatsApp', value: 'Chat with me', href: `https://wa.me/${PHONE}`, Icon: WhatsAppMark },
  { label: 'Telegram', value: 'Message me', href: `https://t.me/+${PHONE}`, Icon: Send },
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
          <span data-reveal className="page-eyebrow">05 / CONTACT</span>

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
