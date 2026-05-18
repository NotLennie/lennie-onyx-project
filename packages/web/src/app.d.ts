declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        name: string;
        email: string;
        profilePictureUrl: string | null;
        role: 'client' | 'employee' | 'admin';
      } | null;
    }
  }
}

export {};
