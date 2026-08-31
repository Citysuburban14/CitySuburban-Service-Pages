/* eslint-disable @next/next/no-img-element */

import {FooterLeadForm} from './footer-lead-form'

const LIVE_SITE = 'https://citysuburbanheating.com'
const HEADER_LOGO = '/services/images/city-suburban-logo.png'
const FOOTER_LOGO = '/services/images/city-suburban-logo.png'

const primaryLinks = [
  {label: 'Home', href: `${LIVE_SITE}/`},
  {label: 'About Us', href: `${LIVE_SITE}/about-us`},
  {label: 'Services', href: `${LIVE_SITE}/services`},
  {label: 'Heating', href: `${LIVE_SITE}/heating/`},
  {label: 'Cooling', href: `${LIVE_SITE}/cooling/`},
  {label: 'Service Areas', href: `${LIVE_SITE}/service-areas/`},
]

const utilityIcons = {
  location: 'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 10.2A3.2 3.2 0 1 1 12 5.8a3.2 3.2 0 0 1 0 6.4Z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v4.45l3.2 1.85-1 1.73L11 12.6V7h2Z',
  email: 'M3 4h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm9 8.3L20.2 7H3.8l8.2 5.3Zm0 2.4L3 8.9V18h18V8.9l-9 5.8Z',
  phone: 'M6.6 2.7 10 6.1 7.8 9c1.3 2.6 3.5 4.8 6.1 6.1l2.9-2.2 3.4 3.4-2.1 3.4c-.4.7-1.2 1.1-2 1C8.8 19.6 4.4 15.2 3.3 7.9c-.1-.8.3-1.6 1-2l2.3-3.2Z',
} as const

function UtilityIcon({name}: {name: keyof typeof utilityIcons}) {
  return <svg className="collection-utility-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={utilityIcons[name]} /></svg>
}

export function CollectionHeader() {
  return (
    <div className="collection-header-stack">
      <div className="collection-utility" aria-label="Business contact information">
        <div className="collection-utility-inner">
          <a href={`${LIVE_SITE}/contact-us/`}><UtilityIcon name="location" />1225 North Cleaver Street, Chicago, IL 60642</a>
          <div className="collection-utility-group">
            <span><UtilityIcon name="clock" />Working Hours: 24/7</span>
            <a href="mailto:service@citysuburbanheating.com"><UtilityIcon name="email" />service@citysuburbanheating.com</a>
            <a href="tel:+17732383838"><UtilityIcon name="phone" />(773) 238-3838</a>
          </div>
        </div>
      </div>
      <header className="collection-header">
        <div className="collection-nav-shell">
          <a className="collection-logo" href={`${LIVE_SITE}/`} aria-label="City & Suburban home">
            <img src={HEADER_LOGO} alt="City & Suburban Heating & Cooling" />
          </a>
          <nav className="collection-desktop-nav" aria-label="Primary navigation">
            {primaryLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
          </nav>
          <a className="collection-contact-button" href={`${LIVE_SITE}/contact-us`}>Contact us</a>
          <details className="collection-mobile-menu">
            <summary aria-label="Open navigation menu"><span /><span /><span /></summary>
            <nav aria-label="Mobile navigation">
              {primaryLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
              <a href={`${LIVE_SITE}/contact-us`}>Contact us</a>
            </nav>
          </details>
        </div>
      </header>
      <div className="collection-mobile-actions" aria-label="Quick service actions">
        <a className="collection-mobile-call" href="tel:+17732383838">(773) 238-3838</a>
        <a className="collection-mobile-schedule" href={`${LIVE_SITE}/contact-us/`}>Schedule service</a>
      </div>
    </div>
  )
}

export function CollectionFooter() {
  return (
    <footer className="collection-footer">
      <div className="collection-footer-grid">
        <div className="collection-footer-main">
          <a className="collection-footer-logo" href={`${LIVE_SITE}/`} aria-label="City & Suburban home">
            <img src={FOOTER_LOGO} alt="City & Suburban Heating & Cooling" />
          </a>
          <p className="collection-footer-intro">City & Suburban Heating & Cooling is a family-owned HVAC company serving Chicago and nearby suburbs with reliable heating, cooling, and indoor-air-quality services since 1952.</p>
          <a className="collection-ai-link" href={`${LIVE_SITE}/`}>Learn about City & Suburban <span aria-hidden="true">→</span></a>
          <div className="collection-footer-rule" />
          <div className="collection-footer-links">
            <nav aria-label="Company links">
              <h2>Company</h2>
              <a href={`${LIVE_SITE}/about-us`}>About Us</a>
              <a href={`${LIVE_SITE}/services`}>Our Services</a>
              <a href={`${LIVE_SITE}/heating/`}>Heating Services</a>
              <a href={`${LIVE_SITE}/contact-us`}>Contact Us</a>
            </nav>
            <nav aria-label="About links">
              <h2>About Us</h2>
              <a href={`${LIVE_SITE}/cooling/`}>Cooling Services</a>
              <a href={`${LIVE_SITE}/air-quality/`}>Air Quality</a>
              <a href={`${LIVE_SITE}/commercial/`}>Commercial HVAC</a>
            </nav>
            <address>
              <h2>Contact</h2>
              <a href={`${LIVE_SITE}/contact-us/`}>Address: 1225 North Cleaver Street<br />Chicago, IL 60642</a>
              <a href="tel:+17732383838">Phone: (773) 238-3838</a>
              <a href="mailto:service@citysuburbanheating.com">Email: service@citysuburbanheating.com</a>
            </address>
          </div>
          <div className="collection-footer-bottom">
            <span>Copyright © {new Date().getFullYear()} City & Suburban Heating & Cooling</span>
          </div>
        </div>
        <aside className="collection-footer-cta">
          <h2 className="collection-footer-title">Request a quick <span>quote</span></h2>
          <p>Tell the City & Suburban team what HVAC service you need and get help planning the next step.</p>
          <FooterLeadForm />
          <a className="collection-footer-phone" href="tel:+17732383838">Or call (773) 238-3838</a>
        </aside>
      </div>
    </footer>
  )
}
