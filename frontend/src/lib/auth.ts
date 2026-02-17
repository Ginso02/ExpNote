import api from "./api";

export interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

/** 注册 */
export async function register(data: {
  username: string;
  email: string;
  password: string;
}) {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
}

/** 登录 */
export async function login(data: { login_id: string; password: string }) {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
}

/** 退出登录 */
export async function logout() {
  const res = await api.post<{ message: string }>("/auth/logout");
  return res.data;
}

/** 修改密码 */
export async function changePassword(data: {
  old_password: string;
  new_password: string;
}) {
  const res = await api.post<{ message: string }>(
    "/auth/change-password",
    data
  );
  return res.data;
}

/** 忘记密码 - 发送重置邮件 */
export async function forgotPassword(email: string) {
  const res = await api.post<{ message: string }>("/auth/forgot-password", {
    email,
  });
  return res.data;
}

/** 重置密码 */
export async function resetPassword(data: {
  token: string;
  new_password: string;
}) {
  const res = await api.post<{ message: string }>(
    "/auth/reset-password",
    data
  );
  return res.data;
}

/** 获取当前用户信息 */
export async function getProfile() {
  const res = await api.get<{ user: User }>("/user/profile");
  return res.data;
}
