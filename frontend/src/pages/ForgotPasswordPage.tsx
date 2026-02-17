import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

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
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("请输入邮箱地址");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "发送失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">邮件已发送</CardTitle>
            <CardDescription>
              如果该邮箱已注册，重置链接已发送至您的邮箱。
              请检查您的收件箱（包括垃圾邮件）。
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              重新发送
            </Button>
            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft size={16} />
                返回登录
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">忘记密码</CardTitle>
          <CardDescription>
            输入您的注册邮箱，我们将发送密码重置链接
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
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              发送重置链接
            </Button>
            <Link to="/login" className="w-full">
              <Button type="button" variant="ghost" className="w-full">
                <ArrowLeft size={16} />
                返回登录
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
