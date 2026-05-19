// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        name: string;
        email: string;
        profilePictureUrl: string | null;
        role: 'client' | 'employee' | 'admin';
        isAdmin?: boolean;
      } | null;
    }
    interface Platform {
      env: {
        PUBLIC_API_URL: string;
      };
    }
  }
}

export {};
