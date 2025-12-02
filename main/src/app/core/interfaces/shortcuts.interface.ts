export interface RegisteredAction {
    id: string;
    handler: () => void;
    description?: string;
}