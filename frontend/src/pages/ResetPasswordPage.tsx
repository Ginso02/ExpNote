import { useState, type FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

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
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">链接无效</CardTitle>
            <CardDescription>
              密码重置链接无效或已过期，请重新申请。
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/forgot-password" className="w-full">
              <Button className="w-full">重新申请重置</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("密码长度至少为 6 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, new_password: newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(
        axiosErr.response?.data?.error || "重置失败，链接可能已过期"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">密码已重置</CardTitle>
            <CardDescription>
              您的密码已成功重置，请使用新密码登录。
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/login")}>
              前往登录
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">重置密码</CardTitle>
          <CardDescription>请输入您的新密码</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="至少 6 位，包含字母和数字"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="请再次输入新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              重置密码
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
