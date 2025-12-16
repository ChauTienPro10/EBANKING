import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError(t("auth.enterAll"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });
      const { jwt, refreshToken, message } = response.data;

      if (jwt && refreshToken) {
        localStorage.setItem("authToken", jwt);
        localStorage.setItem("refreshToken", refreshToken);
        navigate("/app");
      } else {
        setError(message || t("auth.loginFailed"));
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || t("auth.loginError");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{t("auth.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                disabled={isLoading}
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("auth.loading") : t("auth.login")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
