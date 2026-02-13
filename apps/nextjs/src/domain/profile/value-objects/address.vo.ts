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
