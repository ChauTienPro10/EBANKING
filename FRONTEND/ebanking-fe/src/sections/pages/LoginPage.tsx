import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"login" | "otp">("login");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const { t } = useTranslation();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stage === "login") {
      if (!username || !password) {
        setError(t('auth.enterAll'));
        return;
      }
      setError(null);
      setStage("otp");
    } else {
      if (otp === "000000") {
        setError(t('auth.locked'));
        return;
      }
      if (otp.length === 6) {
        navigate("/app");
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setError(next >= 3 ? t('auth.locked') : t('auth.invalidOtp'));
      }
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{t('auth.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {stage === "login" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">{t('auth.username')}</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="otp">{t('auth.otp')}</Label>
                <Input id="otp" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 digits" />
                <p className="text-xs text-muted-foreground">{t('auth.otpHint')}</p>
              </div>
            )}
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full">{stage === "login" ? t('auth.login') : t('auth.verifyOtp')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


