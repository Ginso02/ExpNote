import { useState, type FormEvent } from "react";
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
import { changePassword } from "@/lib/auth";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!oldPassword) {
      setError("请输入原密码");
      return;
    }
    if (newPassword.length < 6) {
      setError("新密码长度至少为 6 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }
    if (oldPassword === newPassword) {
      setError("新密码不能与原密码相同");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "修改密码失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">修改密码</CardTitle>
          <CardDescription>请输入原密码和新密码</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary flex items-center gap-2">
                <CheckCircle2 size={16} />
                密码修改成功
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="oldPassword">原密码</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入原密码"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="至少 6 位，包含字母和数字"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
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
              修改密码
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
