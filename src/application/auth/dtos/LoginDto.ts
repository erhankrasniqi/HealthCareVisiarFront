import { z } from "zod";

export const LoginDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const validateLoginDto = (data: unknown): LoginDto => {
  return LoginDtoSchema.parse(data);
};
