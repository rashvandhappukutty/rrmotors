import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CareerEnquiryForm } from './CareerEnquiryForm';
import { Briefcase, Users, Award, ArrowRight } from 'lucide-react';
import { ScrollAnimation } from './ScrollAnimation';

export function CareerSection() {
  const [showForm, setShowForm] = useState(false);

  const careers = [
    {
      title: 'Sales Executive',
      description: 'Lead our sales team and achieve targets while building customer relationships',
      icon: Briefcase,
      benefits: ['Competitive salary', 'Performance bonus']
    },
    {
      title: 'Mechanics & Technicians',
      description: 'Work on premium bikes with state-of-the-art tools and equipment',
      icon: Award,
      benefits: ['Career growth', 'Competitive pay']
    },
    {
      title: 'Customer Service',
      description: 'Provide exceptional support and build lasting customer relationships',
      icon: Users,
      benefits: ['Friendly work culture', 'Flexible hours']
    }
  ];

  return (
    <section id="careers" className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-background to-accent/5">
      <div className="max-w-6xl mx-auto">
        <ScrollAnimation>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Join <span className="text-primary">RR Motors</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Be part of a dynamic team passionate about motorcycles and exceptional customer service
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {careers.map((career, index) => {
            const IconComponent = career.icon;
            return (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <Card className="h-full border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{career.title}</CardTitle>
                    <CardDescription>{career.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {career.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            );
          })}
        </div>

        <ScrollAnimation>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-8 md:p-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Join Our Team?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Fill out the job application form below. We review all applications carefully and will contact qualified candidates for interviews.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ScrollAnimation>

        {showForm && <CareerEnquiryForm onClose={() => setShowForm(false)} />}
      </div>
    </section>
  );
}
