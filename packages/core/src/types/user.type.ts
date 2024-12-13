export interface StaticUser {
  id: string;
  storeId: string;
  name: string;
}

export interface AppUser extends StaticUser {
  priceManager: boolean;
}
