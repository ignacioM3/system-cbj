export interface Attendance {
    id: string;
    participantId: string;
    locationId: string;
    date: Date;
    time: string;
    isActive: boolean;
    registeredBy?: string;
}