import { FormEvent, useEffect, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import type { PaymentIntent } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, ShieldCheck, CheckCircle } from "lucide-react";

type StripePaymentFormProps = {
  clientSecret: string;
  orderId: string;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
  mockPayment?: boolean;
};

const resolvePaymentMessage = (paymentIntent: PaymentIntent | null) => {
  if (!paymentIntent) return null;

  switch (paymentIntent.status) {
    case "succeeded":
      return "Payment succeeded. Finalising your order…";
    case "processing":
      return "Your payment is processing. We’ll update you once it’s complete.";
    case "requires_payment_method":
      // return "Your payment was not successful, please try another payment method.";
      return null; // Let Stripe's error message handle this
    default:
      return null;
  }
};

export function StripePaymentForm({
  clientSecret,
  orderId,
  onSuccess,
  onError,
  mockPayment = false,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle mock payment mode - automatically succeed
  useEffect(() => {
    if (mockPayment && clientSecret.startsWith('mock_secret_')) {
      console.log('🧪 Mock payment mode: Automatically processing payment');
      setMessage('Payment succeeded. Finalising your order…');
      // Small delay to show the message, then redirect
      setTimeout(() => {
        onSuccess(orderId);
      }, 1000);
    }
  }, [mockPayment, clientSecret, orderId, onSuccess]);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    let active = true;

    const fetchPaymentIntent = async () => {
      const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

      if (!active) {
        return;
      }

      if (error?.message) {
        setMessage(error.message);
        return;
      }

      setMessage(resolvePaymentMessage(paymentIntent));

      if (paymentIntent?.status === "succeeded") {
        onSuccess(orderId);
      }
    };

    fetchPaymentIntent();

    return () => {
      active = false;
    };
  }, [stripe, clientSecret, orderId, onSuccess]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Skip Stripe in mock payment mode
    if (mockPayment && clientSecret.startsWith('mock_secret_')) {
      setMessage('Payment succeeded. Finalising your order…');
      setIsProcessing(true);
      setTimeout(() => {
        onSuccess(orderId);
      }, 1000);
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}/confirmation`,
      },
      redirect: "if_required",
    });

    if (error) {
      const errorMessage = error.message ?? "An unexpected error occurred. Please try again.";
      setMessage(errorMessage);
      onError(errorMessage);
      setIsProcessing(false);
      return;
    }

    const status = paymentIntent?.status;

    if (status === "succeeded") {
      setMessage("Payment succeeded. Finalising your order…");
      onSuccess(orderId);
    } else if (status === "processing") {
      setMessage("Your payment is processing. We’ll update you once it’s complete.");
    } else if (status === "requires_payment_method") {
      // const fallbackMessage = "Your payment was not successful, please try again.";
      // setMessage(fallbackMessage);
      // onError(fallbackMessage);
    } else {
      setMessage("Payment status unknown. Please check your card details and try again.");
    }

    setIsProcessing(false);
  };

  // Show mock payment success message instead of Stripe form
  if (mockPayment && clientSecret && clientSecret.startsWith('mock_secret_')) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-300 bg-green-50 p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Payment Successful</h3>
              <p className="text-sm text-green-700 mt-1">
                Your payment has been processed successfully. Redirecting to order confirmation...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {message && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Payments are secured with Stripe. No card details are stored on AfriGos.</span>
        </div>
        <Badge variant="outline" className="w-fit">
          Powered by Stripe
        </Badge>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing payment…
          </>
        ) : (
          "Pay securely"
        )}
      </Button>
    </form>
  );
}

export default StripePaymentForm;
