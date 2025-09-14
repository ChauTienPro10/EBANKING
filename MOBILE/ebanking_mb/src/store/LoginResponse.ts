interface LoginResponse {
    id: number;
    username: string;
    fullName: string;
    address: string;
    citizenId: string;
    birthday: string;
    createAt: string;
    isMale: boolean;
    roles: Set<string> | string[];
    jwt: string;
}
