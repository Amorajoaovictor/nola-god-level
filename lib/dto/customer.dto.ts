export interface CustomerDTO {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  createdAt: Date;
}

export interface CustomerDetailDTO extends CustomerDTO {
  birthDate?: Date;
  gender?: string;
  storeId?: number;
  registrationOrigin?: string;
  agreeTerms: boolean;
  receivePromotionsEmail: boolean;
  receivePromotionsSms: boolean;
}

export interface CustomerProfileDTO {
  customer: CustomerDTO;
  stats: {
    lifetimeValue: number;
    totalOrders: number;
    lastOrderDate?: Date;
  };
}

export interface CreateCustomerDTO {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: Date;
  gender?: string;
  storeId?: number;
  agreeTerms?: boolean;
  receivePromotionsEmail?: boolean;
  receivePromotionsSms?: boolean;
}

export interface UpdateCustomerDTO {
  name?: string;
  email?: string;
  phone?: string;
  receivePromotionsEmail?: boolean;
  receivePromotionsSms?: boolean;
}
