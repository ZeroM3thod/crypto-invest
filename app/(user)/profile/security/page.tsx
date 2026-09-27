// app/(user)/profile/security/page.tsx
"use client";

import { UserShell } from "@/app/(user)/_components/user-shell";
import { OTPInput, type OTPStatus } from "@/components/motion/otp-input";
import {
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  QrCode,
  ShieldCheck,
  ShieldOff,
  ShieldX,
  Smartphone,
  X,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { useState, useCallback } from "react";

// ── Shared primitives (matching dashboard/deposit/etc.) ──────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-4xl border border-border bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ── Mock data ────────────────────────────────────────────────────────────────

const BACKUP_CODES = [
  "A1B2-C3D4",
  "E5F6-G7H8",
  "I9J0-K1L2",
  "M3N4-O5P6",
  "Q7R8-S9T0",
  "U1V2-W3X4",
  "Y5Z6-A7B8",
  "C9D0-E1F2",
];

// ── Change Password Modal ────────────────────────────────────────────────────

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strengthScore = (() => {
    let s = 0;
    if (next.length >= 8) s++;
    if (/[A-Z]/.test(next)) s++;
    if (/[0-9]/.test(next)) s++;
    if (/[^A-Za-z0-9]/.test(next)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strengthScore];
  const strengthColor = ["", "bg-destructive", "bg-warning", "bg-success/70", "bg-success"][strengthScore];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!current) e.current = "Required";
    if (next.length < 8) e.next = "Minimum 8 characters";
    if (next !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[900] flex items-end justify-center bg-foreground/20 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-4xl border border-border bg-card p-6 sm:rounded-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Security</p>
            <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <Label>Current Password</Label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => { setCurrent(e.target.value); setErrors((err) => ({ ...err, current: "" })); }}
                placeholder="Enter current password"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.current && <p className="mt-1 text-xs text-destructive">{errors.current}</p>}
          </div>

          {/* New Password */}
          <div>
            <Label>New Password</Label>
            <div className="relative">
              <input
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => { setNext(e.target.value); setErrors((err) => ({ ...err, next: "" })); }}
                placeholder="Enter new password"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {/* Strength bar */}
            {next.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strengthScore ? strengthColor : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">{strengthLabel}</span>
              </div>
            )}
            {errors.next && <p className="mt-1 text-xs text-destructive">{errors.next}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <Label>Confirm New Password</Label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors((err) => ({ ...err, confirm: "" })); }}
                placeholder="Re-enter new password"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-foreground py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check className="size-4" />
            {saving ? "Saving…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 2FA Setup Modal ──────────────────────────────────────────────────────────

function TwoFAModal({
  enabled,
  onClose,
  onToggle,
}: {
  enabled: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const [step, setStep] = useState<"confirm" | "scan" | "verify" | "disable">(
    enabled ? "disable" : "scan"
  );
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState(false);
  const [otpStatus, setOtpStatus] = useState<OTPStatus>("idle");
  const [saving, setSaving] = useState(false);
  const [backupCopied, setBackupCopied] = useState(false);

  const SECRET = "JBSWY3DPEHPK3PXP";
  const QR_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect width='160' height='160' fill='%231c1c1c'/%3E%3Ctext x='80' y='88' font-size='11' fill='%2371717a' text-anchor='middle' font-family='monospace'%3EQRCODE%3C/text%3E%3C/svg%3E";

  const verify = async () => {
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setCodeErr(true);
      setOtpStatus("error");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setOtpStatus("success");
    onToggle();
    onClose();
  };

  const disable = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    onToggle();
    onClose();
  };

  const copyBackup = () => {
    navigator.clipboard?.writeText(BACKUP_CODES.join("\n")).then(() => {
      setBackupCopied(true);
      setTimeout(() => setBackupCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-[900] flex items-end justify-center bg-foreground/20 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-4xl border border-border bg-card p-6 sm:rounded-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Security</p>
            <h3 className="text-lg font-semibold text-foreground">
              {enabled ? "Disable 2FA" : "Enable 2FA"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* DISABLE flow */}
        {step === "disable" && (
          <>
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-sm text-muted-foreground">
                Disabling 2FA will make your account less secure. Are you sure you want to continue?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
              >
                Keep 2FA
              </button>
              <button
                onClick={disable}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <ShieldX className="size-4" />
                {saving ? "Disabling…" : "Disable 2FA"}
              </button>
            </div>
          </>
        )}

        {/* ENABLE flow — Step 1: Scan QR */}
        {step === "scan" && (
          <>
            <ol className="mb-5 space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold text-foreground">1</span>
                <span>Install an authenticator app (Google Authenticator, Authy, etc.)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold text-foreground">2</span>
                <span>Scan the QR code below or enter the secret key manually.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold text-foreground">3</span>
                <span>Enter the 6-digit code from the app to confirm.</span>
              </li>
            </ol>

            {/* QR + Secret */}
            <div className="mb-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="flex size-[140px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/40">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <QrCode className="size-10" />
                  <span className="text-[10px] uppercase tracking-wide">Scan QR code</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label>Secret Key (manual entry)</Label>
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 p-2.5">
                    <span className="flex-1 font-mono text-xs text-foreground tracking-widest">
                      {SECRET}
                    </span>
                    <button
                      onClick={() => navigator.clipboard?.writeText(SECRET)}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Store this key safely. You will need it to recover access if you lose your phone.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep("verify")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Continue <ChevronRight className="size-4" />
            </button>
          </>
        )}

        {/* ENABLE flow — Step 2: Verify Code */}
        {step === "verify" && (
          <>
            <p className="mb-5 text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app to complete setup.
            </p>
            <div className="mb-5 flex flex-col items-center">
              <OTPInput
                label="Verification code"
                hint="Enter the 6-digit code from your authenticator app."
                successMessage="Verified."
                errorMessage="Enter a valid 6-digit code."
                value={code}
                status={otpStatus}
                autoFocus
                onChange={(v) => {
                  setCode(v);
                  setCodeErr(false);
                  if (otpStatus !== "idle") setOtpStatus("idle");
                }}
              />
            </div>

            {/* Backup codes */}
            <div className="mb-5 rounded-2xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Backup Codes — Save these now
                </p>
                <button
                  onClick={copyBackup}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    backupCopied
                      ? "bg-foreground text-background"
                      : "bg-muted text-foreground hover:bg-muted/70"
                  }`}
                >
                  {backupCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {backupCopied ? "Copied" : "Copy All"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {BACKUP_CODES.map((c) => (
                  <span key={c} className="rounded-lg bg-muted px-3 py-1.5 text-center font-mono text-xs text-foreground">
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Each code can only be used once. Store them somewhere safe.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep("scan")}
                className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
              >
                Back
              </button>
              <button
                onClick={verify}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-foreground py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <ShieldCheck className="size-4" />
                {saving ? "Verifying…" : "Enable 2FA"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({ msg: "", show: false });

  const showToast = useCallback((msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  return (
    <UserShell active="Security">
      <div className="relative overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        {/* Toast */}
        {toast.show && (
          <div className="fixed right-6 top-6 z-[999] flex items-center gap-2 rounded-2xl border border-border bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg">
            <Check className="size-4" />
            {toast.msg}
          </div>
        )}

        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Account
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Security
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your password and authentication settings to keep your account safe.
            </p>
          </div>

          {/* ── Password ────────────────────────────── */}
          <Card>
            <SectionHeader title="Password" subtitle="Set a strong password to protect your account." />
            <InfoRow label="Password">
              <span className="text-sm text-muted-foreground tracking-[0.25em]">••••••••••••</span>
            </InfoRow>
            <InfoRow label="Last Changed">
              <span className="text-sm text-foreground">14 June 2025</span>
            </InfoRow>
            <div className="mt-5">
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs font-semibold text-background transition-opacity hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <KeyRound className="size-3.5" />
                Change Password
              </button>
            </div>
          </Card>

          {/* ── Two-Factor Authentication ────────────── */}
          <Card>
            <SectionHeader
              title="Two-Factor Authentication (2FA)"
              subtitle="Add an extra layer of security. You'll need your phone to sign in."
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                    twoFAEnabled
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {twoFAEnabled ? (
                    <ShieldCheck className="size-5" />
                  ) : (
                    <ShieldOff className="size-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {twoFAEnabled ? "2FA is enabled" : "2FA is disabled"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {twoFAEnabled
                      ? "Your account is protected with an authenticator app."
                      : "Enable to protect your account with a one-time code on each login."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTwoFA(true)}
                className={`shrink-0 rounded-2xl border px-4 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  twoFAEnabled
                    ? "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    : "border-foreground bg-foreground text-background hover:opacity-90"
                }`}
              >
                {twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </div>

            {twoFAEnabled && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-success/5 p-4">
                <ShieldCheck className="size-4 shrink-0 text-success" />
                <p className="text-xs text-muted-foreground">
                  Authenticator app is active. Your account is protected.
                </p>
              </div>
            )}
          </Card>

          {/* ── Active Sessions ──────────────────────── */}
          <Card>
            <SectionHeader
              title="Active Sessions"
              subtitle="Devices currently signed into your account."
            />
            <div className="flex flex-col gap-2">
              {[
                {
                  id: "s1",
                  device: "Chrome · Windows 11",
                  location: "Dhaka, Bangladesh",
                  ip: "103.48.192.11",
                  time: "Now",
                  current: true,
                },
                {
                  id: "s2",
                  device: "Safari · iPhone 15",
                  location: "Dhaka, Bangladesh",
                  ip: "103.48.192.11",
                  time: "2 hours ago",
                  current: false,
                },
                {
                  id: "s3",
                  device: "Firefox · macOS",
                  location: "Dhaka, Bangladesh",
                  ip: "103.48.192.14",
                  time: "Yesterday",
                  current: false,
                },
              ].map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-2xl border border-border p-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                      <Smartphone className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{session.device}</p>
                        {session.current && (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                            This Device
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {session.location} · {session.ip} · {session.time}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => showToast("Session revoked")}
                      className="ml-3 shrink-0 rounded-xl bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => showToast("All other sessions revoked")}
              className="mt-4 w-full rounded-2xl border border-border py-2.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Revoke All Other Sessions
            </button>
          </Card>

          {/* ── Danger Zone ─────────────────────────── */}
          <Card>
            <SectionHeader
              title="Danger Zone"
              subtitle="Irreversible actions that affect your account."
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/10">
                  <Lock className="size-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
              </div>
              <button className="shrink-0 rounded-2xl border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Delete Account
              </button>
            </div>
          </Card>

          <div className="h-20" />
        </div>
      </div>

      {/* Modals */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => {
            setShowChangePassword(false);
            showToast("Password updated successfully");
          }}
        />
      )}
      {showTwoFA && (
        <TwoFAModal
          enabled={twoFAEnabled}
          onClose={() => setShowTwoFA(false)}
          onToggle={() => {
            setTwoFAEnabled((v) => !v);
            showToast(twoFAEnabled ? "2FA disabled" : "2FA enabled successfully");
          }}
        />
      )}
    </UserShell>
  );
}