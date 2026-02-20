import { useState, useEffect } from 'react';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { Wrench, Award, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const features = [
  { icon: Award, label: 'Our Commitment', desc: 'Delivering Excellence in Every Ride' },
  { icon: Users, label: 'Expert Team', desc: 'Certified mechanics & consultants' },
  { icon: Wrench, label: 'Full Service', desc: 'Complete maintenance solutions' },
  { icon: Clock, label: '3+ Years', desc: 'Trusted industry experience' },
];

const aboutImages = [
  '/1st.jpeg',
  '/2nd.jpeg',
  '/3rd.jpeg',
];

export function AboutSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % aboutImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentImage((prev) => (prev - 1 + aboutImages.length) % aboutImages.length);
  };

  const goToNext = () => {
    setCurrentImage((prev) => (prev + 1) % aboutImages.length);
  };

  return (
    <section id="about" className="section-padding bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/50 to-transparent pointer-events-none" />
      
      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <ScrollAnimation animation="slide-left">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-2 mb-6">
                Your Trusted Partner in
                <span className="text-gradient"> TWO WHEELER Excellence</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Welcome to RR Motors, where passion for motorcycles meets exceptional service. 
                For 3 years, we've been the premier destination for riders seeking quality, 
                performance, and unmatched customer care.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Our showroom features an extensive collection of new and pre-owned motorcycles 
                from the world's leading manufacturers. Whether you're a seasoned rider or taking 
                your first step into the world of motorcycling, our expert team is here to guide you 
                to your perfect ride.
              </p>
              
              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.label}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimation>

          {/* Image / Visual */}
          <ScrollAnimation animation="slide-right">
            <div className="relative">
              {/* Carousel container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Main carousel image */}
                <div className="relative w-full h-80 bg-gradient-dark">
                  <img
                    src={aboutImages[currentImage]}
                    alt={`About Us ${currentImage + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                </div>

                {/* Navigation buttons */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 z-10"
                >
                  <ChevronLeft className="w-6 h-6 text-black" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 z-10"
                >
                  <ChevronRight className="w-6 h-6 text-black" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {aboutImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImage ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-card-hover border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-foreground">4.9★</div>
                    <div className="text-sm text-muted-foreground">Customer Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
