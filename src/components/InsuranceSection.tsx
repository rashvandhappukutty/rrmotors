import { useState } from 'react';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { Button } from '@/components/ui/button';
import { InsuranceQuoteModal } from '@/components/InsuranceQuoteModal';
import { Shield, RefreshCw, Headphones, FileText } from 'lucide-react';

const services = [
  {
    icon: Shield,
    title: 'Comprehensive Coverage',
    description: 'Full protection for your bike against accidents, theft, and natural disasters.',
  },
  {
    icon: RefreshCw,
    title: 'Easy Renewal',
    description: 'Hassle-free online renewal process. Get instant policy renewal in minutes.',
  },
  {
    icon: Headphones,
    title: '24/7 Claim Support',
    description: 'Round-the-clock assistance for claims and emergency roadside support.',
  },
  {
    icon: FileText,
    title: 'Digital Documentation',
    description: 'Access all your policy documents anytime, anywhere through our digital portal.',
  },
];

export function InsuranceSection() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const handleGetInsuranceQuote = () => {
    setIsQuoteOpen(true);
  };

  return (
    <section id="insurance" className="section-padding bg-section-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <ScrollAnimation animation="slide-left">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Protection</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-section-dark-foreground mt-2 mb-6">
              Bike <span className="text-gradient">Insurance</span>
            </h2>
            <p className="text-section-dark-foreground/70 text-lg leading-relaxed mb-8">
              Protect your ride with our comprehensive insurance solutions. We partner with 
              leading insurance providers to offer you the best coverage at competitive rates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="lg"
                onClick={handleGetInsuranceQuote}
              >
                Get Insurance Quote
              </Button>
            </div>
          </ScrollAnimation>

          {/* Right - Service Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <ScrollAnimation key={index} animation="scale-in" delay={index * 100}>
                <div className="group p-6 bg-card/5 backdrop-blur-sm rounded-xl border border-section-dark-foreground/10 hover:border-primary/50 transition-all duration-300 hover:bg-card/10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:animate-pulse-glow transition-all">
                    <service.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-section-dark-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-section-dark-foreground/60">
                    {service.description}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </div>

      {/* Insurance Quote Modal */}
      <InsuranceQuoteModal 
        isOpen={isQuoteOpen} 
        onClose={() => setIsQuoteOpen(false)} 
      />
    </section>
  );
}
