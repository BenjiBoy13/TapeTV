export default interface IUserModel {
    userId: number,
    name: string;
    surName?: string;
    birthdate: string;
    email: string;
    emailCode: number;
    isEmailConfirmed: boolean;
    username: string;
    password: string;
    userActivePlanId: number,
    createdAt: Date
}