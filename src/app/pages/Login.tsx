import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-primary mb-2">
            <GraduationCap className="w-10 h-10" />
            <span className="text-3xl font-bold">CampusConnect</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Sign in with your university credentials
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          <h1 className="text-xl font-semibold mb-6 text-center">Welcome back</h1>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                autoComplete="email"
                disabled={isLoading}
                className="w-full px-3 py-2.5 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 pr-10 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don't have an account? Contact your university administrator.
          </p>
        </div>
      </div>
    </div>
  );
}