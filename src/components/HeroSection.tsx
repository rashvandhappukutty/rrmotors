import { Button } from '@/components/ui/button';
import heroBike from '@/assets/hero-bike.jpg';

export function HeroSection() {
  const handleScroll = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBike}
          alt="Premium motorcycle"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hero/90 via-hero/70 to-hero/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-hero via-transparent to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-up mb-6">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30">
              Premium Motorcycle Showroom
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="animate-fade-up-delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-hero-foreground leading-tight mb-6">
            WELCOME TO
            <span className="block text-gradient">RR MOTORS</span>
          </h1>

          {/* Subheading */}
          <p className="animate-fade-up-delay-2 text-lg md:text-xl lg:text-2xl text-hero-foreground/80 max-w-2xl mx-auto mb-10">
            ONE STOP - MULTICHOICE
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => handleScroll('#new-bikes')}
            >
              Book Test Ride
            </Button>
            <Button
              variant="heroOutline"
              size="xl"
              onClick={() => handleScroll('#new-bikes')}
            >
              Explore Bikes
            </Button>
          </div>

          {/* Stats */}
          <div className="animate-fade-up-delay-3 mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-primary">3+</div>
              <div className="text-sm text-hero-foreground/60">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-primary">200+</div>
              <div className="text-sm text-hero-foreground/60">Bikes Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-primary">30+</div>
              <div className="text-sm text-hero-foreground/60">Premium Models</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-hero-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
