import { Email } from "./value-objects/Email";

export interface UserProps {
  id: string;
  email: Email;
  name: string;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email.value,
      name: this.name,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
