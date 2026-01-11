/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Package, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import Image from "next/image";
import shelfImage from "@/public/images/shelf.jpg";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, stayLoggedIn }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const { token } = data;
      localStorage.setItem("token", token);
      router.push("/inventory");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#EFF6FF] to-[#E0E7FF] items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-full mb-12 flex items-center justify-center relative overflow-hidden rounded-2xl">
            <Image
              src={shelfImage}
              height={512}
              width={500}
              alt="Shelf with items"
              className="object-cover rounded-2xl"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Organize Everything
          </h2>
          <p className="text-muted-foreground">
            Keep track of your belongings, warranties, and important documents
            all in one secure place.
          </p>
        </div>
      </div>

      {/* Right side (form) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Home Inventory
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and organize your things
            </p>
          </div>

          {/* Login form */}
          <div className="bg-card rounded-xl border p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={stayLoggedIn}
                    onCheckedChange={(checked: boolean) =>
                      setStayLoggedIn(checked as boolean)
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Stay logged in
                  </span>
                </label>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Submit button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* register */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              No account? Register via API (see{" "}
              <a
                href="http://4.213.57.100:3100/swagger/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Swagger
              </a>
              ).
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground mb-2">Version 1.2.4</p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground">
                Help Center
              </a>
              <span>•</span>
              <a href="#" className="hover:text-foreground">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-foreground">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
