import "next-auth";

declare module "next-auth" {
  export interface Session {
    idToken: string | undefined;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idToken: string | undefined;
  }
}
