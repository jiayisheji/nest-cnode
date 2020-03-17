declare namespace Express {
    interface Request {
        csrfToken?: () => string;
        flash?: (type: string, msg?: string) => string;
    }
}