    export interface Participant {
        id: string;
        firstName: string;
        lastName: string;
        documentNumber: string;
        birthDate?: Date;
        email?: string;
        phone?: string;
        isActive: boolean;
        created_at: Date;
    }