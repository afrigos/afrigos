import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  const faqCategories = [
    {
      title: "General Questions",
      items: [
        {
          question: "What is AfriGos?",
          answer: "AfriGos is a trusted marketplace dedicated to authentic African products. We connect vendors across the continent with customers worldwide, offering a curated selection of food, fashion, home decor, and more.",
        },
        {
          question: "How do I create an account?",
          answer: "Creating an account is easy! Click on 'Sign Up' in the top right corner, fill in your details, and verify your email address. You can start shopping immediately after registration.",
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, absolutely. We take data security seriously and use industry-standard encryption to protect your personal information. Please review our Privacy Policy for more details.",
        },
      ],
    },
    {
      title: "Shopping & Orders",
      items: [
        {
          question: "How do I place an order?",
          answer: "Browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or log in, provide your shipping address, and complete the payment. You'll receive a confirmation email once your order is placed.",
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "You can modify or cancel your order within 2 hours of placing it, as long as it hasn't been shipped. Contact our customer support team immediately if you need to make changes.",
        },
        {
          question: "How do I track my order?",
          answer: "Once your order ships, you'll receive a tracking number via email. You can use this tracking number on our Order Tracking page or the shipping carrier's website to monitor your package's progress.",
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards, debit cards, and other secure payment methods through our payment gateway. All payments are processed securely.",
        },
      ],
    },
    {
      title: "Shipping & Delivery",
      items: [
        {
          question: "Where do you ship?",
          answer: "We ship to locations worldwide. Shipping costs and delivery times vary by destination. Check our Shipping Info page for detailed information.",
        },
        {
          question: "How long does shipping take?",
          answer: "Shipping times depend on your location and the shipping method selected. Standard shipping typically takes 7-14 business days for international orders and 3-5 business days for domestic orders.",
        },
        {
          question: "What are the shipping costs?",
          answer: "Shipping costs vary based on your location and the shipping method selected. Standard shipping starts at £5.99. Check our Shipping Info page for complete details on shipping options and costs.",
        },
        {
          question: "What if my package is damaged or lost?",
          answer: "If your package arrives damaged or is lost in transit, please contact our customer support team immediately. We'll work with you to resolve the issue, which may include a replacement or refund.",
        },
      ],
    },
    {
      title: "Returns & Refunds",
      items: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for most items. Items must be unused, in original packaging, and with all tags attached. Some items may have different return policies - check product pages for details.",
        },
        {
          question: "How do I return an item?",
          answer: "To return an item, log into your account, go to your orders, and initiate a return request. Once approved, you'll receive return instructions and a return shipping label if applicable.",
        },
        {
          question: "How long do refunds take?",
          answer: "Once we receive your returned item, we'll process your refund within 5-7 business days. The refund will be credited to your original payment method, and it may take additional time for your bank to process it.",
        },
        {
          question: "Can I exchange an item?",
          answer: "Exchanges are available for items in different sizes or colors, subject to availability. Contact our customer support team to request an exchange.",
        },
      ],
    },
    {
      title: "Vendor Questions",
      items: [
        {
          question: "How do I become a vendor?",
          answer: "To become a vendor, click on 'Vendor Signup' and complete the application form. Our team will review your application and get back to you within 2-3 business days.",
        },
        {
          question: "What are the vendor fees?",
          answer: "Our commission structure is competitive and transparent. Contact our vendor support team for detailed information about fees and commission rates.",
        },
        {
          question: "How do I list my products?",
          answer: "Once approved as a vendor, you can log into your vendor dashboard and add products. All products go through an approval process to ensure quality and authenticity.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about shopping, shipping, returns, and more
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {faqCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem 
                      key={itemIndex} 
                      value={`item-${index}-${itemIndex}`}
                    >
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <Card className="mt-12 max-w-2xl mx-auto bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our customer support team is here to help.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}