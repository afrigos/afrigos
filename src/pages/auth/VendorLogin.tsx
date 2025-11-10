import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, Store } from "lucide-react";

type Notice = {
  type: "error" | "success" | "info";
  title: string;
  message: string;
} | null;

type VendorProfilePayload = {
  id?: string | null;
  businessName?: string | null;
};

type VendorUserPayload = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  isActive?: boolean | null;
  isVerified?: boolean | null;
  vendorId?: string | null;
  vendorName?: string | null;
  vendorProfile?: VendorProfilePayload | null;
};

type VendorLoginResponse = {
  token: string;
  user: VendorUserPayload;
  isPendingApproval?: boolean;
};

const VendorLogin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isVendor, user, loading, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [notice, setNotice] = useState<Notice>(null);

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
    showPassword: false,
  });

  const [signUpForm, setSignUpForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
  });

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      if (isVendor && user?.vendorId) {
        navigate("/vendor/orders", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isVendor, user, loading, navigate]);

  const signInDisabled = useMemo(
    () => !signInForm.email.trim() || !signInForm.password.trim(),
    [signInForm.email, signInForm.password]
  );

  const signUpDisabled = useMemo(() => {
    const { firstName, lastName, email, phone, password, confirmPassword } = signUpForm;
    return (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      password !== confirmPassword
    );
  }, [signUpForm]);

  const setBanner = (type: Notice["type"], title: string, message: string) => {
    setNotice({ type, title, message });
  };

  const clearBanner = () => setNotice(null);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (signInDisabled) return;

    clearBanner();
    setIsSigningIn(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        message?: string;
        data?: VendorLoginResponse;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: signInForm.email.trim(),
          password: signInForm.password,
        }),
      });

      if (!response.success || !response.data?.token || !response.data?.user) {
        throw new Error(response.message || "Invalid vendor credentials.");
      }

      if (response.data.user.role !== "VENDOR") {
        throw new Error("This account is not registered as a vendor.");
      }

      const vendorUser = {
        id: response.data.user.id,
        email: response.data.user.email,
        name:
          `${response.data.user.firstName ?? ""} ${response.data.user.lastName ?? ""}`.trim() ||
          response.data.user.email,
        role: "vendor" as const,
        vendorId:
          response.data.user.vendorProfile?.id ||
          response.data.user.vendorId ||
          undefined,
        vendorName:
          response.data.user.vendorProfile?.businessName ||
          response.data.user.vendorName ||
          undefined,
        isActive: Boolean(response.data.user.isActive),
        isVerified: Boolean(response.data.user.isVerified),
      };

      localStorage.setItem("afrigos-token", response.data.token);
      localStorage.setItem("afrigos-user", JSON.stringify(vendorUser));
      setUser(vendorUser);

      if (response.data.isPendingApproval || !response.data.user.isActive) {
        setBanner(
          "info",
          "Vendor account pending approval",
          "Thanks for signing in. Your store is awaiting approval – we'll notify you by email."
        );
        navigate("/auth/pending-approval", { replace: true });
        return;
      }

      navigate("/vendor/orders", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in at the moment. Please try again.";
      setBanner("error", "Login failed", message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (signUpDisabled) return;

    clearBanner();
    setIsSigningUp(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        message?: string;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: signUpForm.firstName.trim(),
          lastName: signUpForm.lastName.trim(),
          email: signUpForm.email.trim(),
          phone: signUpForm.phone.trim(),
          password: signUpForm.password,
          role: "VENDOR",
        }),
      });

      if (!response.success) {
        throw new Error(response.message || "We couldn't create your vendor account.");
      }

      setBanner(
        "success",
        "Vendor account created",
        "Your vendor profile has been submitted. Sign in to track approval progress."
      );
      setActiveTab("signin");
      setSignInForm({
        email: signUpForm.email,
        password: "",
        showPassword: false,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create vendor account right now. Please try again later.";
      setBanner("error", "Sign up failed", message);
    } finally {
      setIsSigningUp(false);
    }
  };

  const renderNotice = () => {
    if (!notice) return null;
    return (
      <Alert variant={notice.type === "error" ? "destructive" : "default"}>
        <AlertTitle>{notice.title}</AlertTitle>
        <AlertDescription>{notice.message}</AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 via-muted/20 to-background">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <Card className="w-full max-w-2xl border-0 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Store className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-semibold text-foreground">Vendor Portal</CardTitle>
              <CardDescription className="mt-2 text-base">
                Sign in to manage orders and inventory or create your AfriGos vendor account.
              </CardDescription>
          </div>
            <div className="flex items-center rounded-full bg-muted p-1">
              {(["signin", "signup"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    clearBanner();
                    setActiveTab(tab);
                  }}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === tab
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
        </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {renderNotice()}

            {activeTab === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="vendor-email">Email</Label>
                  <Input
                    id="vendor-email"
                    type="email"
                    placeholder="vendor@brand.com"
                    autoComplete="email"
                    required
                    value={signInForm.email}
                    onChange={(event) =>
                      setSignInForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="vendor-password"
                      type={signInForm.showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      value={signInForm.password}
                      onChange={(event) =>
                        setSignInForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSignInForm((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label={signInForm.showPassword ? "Hide password" : "Show password"}
                    >
                      {signInForm.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <Link to="/auth/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                  <Link to="/auth/login" className="hover:text-primary">
                    Need customer login?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isSigningIn || signInDisabled}>
                  {isSigningIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-first-name">First name</Label>
                    <Input
                      id="vendor-first-name"
                      placeholder="John"
                      required
                      value={signUpForm.firstName}
                      onChange={(event) =>
                        setSignUpForm((prev) => ({ ...prev, firstName: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor-last-name">Last name</Label>
                    <Input
                      id="vendor-last-name"
                      placeholder="Doe"
                      required
                      value={signUpForm.lastName}
                      onChange={(event) =>
                        setSignUpForm((prev) => ({ ...prev, lastName: event.target.value }))
                      }
                    />
                  </div>
                </div>

              <div className="space-y-2">
                  <Label htmlFor="vendor-signup-email">Business email</Label>
                <Input
                    id="vendor-signup-email"
                  type="email"
                    placeholder="you@brand.com"
                    autoComplete="email"
                  required
                    value={signUpForm.email}
                    onChange={(event) =>
                      setSignUpForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="vendor-phone">Phone number</Label>
                  <Input
                    id="vendor-phone"
                    type="tel"
                    placeholder="+44 7890 123456"
                    required
                    value={signUpForm.phone}
                    onChange={(event) =>
                      setSignUpForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor-signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="vendor-signup-password"
                      type={signUpForm.showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      required
                      value={signUpForm.password}
                      onChange={(event) =>
                        setSignUpForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                    />
                    <button
                    type="button"
                      onClick={() =>
                        setSignUpForm((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label={signUpForm.showPassword ? "Hide password" : "Show password"}
                    >
                      {signUpForm.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor-confirm-password">Confirm password</Label>
                  <Input
                    id="vendor-confirm-password"
                    type="password"
                    placeholder="Repeat password"
                    required
                    value={signUpForm.confirmPassword}
                    onChange={(event) =>
                      setSignUpForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                  />
              </div>

                <p className="text-xs text-muted-foreground">
                  By creating an AfriGos vendor account, you agree that your store will be reviewed by
                  our marketplace team before activation.
                </p>

                <Button type="submit" className="w-full" disabled={isSigningUp || signUpDisabled}>
                  {isSigningUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Create Vendor Account"
                  )}
              </Button>
            </form>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorLogin;
