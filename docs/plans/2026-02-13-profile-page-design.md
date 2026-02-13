# Profile Page — Complete Redesign

## Context

Refonte complète de la page profil Next.js pour matcher le Figma et rendre tous les boutons fonctionnels. Ajout de champs manquants au backend (phone, birthday, profession, address).

## Backend Changes

### Domain — Profile Aggregate

New Value Objects:
- `Phone` — validated phone format (optional, international format)
- `Profession` — string, max 100 chars
- `Address` — composite VO (street, zipCode, city, country)

New props on `IProfileProps`:
- `phone: Option<Phone>`
- `birthday: Option<Date>`
- `profession: Option<Profession>`
- `address: Option<Address>`

New aggregate methods:
- `updatePhone(phone: Option<Phone>): Result<void>`
- `updateBirthday(birthday: Option<Date>): Result<void>`
- `updateProfession(profession: Option<Profession>): Result<void>`
- `updateAddress(address: Option<Address>): Result<void>`

### Database — Drizzle Schema

New nullable columns on `profile` table:
- `phone` (varchar)
- `birthday` (date)
- `profession` (varchar)
- `address_street` (varchar)
- `address_zip_code` (varchar)
- `address_city` (varchar)
- `address_country` (varchar)

### Application — DTOs & Use Case

Update `update-profile.dto.ts`:
- Add `phone: z.string().nullable().optional()`
- Add `birthday: z.string().date().nullable().optional()`
- Add `profession: z.string().max(100).nullable().optional()`
- Add `address: z.object({ street, zipCode, city, country }).nullable().optional()`

Update `profile.dto.ts` (output):
- Add all new fields

Update `UpdateProfileUseCase.applyUpdates()`:
- Handle each new field with VO creation + aggregate method call

### Adapters

Update `profile.mapper.ts`:
- Map new DB columns ↔ domain props
- Handle Address composite (4 columns → 1 VO)

Update `profile.controller.ts`:
- Accept new fields in PATCH body

## Frontend Changes

### Layout (matching Figma)

```
┌──────────────────────────────────────────────────┐
│ [Avatar + upload]  Name             [Récompenses] │
│                    Member since      badges + CTA  │
│                    birthday, email,                │
│                    phone, location                 │
├─────────────────────────┬────────────────────────┤
│ Informations perso      │ (empty - no Préférences)│
│ (editable form)         │                         │
├─────────────────────────┼────────────────────────┤
│ Adresse                 │ Code amis               │
│ (editable form)         │ (QR code)               │
├─────────────────────────┴────────────────────────┤
│ Paramètres link                                   │
├──────────────────────────────────────────────────┤
│ Se déconnecter                                    │
│ Supprimer le compte                               │
└──────────────────────────────────────────────────┘
```

### Avatar Upload Flow

1. Click on avatar → hidden file input triggered
2. `POST /api/v1/upload` with `{ context: "avatar", filename, mimeType, size }`
3. Receive `{ uploadUrl, fileUrl }`
4. PUT file to `uploadUrl` (direct R2 upload)
5. `PATCH /api/v1/profile` with `{ avatarUrl: fileUrl }`
6. Optimistic UI update

### Editable Forms

- Default: read mode (display values or "Non renseigné")
- Click "Modifier les informations" → edit mode (inputs appear)
- "Enregistrer" → PATCH /api/v1/profile → back to read mode
- "Annuler" → discard changes, back to read mode

## Tests

- Unit tests for new VOs (Phone, Profession, Address)
- Update UpdateProfileUseCase tests for new fields
- Profile mapper tests for new field mapping

## Existing Use Cases (no changes needed)

- `CreateProfileUseCase` — works as-is (new fields are optional)
- `GetProfileUseCase` — works (output DTO updated)
- `GenerateUploadUrlUseCase` — already supports `context: "avatar"`
