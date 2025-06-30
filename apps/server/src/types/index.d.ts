declare global {
  export namespace Express {
    export interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        phone?: string;
        type: string;
        is_superuser?: boolean;
      };
    }
  }
}

export {};
