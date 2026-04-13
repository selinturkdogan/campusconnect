import { useState, FormEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const mouse = { x: -999, y: -999 };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    type Node = { x: number; y: number; vx: number; vy: number; r: number; blue: boolean };
    const nodes: Node[] = Array.from({ length: 46 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.2 + 1.4,
      blue: Math.random() < 0.55,
    }));

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -999; mouse.y = -999; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < 110) { n.x -= dx * 0.018; n.y -= dy * 0.018; }

        nodes.slice(i + 1).forEach((m) => {
          const ed = Math.hypot(m.x - n.x, m.y - n.y);
          if (ed < 135) {
            const a = 1 - ed / 135;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = n.blue
              ? `rgba(26,58,143,${a * 0.3})`
              : `rgba(26,173,130,${a * 0.3})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        });

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.blue ? "rgba(26,58,143,0.55)" : "rgba(26,173,130,0.6)";
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

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
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldBase: React.CSSProperties = {
    border: "2px solid #cce0f5",
    background: "#f0f8ff",
    color: "#1a3a8f",
    fontFamily: "'Outfit', sans-serif",
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center w-[52%] relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #c8ddf7 0%, #d6eef0 60%, #c8efe3 100%)" }}
      >
        <NetworkCanvas />

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <img
            src="/logo.png"
            alt="CampusConnect"
            style={{
              width: "420px",
              maxWidth: "85%",
              height: "auto",
              objectFit: "contain",
              marginBottom: "24px",
              mixBlendMode: "multiply",
            }}
          />
          <p
            style={{
              color: "#2a5a8a",
              fontSize: "16px",
              lineHeight: "1.7",
              maxWidth: "320px",
              fontWeight: 500,
            }}
          >
            One platform for all your university needs — clubs, events, and academic resources.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-10 relative" style={{ background: "linear-gradient(160deg, #f0f7ff 0%, #f0fbf8 100%)" }}>
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(26,173,130,0.12) 0%,transparent 70%)" }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(26,58,143,0.1) 0%,transparent 70%)" }}
        />

        <div className="w-full max-w-sm relative z-10">

          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="/logo.png"
              alt="CampusConnect"
              style={{ height: "40px", objectFit: "contain", mixBlendMode: "multiply" }}
            />
          </div>

          <h2 className="text-3xl font-extrabold mb-1" style={{ color: "#1a3a8f" }}>
            Welcome
          </h2>
          <p className="text-sm mb-8" style={{ color: "#6a9abf" }}>
            Sign in with your university credentials
          </p>

          {error && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-sm border"
              style={{ background: "#fff5f5", borderColor: "#fca5a5", color: "#c44444" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#a0bbd0" }}>
              Email Address
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
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all mb-5 disabled:opacity-60"
              style={fieldBase}
              onFocus={(e) => { e.target.style.borderColor = "#1a3a8f"; e.target.style.background = "white"; }}
              onBlur={(e) => { e.target.style.borderColor = "#cce0f5"; e.target.style.background = "#f0f8ff"; }}
            />

            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#a0bbd0" }}>
              Password
            </label>
            <div className="relative mb-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all disabled:opacity-60"
                style={fieldBase}
                onFocus={(e) => { e.target.style.borderColor = "#1aad82"; e.target.style.background = "white"; }}
                onBlur={(e) => { e.target.style.borderColor = "#cce0f5"; e.target.style.background = "#f0f8ff"; }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#a0bbd0" }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-3 mb-3">
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "#4a7aaa" }}>
                <input type="checkbox" className="w-3.5 h-3.5" style={{ accentColor: "#1a3a8f" }} />
                Remember me
              </label>
              <span className="text-xs font-medium cursor-pointer" style={{ color: "#1aad82" }}>
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white relative overflow-hidden transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #1a3a8f 0%, #2176c7 50%, #1aad82 100%)", fontFamily: "'Outfit', sans-serif" }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "#8aadcc" }}>
            No account?{" "}
            <span className="font-semibold" style={{ color: "#1aad82" }}>
              Contact your university admin.
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}
