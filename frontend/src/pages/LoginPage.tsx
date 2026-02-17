import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginId.trim() || !password) {
      setError("请输入用户名/邮箱和密码");
      return;
    }

    setLoading(true);
    try {
      await login(loginId.trim(), password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">登录 ExpNote</CardTitle>
          <CardDescription>
            输入您的账户信息以登录
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="loginId">用户名 / 邮箱</Label>
              <Input
                id="loginId"
                type="text"
                placeholder="请输入用户名或邮箱"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  忘记密码？
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              登录
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              还没有账户？{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                立即注册
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
