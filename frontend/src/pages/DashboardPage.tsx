import { useNavigate } from "react-router-dom";
import { LogOut, KeyRound, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <h1 className="text-lg font-bold">ExpNote</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.username}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} />
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">仪表盘</h2>
          <p className="text-muted-foreground">
            欢迎回来，{user?.username}！
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 用户信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} />
                账户信息
              </CardTitle>
              <CardDescription>您的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">用户名</span>
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">邮箱</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">角色</span>
                <span className="text-sm font-medium">
                  {user?.role === "admin" ? "管理员" : "普通用户"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">注册时间</span>
                <span className="text-sm font-medium">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("zh-CN")
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 安全设置卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound size={18} />
                安全设置
              </CardTitle>
              <CardDescription>管理您的账户安全</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/change-password")}
              >
                <KeyRound size={16} />
                修改密码
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 占位：未来功能区 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🚀 功能即将上线</CardTitle>
            <CardDescription>
              实验笔记管理、图表同步、论文看板等核心功能正在开发中……
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
