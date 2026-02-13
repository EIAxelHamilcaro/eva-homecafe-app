# Profile Page — Complete Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refonte complète de la page profil avec ajout de champs backend (phone, birthday, profession, address), upload avatar, formulaires éditables — fidèle au Figma.

**Architecture:** Extend the existing Profile aggregate with new optional fields (VOs for phone, profession, address). Update Drizzle schema, mapper, DTOs, use case. Rebuild the frontend profile page as a client component with read/edit modes and presigned URL avatar upload.

**Tech Stack:** Next.js 16, Drizzle ORM, PostgreSQL, R2 presigned upload, Tailwind 4, shadcn/ui

---

### Task 1: Create Phone Value Object

**Files:**
- Create: `apps/nextjs/src/domain/profile/value-objects/phone.vo.ts`

**Step 1: Create the Phone VO**

```typescript
import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .max(20, "Phone number must be less than 20 characters")
  .regex(/^\+?[\d\s\-().]+$/, "Invalid phone number format");

export class Phone extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = phoneSchema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid phone number");
    }
    return Result.ok(result.data);
  }
}
```

**Step 2: Run `pnpm fix` to format**

---

### Task 2: Create Profession Value Object

**Files:**
- Create: `apps/nextjs/src/domain/profile/value-objects/profession.vo.ts`

**Step 1: Create the Profession VO**

```typescript
import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const professionSchema = z
  .string()
  .min(1, "Profession is required")
  .max(100, "Profession must be less than 100 characters");

export class Profession extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = professionSchema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid profession");
    }
    return Result.ok(result.data);
  }
}
```

**Step 2: Run `pnpm fix` to format**

---

### Task 3: Create Address Value Object

**Files:**
- Create: `apps/nextjs/src/domain/profile/value-objects/address.vo.ts`

**Step 1: Create the Address VO**

Address is a composite VO with 4 string fields. Use a record-based ValueObject.

```typescript
import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export interface IAddressProps {
  street: string;
  zipCode: string;
  city: string;
  country: string;
}

const addressSchema = z.object({
  street: z.string().min(1, "Street is required").max(200),
  zipCode: z.string().min(1, "Zip code is required").max(20),
  city: z.string().min(1, "City is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
});

export class Address extends ValueObject<IAddressProps> {
  protected validate(value: IAddressProps): Result<IAddressProps> {
    const result = addressSchema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid address");
    }
    return Result.ok(result.data);
  }
}
```

**Step 2: Run `pnpm fix` to format**

---

### Task 4: Update Profile Aggregate

**Files:**
- Modify: `apps/nextjs/src/domain/profile/profile.aggregate.ts`

**Step 1: Add new props and imports**

Add to `IProfileProps`:
```typescript
phone: Option<Phone>;
birthday: Option<Date>;
profession: Option<Profession>;
address: Option<Address>;
```

Add imports for Phone, Profession, Address VOs.

**Step 2: Add update methods**

Add these methods to the Profile class (same pattern as `updateBio` / `updateAvatar`):

```typescript
updatePhone(phone: Option<Phone>): Result<void> {
  this._props.phone = phone;
  this._props.updatedAt = new Date();
  this.addEvent(new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")));
  return Result.ok();
}

updateBirthday(birthday: Option<Date>): Result<void> {
  this._props.birthday = birthday;
  this._props.updatedAt = new Date();
  this.addEvent(new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")));
  return Result.ok();
}

updateProfession(profession: Option<Profession>): Result<void> {
  this._props.profession = profession;
  this._props.updatedAt = new Date();
  this.addEvent(new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")));
  return Result.ok();
}

updateAddress(address: Option<Address>): Result<void> {
  this._props.address = address;
  this._props.updatedAt = new Date();
  this.addEvent(new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")));
  return Result.ok();
}
```

**Step 3: Update `Profile.create()` static method**

Add the new optional props with defaults `Option.none()`:

```typescript
static create(
  props: Omit<IProfileProps, "createdAt" | "updatedAt" | "phone" | "birthday" | "profession" | "address"> & {
    phone?: Option<Phone>;
    birthday?: Option<Date>;
    profession?: Option<Profession>;
    address?: Option<Address>;
  },
  id?: UUID<string | number>,
): Profile {
  const newId = id ?? new UUID<string>();
  const now = new Date();
  const profile = new Profile(
    {
      ...props,
      phone: props.phone ?? Option.none(),
      birthday: props.birthday ?? Option.none(),
      profession: props.profession ?? Option.none(),
      address: props.address ?? Option.none(),
      createdAt: now,
      updatedAt: now,
    },
    newId,
  );
  // ... event
  return profile;
}
```

**Step 4: Run `pnpm fix`**

---

### Task 5: Update Drizzle Schema

**Files:**
- Modify: `packages/drizzle/src/schema/profile.ts`

**Step 1: Add new columns**

```typescript
phone: text("phone"),
birthday: timestamp("birthday"),
profession: text("profession"),
addressStreet: text("address_street"),
addressZipCode: text("address_zip_code"),
addressCity: text("address_city"),
addressCountry: text("address_country"),
```

**Step 2: Generate migration**

Run: `pnpm db:generate`

**Step 3: Push schema**

Run: `pnpm db:push` (may fail if DB not running — that's OK)

---

### Task 6: Update Profile Mapper

**Files:**
- Modify: `apps/nextjs/src/adapters/mappers/profile.mapper.ts`

**Step 1: Update `profileToDomain`**

Add imports for Phone, Profession, Address. Map new DB columns to domain:

```typescript
let phoneOption: Option<Phone> = Option.none();
if (record.phone !== null) {
  const phoneResult = Phone.create(record.phone);
  if (phoneResult.isFailure) {
    return Result.fail(`Invalid profile data: ${phoneResult.getError()}`);
  }
  phoneOption = Option.some(phoneResult.getValue());
}

const birthdayOption: Option<Date> = Option.fromNullable(record.birthday);

let professionOption: Option<Profession> = Option.none();
if (record.profession !== null) {
  const professionResult = Profession.create(record.profession);
  if (professionResult.isFailure) {
    return Result.fail(`Invalid profile data: ${professionResult.getError()}`);
  }
  professionOption = Option.some(professionResult.getValue());
}

let addressOption: Option<Address> = Option.none();
if (record.addressStreet && record.addressZipCode && record.addressCity && record.addressCountry) {
  const addressResult = Address.create({
    street: record.addressStreet,
    zipCode: record.addressZipCode,
    city: record.addressCity,
    country: record.addressCountry,
  });
  if (addressResult.isFailure) {
    return Result.fail(`Invalid profile data: ${addressResult.getError()}`);
  }
  addressOption = Option.some(addressResult.getValue());
}
```

Add these to the `Profile.reconstitute()` call.

**Step 2: Update `profileToPersistence`**

```typescript
phone: profile.get("phone").toNull()?.value ?? null,
birthday: profile.get("birthday").toNull() ?? null,
profession: profile.get("profession").toNull()?.value ?? null,
addressStreet: profile.get("address").toNull()?.value.street ?? null,
addressZipCode: profile.get("address").toNull()?.value.zipCode ?? null,
addressCity: profile.get("address").toNull()?.value.city ?? null,
addressCountry: profile.get("address").toNull()?.value.country ?? null,
```

**Step 3: Run `pnpm fix`**

---

### Task 7: Update Profile DTOs

**Files:**
- Modify: `apps/nextjs/src/application/dto/profile/profile.dto.ts`
- Modify: `apps/nextjs/src/application/dto/profile/update-profile.dto.ts`
- Modify: `apps/nextjs/src/application/dto/profile/create-profile.dto.ts`

**Step 1: Update `profile.dto.ts` (output)**

Add to `profileDtoSchema`:
```typescript
phone: z.string().nullable(),
birthday: z.string().nullable(),
profession: z.string().nullable(),
address: z.object({
  street: z.string(),
  zipCode: z.string(),
  city: z.string(),
  country: z.string(),
}).nullable(),
```

**Step 2: Update `update-profile.dto.ts` (input)**

Add to `updateProfileInputDtoSchema`:
```typescript
phone: z.string().max(20).nullable().optional(),
birthday: z.string().nullable().optional(),
profession: z.string().max(100).nullable().optional(),
address: z.object({
  street: z.string().min(1).max(200),
  zipCode: z.string().min(1).max(20),
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
}).nullable().optional(),
```

**Step 3: Update `create-profile.dto.ts` (input)**

Add new optional fields:
```typescript
phone: z.string().max(20).optional(),
birthday: z.string().optional(),
profession: z.string().max(100).optional(),
address: z.object({
  street: z.string().min(1).max(200),
  zipCode: z.string().min(1).max(20),
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
}).optional(),
```

**Step 4: Run `pnpm fix`**

---

### Task 8: Update UpdateProfileUseCase

**Files:**
- Modify: `apps/nextjs/src/application/use-cases/profile/update-profile.use-case.ts`

**Step 1: Add imports for new VOs**

```typescript
import { Phone } from "@/domain/profile/value-objects/phone.vo";
import { Profession } from "@/domain/profile/value-objects/profession.vo";
import { Address } from "@/domain/profile/value-objects/address.vo";
```

**Step 2: Add handling in `applyUpdates()`**

After the `avatarUrl` block, add:

```typescript
if (input.phone !== undefined) {
  if (input.phone === null) {
    const updateResult = profile.updatePhone(Option.none());
    if (updateResult.isFailure) return Result.fail(updateResult.getError());
  } else {
    const phoneResult = Phone.create(input.phone);
    if (phoneResult.isFailure) return Result.fail(phoneResult.getError());
    const updateResult = profile.updatePhone(Option.some(phoneResult.getValue()));
    if (updateResult.isFailure) return Result.fail(updateResult.getError());
  }
}

if (input.birthday !== undefined) {
  const updateResult = profile.updateBirthday(
    Option.fromNullable(input.birthday ? new Date(input.birthday) : null),
  );
  if (updateResult.isFailure) return Result.fail(updateResult.getError());
}

if (input.profession !== undefined) {
  if (input.profession === null) {
    const updateResult = profile.updateProfession(Option.none());
    if (updateResult.isFailure) return Result.fail(updateResult.getError());
  } else {
    const professionResult = Profession.create(input.profession);
    if (professionResult.isFailure) return Result.fail(professionResult.getError());
    const updateResult = profile.updateProfession(Option.some(professionResult.getValue()));
    if (updateResult.isFailure) return Result.fail(updateResult.getError());
  }
}

if (input.address !== undefined) {
  if (input.address === null) {
    const updateResult = profile.updateAddress(Option.none());
    if (updateResult.isFailure) return Result.fail(updateResult.getError());
  } else {
    const addressResult = Address.create(input.address);
    if (addressResult.isFailure) return Result.fail(addressResult.getError());
    const updateResult = profile.updateAddress(Option.some(addressResult.getValue()));
    if (updateResult.isFailure) return Result.fail(updateResult.getError());
  }
}
```

**Step 3: Update `toDto()` method**

Add new fields:
```typescript
phone: profile.get("phone").toNull()?.value ?? null,
birthday: profile.get("birthday").toNull()?.toISOString() ?? null,
profession: profile.get("profession").toNull()?.value ?? null,
address: profile.get("address").toNull()?.value ?? null,
```

**Step 4: Run `pnpm fix`**

---

### Task 9: Update GetProfileUseCase and CreateProfileUseCase toDto

**Files:**
- Modify: `apps/nextjs/src/application/use-cases/profile/get-profile.use-case.ts`
- Modify: `apps/nextjs/src/application/use-cases/profile/create-profile.use-case.ts`

**Step 1: Update `GetProfileUseCase.toDto()`**

Add new fields in the `Some:` branch:
```typescript
phone: profile.get("phone").toNull()?.value ?? null,
birthday: profile.get("birthday").toNull()?.toISOString() ?? null,
profession: profile.get("profession").toNull()?.value ?? null,
address: profile.get("address").toNull()?.value ?? null,
```

**Step 2: Update `CreateProfileUseCase.toDto()`**

Same new fields.

**Step 3: Run `pnpm fix`**

---

### Task 10: Update Profile Controller

**Files:**
- Modify: `apps/nextjs/src/adapters/controllers/profile/profile.controller.ts`

**Step 1: Update `createProfileController`**

Add new fields to the parsed object:
```typescript
phone: json.phone,
birthday: json.birthday,
profession: json.profession,
address: json.address,
```

**Step 2: Update `updateProfileController`**

Add new fields to the parsed object:
```typescript
phone: json.phone,
birthday: json.birthday,
profession: json.profession,
address: json.address,
```

**Step 3: Run `pnpm fix`**

---

### Task 11: Update Tests — UpdateProfileUseCase

**Files:**
- Modify: `apps/nextjs/src/application/use-cases/profile/__tests__/update-profile.use-case.test.ts`

**Step 1: Update `createMockProfile` helper**

Add new optional params and set defaults:
```typescript
const createMockProfile = (
  userId: string,
  displayName: string,
  bio?: string,
  avatarUrl?: string,
): Profile => {
  // ... existing code ...
  return Profile.reconstitute(
    {
      userId,
      displayName: displayNameVO,
      bio: bioOption,
      avatarUrl: avatarOption,
      phone: Option.none(),
      birthday: Option.none(),
      profession: Option.none(),
      address: Option.none(),
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    ProfileId.create(new UUID("profile-123")),
  );
};
```

**Step 2: Add tests for new fields**

Add tests for:
- `should update phone`
- `should clear phone when set to null`
- `should update birthday`
- `should update profession`
- `should update address`
- `should clear address when set to null`
- `should fail when phone exceeds 20 characters`
- `should fail when profession exceeds 100 characters`

**Step 3: Run `pnpm test` and verify all pass**

---

### Task 12: Run all backend checks

**Step 1:** Run `pnpm type-check` — fix any TypeScript errors

**Step 2:** Run `pnpm test` — fix any test failures

**Step 3:** Run `pnpm check` — fix any lint errors

**Step 4: Commit backend changes**

```bash
git add -A
git commit -m "feat(profile): add phone, birthday, profession, address fields to Profile aggregate"
```

---

### Task 13: Refonte Frontend — Profile Page

**Files:**
- Modify: `apps/nextjs/app/(protected)/profile/page.tsx`
- Modify: `apps/nextjs/app/(protected)/profile/_components/profile-content.tsx`

**Step 1: Update `page.tsx`**

Add profile data fetching:
```typescript
async function ProfileData() {
  const session = await requireAuth();
  const [badges, stickers, profileRes] = await Promise.all([
    getUserBadgeCollection(session.user.id),
    getUserStickerCollection(session.user.id),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/v1/profile`, {
      headers: await getAuthHeaders(),
    }).then(r => r.ok ? r.json() : null),
  ]);
  // ... pass profile data to ProfileContent
}
```

Alternatively, use server-side DI injection `getInjection("GetProfileUseCase")` directly. Follow existing patterns in the page.

**Step 2: Rewrite `profile-content.tsx`**

This is the biggest task. The component must match the Figma design:

**Header section:**
- Large avatar (h-28 w-28 rounded-full) with hover overlay showing camera icon
- Hidden `<input type="file" accept="image/*" />` triggered on click
- Name (h1), "Membre depuis {date}"
- Info rows: birthday, email, phone, location with icons (Calendar, Mail, Phone, MapPin)

**Récompenses card (top-right on desktop):**
- Card with "Récompenses" title + earned count
- Badge images (up to 3)
- "Voir tout" button → router.push("/rewards")

**Informations personnelles card:**
- Read mode: display Prénom, Nom, Naissance, E-mail, Téléphone, Profession in 3x2 grid
- Edit mode: inputs for each field
- "Modifier les informations" / "Enregistrer" + "Annuler" buttons

**Adresse card:**
- Read mode: Numéro et nom de voie, Code postal, Ville, Pays
- Edit mode: inputs for each field
- "Modifier les informations" / "Enregistrer" + "Annuler" buttons

**Code amis card:**
- QR code placeholder (keep existing design)

**Paramètres link:**
- Card with chevron → router.push("/settings")

**Actions:**
- Se déconnecter button
- Supprimer le compte button (red)

**Avatar upload logic:**

```typescript
const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploadingAvatar(true);
  try {
    // 1. Get presigned URL
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
    const { uploadUrl, fileUrl } = await uploadRes.json();

    // 2. Upload to R2
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    // 3. Update profile
    await fetch("/api/v1/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: fileUrl }),
    });

    // 4. Refresh
    router.refresh();
  } catch {
    // handle error
  } finally {
    setUploadingAvatar(false);
  }
};
```

**Editable form pattern (for personal info and address):**

```typescript
const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
const [personalForm, setPersonalForm] = useState({
  displayName: profile?.displayName ?? "",
  birthday: profile?.birthday ?? "",
  phone: profile?.phone ?? "",
  profession: profile?.profession ?? "",
});

const handleSavePersonalInfo = async () => {
  setSaving(true);
  try {
    const [firstName, ...rest] = personalForm.displayName.split(" ");
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
    // handle error
  } finally {
    setSaving(false);
  }
};
```

**Step 3: Run `pnpm fix` to format**

**Step 4: Verify in browser**

Navigate to http://localhost:3000/profile and verify:
- Layout matches Figma
- Avatar click opens file picker
- "Modifier" buttons switch to edit mode
- Forms submit correctly
- Mobile responsive

---

### Task 14: Browser Testing & Polish

**Step 1:** Test avatar upload flow end-to-end

**Step 2:** Test personal info edit/save/cancel

**Step 3:** Test address edit/save/cancel

**Step 4:** Test responsive layout (mobile/desktop)

**Step 5:** Run `pnpm check:all`

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat(profile): complete profile page redesign with avatar upload and editable forms"
```
