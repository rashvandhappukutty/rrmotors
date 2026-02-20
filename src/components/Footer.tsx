import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube, MessageCircle } from 'lucide-react';

const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'New Bikes', href: '#new-bikes' },
  { label: 'Second Hand', href: '#second-hand' },
  { label: 'Insurance', href: '#insurance' },
  { label: 'Service', href: '#service' },
  { label: 'Careers', href: '#careers' },
  { label: 'Finance', href: '/finance', isExternal: true },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/rrmotors__coimbatore', label: 'Instagram' },
  { icon: MessageCircle, href: 'https://wa.me/919677792722', label: 'WhatsApp' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

export function Footer() {
  const handleNavClick = (href: string) => {
    const currentPath = window.location.pathname;
    
    // If not on home page, navigate to home with hash
    if (currentPath !== '/') {
      window.location.href = `/${href}`;
      return;
    }
    
    // On home page, scroll to element
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-section-dark pt-16 pb-8">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div>
            <a href="#home" className="inline-block mb-4">
              <span className="text-2xl font-display font-bold text-section-dark-foreground">
                RR <span className="text-primary">MOTORS</span>
              </span>
            </a>
            <p className="text-section-dark-foreground/60 mb-6">
              Your trusted partner for premium motorcycles. Experience the thrill of riding with quality and performance.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href !== '#' ? '_blank' : undefined}
                  rel={social.href !== '#' ? 'noopener noreferrer' : undefined}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-section-dark-foreground/10 flex items-center justify-center text-section-dark-foreground/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-bold text-section-dark-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (!link.isExternal) {
                        e.preventDefault();
                        handleNavClick(link.href);
                      }
                    }}
                    className="text-section-dark-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-display font-bold text-section-dark-foreground mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <a 
                  href="https://www.google.com/maps/search/N.G.R+PURAM,+IRUGUR+MAIN+ROAD+COIMBATORE-16" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-section-dark-foreground/60 hover:text-primary transition-colors"
                >
                  N.G.R PURAM, IRUGUR MAIN ROAD COIMBATORE-16
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-2">
                  <a href="tel:+919677792722" className="text-section-dark-foreground/60 hover:text-primary transition-colors">
                    +91 96777 92722
                  </a>
                  <a href="tel:+917871976070" className="text-section-dark-foreground/60 hover:text-primary transition-colors">
                    +91 78719 76070
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:rrmotorscbe1@gmail.com" className="text-section-dark-foreground/60 hover:text-primary transition-colors">
                  rrmotorscbe1@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="text-lg font-display font-bold text-section-dark-foreground mb-4">Working Hours</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-section-dark-foreground/60">
                  <p>Mon - Sat: 9:00 AM - 9:00 PM</p>
                  <p>Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </li>
            </ul>
            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-section-dark-foreground/80">
                <span className="text-primary font-semibold">Need Help?</span><br />
                Book a test ride or service appointment today!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-section-dark-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-section-dark-foreground/50 text-sm">
              © 2024 RR Motors. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-section-dark-foreground/50">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
