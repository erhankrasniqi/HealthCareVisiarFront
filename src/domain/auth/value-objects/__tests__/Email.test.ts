import { Email } from "../Email";

describe("Email Value Object", () => {
  it("should create a valid email", () => {
    const result = Email.create("test@example.com");

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.value).toBe("test@example.com");
    }
  });

  it("should normalize email to lowercase", () => {
    const result = Email.create("Test@Example.COM");

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.value).toBe("test@example.com");
    }
  });

  it("should trim whitespace", () => {
    const result = Email.create("  test@example.com  ");

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.value).toBe("test@example.com");
    }
  });

  it("should fail with invalid email format", () => {
    const result = Email.create("invalid-email");

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.message).toContain("Invalid email");
    }
  });

  it("should fail with empty email", () => {
    const result = Email.create("");

    expect(result.isFailure).toBe(true);
  });

  it("should fail with missing @ symbol", () => {
    const result = Email.create("testexample.com");

    expect(result.isFailure).toBe(true);
  });

  it("should fail with missing domain", () => {
    const result = Email.create("test@");

    expect(result.isFailure).toBe(true);
  });
});
