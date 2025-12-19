import { z } from "zod";

export const RegisterDtoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const validateRegisterDto = (data: unknown): RegisterDto => {
  return RegisterDtoSchema.parse(data);
};
