import type { User } from "./Users.js";

    export interface Location {
        id: string;
        name: string;
        address: string;
        isActive: boolean;
         users?: User[];
    }