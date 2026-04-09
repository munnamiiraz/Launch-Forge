import { Role, UserStatus } from "../../generated/client/client";

declare module "better-auth" {
  interface User {
    role: Role;
    status: UserStatus;
    needPasswordChange: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
  }
}
