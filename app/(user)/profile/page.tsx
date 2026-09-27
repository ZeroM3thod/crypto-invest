// app/(user)/profile/page.tsx
"use client";

import { useState } from "react";
import { UserShell } from "@/app/(user)/_components/user-shell";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Check,
  Copy,
  Pencil,
  ShieldCheck,
  ShieldOff,
  Wallet,
  X,
} from "lucide-react";

// ── Mock data ────────────────────────────────────────────────────────────

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Bangladesh",
  "India",
  "United Arab Emirates",
  "Singapore",
];

interface UserProfile {
  fullName: string;
  userId: string;
  email: string;
  dob: string; // yyyy-mm-dd
  walletAddress: string;
  country: string;
  kycVerified: boolean;
  twoFaEnabled: boolean;
  avatarUrl?: string;
}

const INITIAL_PROFILE: UserProfile = {
  fullName: "Ava Thompson",
  userId: "USR-4821093",
  email: "ava.thompson@example.com",
  dob: "1994-06-12",
  walletAddress: "0x9F3a1C2b4E5d6F7a8B9c0D1e2F3a4B5c6D7e8F90",
  country: "United States",
  kycVerified: true,
  twoFaEnabled: false,
};

// ── Helpers ──────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function truncateMiddle(str: string, head = 8, tail = 6) {
  if (str.length <= head + tail + 3) return str;
  return `${str.slice(0, head)}…${str.slice(-tail)}`;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

// ── Small building blocks ────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard unavailable — fail silently
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={doCopy}
      aria-label="Copy to clipboard"
      className="grid size-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.fullName);
  const [draftDob, setDraftDob] = useState(profile.dob);
  const [draftCountry, setDraftCountry] = useState(profile.country);
  const [nameErr, setNameErr] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraftName(profile.fullName);
    setDraftDob(profile.dob);
    setDraftCountry(profile.country);
    setNameErr(false);
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = async () => {
    if (!draftName.trim()) {
      setNameErr(true);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 450));
    setProfile((p) => ({
      ...p,
      fullName: draftName.trim(),
      dob: draftDob,
      country: draftCountry,
    }));
    setSaving(false);
    setEditing(false);
  };

  return (
    <UserShell active="Profile">
      <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">

          {/* ── Header ────────────────────────────────── */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Account
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              View your account details and manage your personal information.
            </p>
          </div>

          {/* ── Avatar + identity card ───────────────────── */}
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:items-center sm:text-left">
              <div className="relative shrink-0">
                <Avatar
                  className={cn(
                    "size-20 ring-offset-2 ring-offset-background",
                    profile.kycVerified ? "ring-2 ring-emerald-500" : "border border-border",
                  )}
                >
                  {profile.avatarUrl ? (
                    <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                  ) : (
                    <AvatarFallback className="bg-muted text-lg font-semibold text-foreground">
                      {initialsOf(profile.fullName)}
                    </AvatarFallback>
                  )}
                  {profile.kycVerified && (
                    <AvatarBadge className="bg-emerald-500 text-white">
                      <Check className="size-2.5" />
                    </AvatarBadge>
                  )}
                </Avatar>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {profile.fullName}
                </h2>
                <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {profile.kycVerified ? (
                    <Badge className="border-foreground bg-foreground text-background">
                      <BadgeCheck className="size-3" /> KYC Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">KYC Not Verified</Badge>
                  )}
                  {profile.twoFaEnabled ? (
                    <Badge variant="secondary">
                      <ShieldCheck className="size-3" /> 2FA Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <ShieldOff className="size-3" /> 2FA Disabled
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Account details ──────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Account Details</CardTitle>
                {!editing && (
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-5 py-0">

              {/* User ID */}
              <InfoRow label="User ID">
                <span className="font-mono text-sm text-foreground">{profile.userId}</span>
                <CopyButton value={profile.userId} />
              </InfoRow>

              {/* Full name */}
              <InfoRow label="Full Name">
                {editing ? (
                  <div className="w-full sm:w-64">
                    <Input
                      value={draftName}
                      onChange={(e) => { setDraftName(e.target.value); setNameErr(false); }}
                      aria-invalid={nameErr}
                      placeholder="Your full name"
                    />
                    {nameErr && <p className="mt-1 text-xs text-destructive">Name is required.</p>}
                  </div>
                ) : (
                  <span className="text-sm text-foreground">{profile.fullName}</span>
                )}
              </InfoRow>

              {/* Email */}
              <InfoRow label="Email Address">
                <span className="truncate text-sm text-foreground">{profile.email}</span>
              </InfoRow>

              {/* DOB */}
              <InfoRow label="Date of Birth">
                {editing ? (
                  <Input
                    type="date"
                    value={draftDob}
                    onChange={(e) => setDraftDob(e.target.value)}
                    className="w-full sm:w-64"
                  />
                ) : (
                  <span className="text-sm text-foreground">{formatDate(profile.dob)}</span>
                )}
              </InfoRow>

              {/* Country */}
              <InfoRow label="Country">
                {editing ? (
                  <Select value={draftCountry} onValueChange={setDraftCountry}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-foreground">{profile.country}</span>
                )}
              </InfoRow>

              {/* Wallet address */}
              <InfoRow label="Main Wallet Address">
                <span className="flex items-center gap-1.5 font-mono text-sm text-foreground">
                  <Wallet className="size-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">{truncateMiddle(profile.walletAddress, 10, 8)}</span>
                  <span className="sm:hidden">{truncateMiddle(profile.walletAddress, 6, 4)}</span>
                </span>
                <CopyButton value={profile.walletAddress} />
              </InfoRow>

            </CardContent>

            {editing && (
              <div className="flex items-center justify-end gap-2 border-t border-border p-5">
                <Button variant="ghost" onClick={cancelEditing} disabled={saving}>
                  <X className="size-3.5" /> Cancel
                </Button>
                <Button onClick={saveEditing} disabled={saving}>
                  <Check className="size-3.5" /> {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            )}
          </Card>

          {/* ── Security ─────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  {profile.twoFaEnabled ? <ShieldCheck className="size-4" /> : <ShieldOff className="size-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.twoFaEnabled ? "Your account is protected with 2FA." : "Add an extra layer of security to your account."}
                  </p>
                </div>
              </div>
              <Button
                variant={profile.twoFaEnabled ? "outline" : "default"}
                size="sm"
                onClick={() => setProfile((p) => ({ ...p, twoFaEnabled: !p.twoFaEnabled }))}
              >
                {profile.twoFaEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </CardContent>
          </Card>

        </div>

        <div className="h-10" />
      </div>
    </UserShell>
  );
}