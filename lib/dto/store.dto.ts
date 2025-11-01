export interface StoreDTO {
  id: number;
  name: string;
  brandId: number;
  brandName?: string;
  city?: string;
  state?: string;
  district?: string;
  isActive: boolean;
}

export interface StoreDetailDTO extends StoreDTO {
  addressStreet?: string;
  addressNumber?: number;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  isOwn: boolean;
  isHolding: boolean;
  creationDate?: Date;
}

export interface CreateStoreDTO {
  name: string;
  brandId: number;
  subBrandId?: number;
  city?: string;
  state?: string;
  district?: string;
  addressStreet?: string;
  addressNumber?: number;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  isOwn?: boolean;
  isHolding?: boolean;
  creationDate?: Date;
}

export interface UpdateStoreDTO {
  name?: string;
  city?: string;
  state?: string;
  addressStreet?: string;
  addressNumber?: number;
  zipcode?: string;
  isActive?: boolean;
}
