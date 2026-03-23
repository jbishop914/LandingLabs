import { useState } from "react";
import { useLocation } from "wouter";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { DEMO_PRESETS } from "@/lib/particles/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  mode: "login" | "signup";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login" ? { username, password } : { username, password, email };
      const res = await apiRequest("POST", endpoint, body);
      const data = await res.json();
      if (data.success) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use the vortex preset for auth background
  const bgPreset = DEMO_PRESETS[2];

  return (
    <div className="relative w-full min-h-screen overflow-hidden" data-testid={`${mode}-page`}>
      <ParticleCanvas
        config={bgPreset.config}
        backgroundColor={bgPreset.backgroundColor}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl border-white/10">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="flex items-center gap-2" onClick={() => navigate("/")} role="button" tabIndex={0} data-testid="logo-link">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold text-lg">LandingLabs</span>
              </div>
            </div>
            <CardTitle className="text-xl text-white">
              {mode === "login" ? "Welcome back" : "Start your free trial"}
            </CardTitle>
            <CardDescription className="text-white/50">
              {mode === "login"
                ? "Sign in to your account to continue building"
                : "24 hours of full access. No credit card required."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                    required
                    data-testid="input-email"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/70">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                  required
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                  required
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                disabled={loading}
                data-testid="submit-button"
              >
                {loading ? "Loading..." : mode === "login" ? "Sign in" : "Start free trial"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate(mode === "login" ? "/signup" : "/login")}
                className="text-white/40 text-sm hover:text-white/70 transition-colors"
                data-testid="auth-toggle"
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        data-testid="back-button"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>
    </div>
  );
}
