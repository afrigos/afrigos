import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api-config";
import { useAuth } from "@/contexts/AuthContext";

interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    token: string;
  };
}

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const redirectPath = searchParams.get('redirect') || '/';
  const role = searchParams.get('role') || 'customer'; // 'customer' or 'vendor'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      // Focus last input
      inputRefs.current[5]?.focus();
      // Auto-verify
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const otpValue = otpCode || otp.join('');
    
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: "Email Required",
        description: "Email address is missing. Please try signing up again.",
        variant: "destructive",
      });
      navigate('/auth/customer-signup');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpValue,
        }),
      });

      const data: VerifyEmailResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Verification failed');
      }

      // Store token and user data
      if (data.data.token) {
        localStorage.setItem('afrigos-token', data.data.token);
        localStorage.setItem('afrigos-user', JSON.stringify(data.data.user));
        
        // Update AuthContext - handle both customer and vendor roles
        const userRole = data.data.user.role?.toLowerCase() || role;
        const transformedUser = {
          id: data.data.user.id,
          email: data.data.user.email,
          name: `${data.data.user.firstName} ${data.data.user.lastName}`,
          role: (userRole === 'vendor' ? 'vendor' : 'customer') as 'customer' | 'vendor',
          avatar: null,
          vendorId: (data.data.user as any).vendorProfile?.id || (data.data.user as any).vendorId,
          vendorName: (data.data.user as any).vendorProfile?.businessName || (data.data.user as any).vendorName,
          isActive: data.data.user.isActive,
          isVerified: true
        };
        setUser(transformedUser);
      }

      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified.",
      });

      // Redirect based on role and redirectPath
      if (redirectPath && redirectPath !== '/') {
        navigate(redirectPath);
      } else if (role === 'vendor' || data.data.user.role === 'VENDOR') {
        // For vendors, check if they're approved or pending
        const isPendingApproval = !data.data.user.isActive || 
          ((data.data.user as any).vendorProfile?.verificationStatus !== 'VERIFIED');
        
        if (isPendingApproval) {
          navigate('/auth/pending-approval');
        } else {
          navigate('/vendor/orders');
        }
      } else {
        navigate('/account');
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired verification code. Please try again.",
        variant: "destructive",
      });
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Email address is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to resend code');
      }

      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });

      // Reset timer and OTP
      setTimeRemaining(600); // 10 minutes
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Email address is missing.</p>
              <Button onClick={() => navigate('/auth/customer-signup')}>
                Go to Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <img 
            src="/afrigos.jpg" 
            alt="AfriGos Logo" 
            className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover"
          />
          <h1 className="text-2xl font-bold text-foreground">AfriGos</h1>
          <p className="text-muted-foreground">Verify Your Email</p>
        </div>

        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to
            </CardDescription>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{email}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-4">
              <Label className="text-center block">Enter Verification Code</Label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold"
                    disabled={isLoading}
                  />
                ))}
              </div>
              
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Code expires in {formatTime(timeRemaining)}</span>
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={() => handleVerify()}
              className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90"
              disabled={isLoading || otp.some(digit => !digit)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              {canResend ? (
                <Button
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-primary"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code? Resend in {formatTime(timeRemaining)}
                </p>
              )}
            </div>

            {/* Back to Sign Up */}
            <div className="text-center pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth/customer-signup')}
                className="text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

