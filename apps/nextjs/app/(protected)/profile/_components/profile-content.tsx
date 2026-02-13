"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Card, CardContent } from "@packages/ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import { Label } from "@packages/ui/components/ui/label";
import {
  Calendar,
  Camera,
  ChevronRight,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone as PhoneIcon,
  QrCode,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { RewardCollectionItemDto } from "@/adapters/queries/reward-collection.query";
import type { IUserDto } from "@/application/dto/common.dto";
import type { IProfileDto } from "@/application/dto/profile/profile.dto";

interface ProfileContentProps {
  user: IUserDto;
  profile: IProfileDto | null;
  earnedRewardsCount: number;
  totalRewardsCount: number;
  earnedBadges: RewardCollectionItemDto[];
  allRewards: RewardCollectionItemDto[];
}

function formatBirthday(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const BADGE_CATEGORIES: {
  label: string;
  keys: string[];
}[] = [
  {
    label: "Régularité",
    keys: ["journal-streak-7", "journal-streak-14", "journal-streak-30"],
  },
  {
    label: "Premiers pas",
    keys: [
      "first-post",
      "first-mood",
      "first-photo",
      "first-moodboard",
      "first-friend",
    ],
  },
  {
    label: "Jalons",
    keys: [
      "posts-10",
      "posts-50",
      "photos-10",
      "photos-50",
      "friends-5",
      "friends-10",
    ],
  },
  {
    label: "Spécial",
    keys: ["all-moods-recorded", "kanban-master"],
  },
];

const STREAK_BADGE_IMAGE: Record<string, string> = {
  "journal-streak-7": "/badges/7j.png",
  "journal-streak-14": "/badges/14j.png",
  "journal-streak-30": "/badges/1month.png",
};

const EMOJI_BADGES: Record<string, { emoji: string; bg: string }> = {
  "first-post": { emoji: "📝", bg: "bg-amber-100" },
  "first-mood": { emoji: "😊", bg: "bg-pink-100" },
  "first-photo": { emoji: "📸", bg: "bg-sky-100" },
  "first-moodboard": { emoji: "🎨", bg: "bg-violet-100" },
  "first-friend": { emoji: "🤝", bg: "bg-emerald-100" },
  "posts-10": { emoji: "✍️", bg: "bg-amber-200" },
  "photos-10": { emoji: "🖼️", bg: "bg-sky-200" },
  "posts-50": { emoji: "📚", bg: "bg-orange-200" },
  "photos-50": { emoji: "🏆", bg: "bg-yellow-200" },
  "friends-5": { emoji: "👥", bg: "bg-emerald-200" },
  "friends-10": { emoji: "🌟", bg: "bg-teal-200" },
  "all-moods-recorded": { emoji: "🌈", bg: "bg-fuchsia-100" },
  "kanban-master": { emoji: "✅", bg: "bg-lime-100" },
};

function BadgeIcon({ reward }: { reward: RewardCollectionItemDto }) {
  const streakImage = STREAK_BADGE_IMAGE[reward.key];
  const emojiBadge = EMOJI_BADGES[reward.key];
  const earnedClass = !reward.earned ? "opacity-30 grayscale" : "";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex h-16 w-16 items-center justify-center ${earnedClass}`}
      >
        {streakImage ? (
          <Image
            src={streakImage}
            alt={reward.name}
            width={64}
            height={64}
            className="object-contain"
          />
        ) : (
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${emojiBadge?.bg ?? "bg-gray-100"}`}
          >
            <span className="text-2xl">{emojiBadge?.emoji ?? "🏅"}</span>
          </div>
        )}
      </div>
      <span
        className={`max-w-20 text-center text-[10px] leading-tight ${reward.earned ? "font-medium text-foreground" : "text-muted-foreground"}`}
      >
        {reward.name}
      </span>
    </div>
  );
}

export function ProfileContent({
  user,
  profile,
  earnedRewardsCount,
  totalRewardsCount,
  earnedBadges,
  allRewards,
}: ProfileContentProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatarUrl ?? user.image ?? null,
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);

  const [personalForm, setPersonalForm] = useState({
    displayName: profile?.displayName ?? user.name,
    birthday: profile?.birthday?.split("T")[0] ?? "",
    phone: profile?.phone ?? "",
    profession: profile?.profession ?? "",
  });

  const [addressForm, setAddressForm] = useState({
    street: profile?.address?.street ?? "",
    zipCode: profile?.address?.zipCode ?? "",
    city: profile?.address?.city ?? "",
    country: profile?.address?.country ?? "",
  });

  const firstName = (profile?.displayName ?? user.name).split(" ")[0] || "";
  const lastName =
    (profile?.displayName ?? user.name).split(" ").slice(1).join(" ") || "";

  const memberSince = new Date(profile?.createdAt ?? Date.now());
  const memberSinceLabel = memberSince.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const uploadRes = await fetch("/api/v1/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "avatar",
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      });

      if (!uploadRes.ok) return;
      const { uploadUrl, fileUrl } = await uploadRes.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: fileUrl }),
      });

      setAvatarUrl(fileUrl);
    } catch {
      // silent
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    setSavingPersonalInfo(true);
    try {
      await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: personalForm.displayName,
          phone: personalForm.phone || null,
          birthday: personalForm.birthday || null,
          profession: personalForm.profession || null,
        }),
      });
      setEditingPersonalInfo(false);
      router.refresh();
    } catch {
      // silent
    } finally {
      setSavingPersonalInfo(false);
    }
  };

  const handleSaveAddress = async () => {
    setSavingAddress(true);
    try {
      const hasAddress =
        addressForm.street &&
        addressForm.zipCode &&
        addressForm.city &&
        addressForm.country;
      await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: hasAddress ? addressForm : null,
        }),
      });
      setEditingAddress(false);
      router.refresh();
    } catch {
      // silent
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/v1/auth/sign-out", { method: "POST" });
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr·e de vouloir supprimer votre compte ? Cette action est irréversible.",
    );
    if (!confirmed) return;
    await fetch("/api/v1/auth/sign-out", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      {/* Header — Avatar + Infos + Récompenses */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* Avatar */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-homecafe-pink-light"
            disabled={uploadingAvatar}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User size={36} className="text-homecafe-pink" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={20} className="text-white" />
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 size={20} className="animate-spin text-white" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="space-y-1.5 text-center sm:pt-1 sm:text-left">
            <h1 className="font-semibold text-xl">
              {profile?.displayName ?? user.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Membre depuis {memberSinceLabel}
            </p>
            <div className="space-y-0.5 text-xs text-muted-foreground">
              {profile?.birthday && (
                <p className="flex items-center justify-center gap-1.5 sm:justify-start">
                  <Calendar size={12} />
                  {formatBirthday(profile.birthday)}
                </p>
              )}
              <p className="flex items-center justify-center gap-1.5 sm:justify-start">
                <Mail size={12} />
                {user.email}
              </p>
              <p className="flex items-center justify-center gap-1.5 sm:justify-start">
                <PhoneIcon size={12} />
                {profile?.phone ?? (
                  <span className="italic">Non renseigné</span>
                )}
              </p>
              <p className="flex items-center justify-center gap-1.5 sm:justify-start">
                <MapPin size={12} />
                {profile?.address ? (
                  `${profile.address.city}, ${profile.address.country}`
                ) : (
                  <span className="italic">Non renseigné</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Récompenses */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg">Récompenses</h2>
            <p className="text-xs text-muted-foreground">
              {earnedRewardsCount}/{totalRewardsCount}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {earnedBadges.length > 0 ? (
                earnedBadges.map((badge) => {
                  const streakImage = STREAK_BADGE_IMAGE[badge.key];
                  const emojiBadge = EMOJI_BADGES[badge.key];
                  return (
                    <div key={badge.id} className="flex flex-col items-center">
                      {streakImage ? (
                        <Image
                          src={streakImage}
                          alt={badge.name}
                          width={88}
                          height={88}
                          className="object-contain"
                        />
                      ) : (
                        <div
                          className={`flex h-[88px] w-[88px] items-center justify-center rounded-2xl ${emojiBadge?.bg ?? "bg-gray-100"}`}
                        >
                          <span className="text-3xl">
                            {emojiBadge?.emoji ?? "🏅"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex gap-3">
                  {[
                    "/badges/7j.png",
                    "/badges/14j.png",
                    "/badges/1month.png",
                  ].map((src) => (
                    <Image
                      key={src}
                      src={src}
                      alt="Badge"
                      width={88}
                      height={88}
                      className="object-contain opacity-30 grayscale"
                    />
                  ))}
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="mt-4 rounded-full bg-homecafe-pink px-6 text-white hover:bg-homecafe-pink/90"
              onClick={() => setShowRewardsDialog(true)}
            >
              Voir tout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog récompenses */}
      <Dialog open={showRewardsDialog} onOpenChange={setShowRewardsDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              Récompenses
              <span className="text-sm font-normal text-muted-foreground">
                {earnedRewardsCount}/{totalRewardsCount}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {BADGE_CATEGORIES.map((category) => {
              const categoryRewards = category.keys
                .map((key) => allRewards.find((r) => r.key === key))
                .filter(Boolean) as RewardCollectionItemDto[];
              if (categoryRewards.length === 0) return null;
              return (
                <div key={category.label}>
                  <h3 className="mb-2 font-medium text-xs text-muted-foreground uppercase tracking-wide">
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {categoryRewards.map((reward) => (
                      <BadgeIcon key={reward.id} reward={reward} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Informations personnelles */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold text-lg">
            Informations personnelles
          </h2>
          {editingPersonalInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label
                    htmlFor="displayName"
                    className="text-xs text-muted-foreground"
                  >
                    Nom complet
                  </Label>
                  <Input
                    id="displayName"
                    value={personalForm.displayName}
                    onChange={(e) =>
                      setPersonalForm((f) => ({
                        ...f,
                        displayName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="birthday"
                    className="text-xs text-muted-foreground"
                  >
                    Naissance
                  </Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={personalForm.birthday}
                    onChange={(e) =>
                      setPersonalForm((f) => ({
                        ...f,
                        birthday: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="phone"
                    className="text-xs text-muted-foreground"
                  >
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    value={personalForm.phone}
                    onChange={(e) =>
                      setPersonalForm((f) => ({
                        ...f,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="profession"
                    className="text-xs text-muted-foreground"
                  >
                    Profession
                  </Label>
                  <Input
                    id="profession"
                    value={personalForm.profession}
                    onChange={(e) =>
                      setPersonalForm((f) => ({
                        ...f,
                        profession: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-homecafe-pink px-5 text-white hover:bg-homecafe-pink/90"
                  onClick={handleSavePersonalInfo}
                  disabled={savingPersonalInfo}
                >
                  {savingPersonalInfo ? "Sauvegarde..." : "Enregistrer"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setEditingPersonalInfo(false);
                    setPersonalForm({
                      displayName: profile?.displayName ?? user.name,
                      birthday: profile?.birthday?.split("T")[0] ?? "",
                      phone: profile?.phone ?? "",
                      profession: profile?.profession ?? "",
                    });
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Prénom</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {firstName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nom</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {lastName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Naissance</p>
                  <p
                    className={`mt-0.5 text-sm font-medium ${!profile?.birthday ? "italic text-muted-foreground" : ""}`}
                  >
                    {profile?.birthday
                      ? formatBirthday(profile.birthday)
                      : "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="mt-0.5 text-sm font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p
                    className={`mt-0.5 text-sm font-medium ${!profile?.phone ? "italic text-muted-foreground" : ""}`}
                  >
                    {profile?.phone ?? "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Profession</p>
                  <p
                    className={`mt-0.5 text-sm font-medium ${!profile?.profession ? "italic text-muted-foreground" : ""}`}
                  >
                    {profile?.profession ?? "Non renseigné"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-5 rounded-full bg-homecafe-pink px-5 text-white hover:bg-homecafe-pink/90"
                onClick={() => setEditingPersonalInfo(true)}
              >
                Modifier les informations
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Grid — Adresse + Code amis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Adresse */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-semibold text-lg">Adresse</h2>
            {editingAddress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="col-span-1 space-y-1 sm:col-span-2">
                    <Label
                      htmlFor="street"
                      className="text-xs text-muted-foreground"
                    >
                      Numéro et nom de voie
                    </Label>
                    <Input
                      id="street"
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          street: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="zipCode"
                      className="text-xs text-muted-foreground"
                    >
                      Code postal
                    </Label>
                    <Input
                      id="zipCode"
                      value={addressForm.zipCode}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          zipCode: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="city"
                      className="text-xs text-muted-foreground"
                    >
                      Ville
                    </Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          city: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="country"
                      className="text-xs text-muted-foreground"
                    >
                      Pays
                    </Label>
                    <Input
                      id="country"
                      value={addressForm.country}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          country: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-full bg-homecafe-pink px-5 text-white hover:bg-homecafe-pink/90"
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                  >
                    {savingAddress ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setEditingAddress(false);
                      setAddressForm({
                        street: profile?.address?.street ?? "",
                        zipCode: profile?.address?.zipCode ?? "",
                        city: profile?.address?.city ?? "",
                        country: profile?.address?.country ?? "",
                      });
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Numéro et nom de voie
                    </p>
                    <p
                      className={`mt-0.5 text-sm font-medium ${!profile?.address?.street ? "italic text-muted-foreground" : ""}`}
                    >
                      {profile?.address?.street ?? "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Code postal</p>
                    <p
                      className={`mt-0.5 text-sm font-medium ${!profile?.address?.zipCode ? "italic text-muted-foreground" : ""}`}
                    >
                      {profile?.address?.zipCode ?? "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ville</p>
                    <p
                      className={`mt-0.5 text-sm font-medium ${!profile?.address?.city ? "italic text-muted-foreground" : ""}`}
                    >
                      {profile?.address?.city ?? "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pays</p>
                    <p
                      className={`mt-0.5 text-sm font-medium ${!profile?.address?.country ? "italic text-muted-foreground" : ""}`}
                    >
                      {profile?.address?.country ?? "Non renseigné"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-5 rounded-full bg-homecafe-pink px-5 text-white hover:bg-homecafe-pink/90"
                  onClick={() => setEditingAddress(true)}
                >
                  Modifier les informations
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Code amis */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-lg">
              <QrCode size={18} />
              Code amis
            </h2>
            <div className="flex items-center justify-center py-4">
              <div className="flex h-44 w-44 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                <p className="text-center text-xs text-muted-foreground">
                  QR code bientôt disponible
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paramètres */}
      <Card>
        <CardContent className="px-6 py-4">
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="flex w-full items-center justify-between text-sm hover:opacity-70"
          >
            <span className="font-medium">Paramètres</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* Actions compte */}
      <div className="space-y-2 px-2 pb-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2.5 py-1.5 text-sm hover:opacity-70 disabled:opacity-50"
        >
          <LogOut className="size-4" />
          <span>{loggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="flex items-center gap-2.5 py-1.5 text-sm text-destructive hover:opacity-70"
        >
          <Trash2 className="size-4" />
          <span>Supprimer le compte</span>
        </button>
      </div>
    </div>
  );
}
