import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, AlertCircle, X } from 'lucide-react';
import { FinanceQuoteModal } from '@/components/FinanceQuoteModal';

export function FinancePage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetFinanceOptions = () => {
    setIsQuoteOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pt-28 pb-12">
      <div className="container-custom">
        {/* Exit Button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Exit
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 p-3 bg-gradient-primary rounded-full">
            <DollarSign className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
            Finance Options
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get flexible financing options for your dream bike. Fill in your details and our team will contact you with the best offers.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Call to Action Card */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle>Get Finance Options</CardTitle>
              <CardDescription>
                Flexible financing for your dream bike
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Provide your details and we'll send you personalized financing options with competitive rates.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Competitive interest rates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Quick approval within 24 hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Flexible payment tenure up to 60 months</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Minimal documentation required</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleGetFinanceOptions}
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-2 h-auto"
                size="lg"
              >
                Get Finance Options
              </Button>
            </CardContent>
          </Card>

          {/* Finance Benefits */}
          <div className="space-y-4">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Finance Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { icon: '✓', title: 'Low Interest Rates', desc: 'Competitive rates' },
                    { icon: '✓', title: 'Quick Approval', desc: 'Get approval within 24 hours' },
                    { icon: '✓', title: 'Flexible Tenure', desc: 'Payment options up to 60 months' },
                    { icon: '✓', title: 'Minimal Documentation', desc: 'Simple and easy paperwork' },
                    { icon: '✓', title: 'Zero Down Payment', desc: 'Available for eligible customers' },
                    { icon: '✓', title: 'Insurance Options', desc: 'Comprehensive coverage available' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="text-green-600 text-xl font-bold flex-shrink-0">
                        {benefit.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200/50 bg-yellow-50/50 shadow-lg">
              <CardHeader>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <CardTitle className="text-lg text-yellow-900">Need Assistance?</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800">
                  Our finance team is available to answer any questions. Call us at <span className="font-semibold">+91 96777 92722</span> or <span className="font-semibold">+91 78719 76070</span> or visit our showroom for personalized assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'What documents are required for finance approval?',
                a: 'You will need ID proof, address proof, and income proof. Our team will guide you through the exact requirements.'
              },
              {
                q: 'How long does the approval process take?',
                a: 'Typically, you get approval within 24 hours of submitting all required documents.'
              },
              {
                q: 'Can I prepay the loan without penalty?',
                a: 'Yes! You can prepay your loan anytime without any additional charges or penalties.'
              },
              {
                q: 'Is insurance included in the finance?',
                a: 'Insurance is optional but highly recommended. You can add it during the finance process.'
              }
            ].map((faq, index) => (
              <Card key={index} className="border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Finance Quote Modal */}
      <FinanceQuoteModal 
        isOpen={isQuoteOpen} 
        onClose={() => setIsQuoteOpen(false)} 
      />
    </div>
  );
}
