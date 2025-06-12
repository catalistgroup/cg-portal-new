declare global {
  export namespace Express {
    export interface Request {
      user?: {
        id: number;
      };
    }
  }
}

export {};
