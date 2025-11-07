import { useMemo, useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export function StripePaymentForm({ clientSecret, orderId, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const genericErrorMessage = useMemo(
    () => 'We couldn’t complete the payment. Please check your details or try another payment method.',
    []
  );

  const getFriendlyErrorMessage = (rawMessage?: string | null) => {
    if (!rawMessage) {
      return genericErrorMessage;
    }

    const lowerMessage = rawMessage.toLowerCase();
    const technicalIndicators = [
      'stripe.',
      'confirmpayment',
      'paymentintent',
      'client secret',
      'element',
      'api',
      'unexpected state',
    ];

    const isTechnical = technicalIndicators.some((indicator) => lowerMessage.includes(indicator));

    if (isTechnical) {
      return genericErrorMessage;
    }

    return rawMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        const friendly = getFriendlyErrorMessage(submitError.message);
        console.error('Stripe payment submission error:', submitError);
        setErrorMessage(friendly);
        onError(friendly);
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order/${orderId}/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        const friendly = getFriendlyErrorMessage(error.message);
        console.error('Stripe confirmPayment error:', error);
        setErrorMessage(friendly);
        onError(friendly);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onSuccess(orderId);
      } else {
        // Payment requires action (3D Secure, etc.)
        setErrorMessage('Payment requires additional authentication. Please complete the verification.');
      }
    } catch (err: any) {
      console.error('Stripe payment unexpected error:', err);
      const message = getFriendlyErrorMessage(err?.message);
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg p-4 bg-card">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment information is encrypted and secure. We never store your card details.
      </p>
    </form>
  );
}

