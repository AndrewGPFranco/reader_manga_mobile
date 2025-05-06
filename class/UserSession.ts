export class UserSession {
    private _firstName: string;
    private _fullName: string;
    private _username: string;
    private _email: string;
    private _dateBirth: Date;
    private _mangas: number;
    private _completeReadings: number;
    private _inProgressReadings: number;

    constructor(firstName: string, fullName: string, username: string, email: string, dateBirth: Date,
                mangas: number, completeReadings: number, inProgressReadings: number) {
        this._email = email;
        this._mangas = mangas;
        this._username = username;
        this._fullName = fullName;
        this._firstName = firstName;
        this._dateBirth = dateBirth;
        this._completeReadings = completeReadings;
        this._inProgressReadings = inProgressReadings;
    }

    get firstName(): string {
        return this._firstName;
    }

    set firstName(value: string) {
        this._firstName = value;
    }

    get fullName(): string {
        return this._fullName;
    }

    set fullName(value: string) {
        this._fullName = value;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get dateBirth(): Date {
        return this._dateBirth;
    }

    set dateBirth(value: Date) {
        this._dateBirth = value;
    }

    get mangas(): number {
        return this._mangas;
    }

    set mangas(value: number) {
        this._mangas = value;
    }

    get completeReadings(): number {
        return this._completeReadings;
    }

    set completeReadings(value: number) {
        this._completeReadings = value;
    }

    get inProgressReadings(): number {
        return this._inProgressReadings;
    }

    set inProgressReadings(value: number) {
        this._inProgressReadings = value;
    }
}