import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '/logo.png';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';


const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'New Bikes', href: '#new-bikes' },
  { label: 'Second Hand', href: '#second-hand' },
  { label: 'Insurance', href: '#insurance' },
  { label: 'Service', href: '#service' },
  { label: 'Careers', href: '#careers' },
  { label: 'Finance', href: '/finance', isExternal: true },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string, isExternal?: boolean) => {
    setIsOpen(false);
    
    // If it's an external route, navigate to it
    if (isExternal) {
      window.location.href = href;
      return;
    }
    
    // Check if we're on a different page (not home page)
    const currentPath = window.location.pathname;
    if (currentPath !== '/') {
      // Navigate to home with the hash
      window.location.href = `/${href}`;
      return;
    }
    
    // On home page, scroll to the element
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-hero/80 backdrop-blur-lg py-3 shadow-2xl'
            : 'bg-transparent py-5 backdrop-blur-sm'
        }`}
        style={{ top: '0px' }}
      >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            const currentPath = window.location.pathname;
            if (currentPath !== '/') {
              window.location.href = '/';
            } else {
              handleNavClick('#home');
            }
          }}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <img
            src={logo}
            alt="RR Motors Logo"
            className="h-12 md:h-14 w-auto drop-shadow-lg"
          />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item: any) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href, item.isExternal);
              }}
              className="nav-link text-hero-foreground/90 hover:text-hero-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA Button - Desktop */}
        <div className="hidden lg:block">
          <Button
            variant="default"
            className="btn-glow bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-6"
            onClick={() => handleNavClick('#new-bikes')}
          >
            Book Test Ride
          </Button>
        </div>

        {/* Mobile Menu - Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <button
              className="text-hero-foreground p-2 hover:bg-hero-foreground/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={28} />
            </button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-[300px] sm:w-[350px] bg-hero border-l border-primary/20 p-0"
          >
            <SheetHeader className="p-6 border-b border-primary/20">
              <SheetTitle className="text-left text-hero-foreground font-display text-xl">
                RR <span className="text-primary">MOTORS</span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col py-4">
              {navItems.map((item: any, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href, item.isExternal);
                  }}
                  className="group flex items-center justify-between px-6 py-4 text-hero-foreground/90 hover:text-primary hover:bg-hero-foreground/5 transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-lg font-medium">{item.label}</span>
                  <ChevronRight 
                    size={18} 
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" 
                  />
                </a>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-primary/20">
              <Button
                variant="default"
                className="w-full btn-glow bg-gradient-primary text-primary-foreground font-semibold py-6 text-lg"
                onClick={() => handleNavClick('#new-bikes')}
              >
                Book Test Ride
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
    </>
  );
}
