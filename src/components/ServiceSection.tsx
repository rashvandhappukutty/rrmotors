import { useState } from 'react';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { Button } from '@/components/ui/button';
import { BookingModal } from '@/components/BookingModal';
import { Wrench, Droplets, Cog, Zap, Gauge, ShieldCheck } from 'lucide-react';

const services = [
  {
    icon: Wrench,
    title: 'General Service',
    description: 'Complete checkup and maintenance for optimal performance.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Droplets,
    title: 'Oil Change',
    description: 'Premium quality engine oil replacement service.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Cog,
    title: 'Brake Service',
    description: 'Brake pad replacement and system inspection.',
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: Zap,
    title: 'Electrical Work',
    description: 'Battery, wiring, and electrical system repairs.',
    color: 'from-yellow-400 to-yellow-500',
  },
  {
    icon: Gauge,
    title: 'Engine Tuning',
    description: 'Performance optimization and engine diagnostics.',
    color: 'from-emerald-500 to-green-600',
  },
  {
    icon: ShieldCheck,
    title: 'Full Inspection',
    description: 'Comprehensive 50-point vehicle inspection.',
    color: 'from-primary to-primary/80',
  },
];

export function ServiceSection() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleBookService = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsBookingOpen(true);
  };

  return (
    <section id="service" className="section-padding bg-background relative">
      <div className="container-custom">
        {/* Section Header */}
        <ScrollAnimation animation="fade-up" className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Expert Care</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-2 mb-4">
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our certified technicians provide top-quality maintenance and repair services 
            to keep your bike running at peak performance.
          </p>
        </ScrollAnimation>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ScrollAnimation key={index} animation="fade-up" delay={index * 100}>
              <div className="group p-6 bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {service.description}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary font-semibold"
                  onClick={() => handleBookService(service.title)}
                >
                  Book Now →
                </Button>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* CTA */}
        <ScrollAnimation animation="fade-up" className="text-center mt-12">
          <Button 
            variant="accent" 
            size="xl"
            onClick={() => handleBookService('Service Appointment')}
          >
            Book Service Appointment
          </Button>
        </ScrollAnimation>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
        serviceType={selectedService}
      />
    </section>
  );
}
