import { Role, UserStatus } from "../constraint/index";

export interface IRequestUser {
    id: string;
    role: Role;
    email: string;
}