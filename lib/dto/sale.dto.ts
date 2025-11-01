// Sale DTOs
export interface SaleDTO {
  id: number;
  storeId: number;
  storeName?: string;
  channelId: number;
  channelName?: string;
  customerId?: number;
  customerName?: string;
  createdAt: Date;
  status: string;
  totalAmount: number;
  totalDiscount: number;
  deliveryFee: number;
}

export interface SaleDetailDTO extends SaleDTO {
  products: ProductSaleDTO[];
  payments: PaymentDTO[];
  deliveryInfo?: DeliveryDTO;
}

export interface ProductSaleDTO {
  productId: number;
  productName: string;
  quantity: number;
  basePrice: number;
  totalPrice: number;
  customizations?: ItemCustomizationDTO[];
}

export interface ItemCustomizationDTO {
  itemId: number;
  itemName: string;
  quantity: number;
  additionalPrice: number;
}

export interface PaymentDTO {
  paymentType: string;
  value: number;
  isOnline: boolean;
}

export interface DeliveryDTO {
  courierName?: string;
  courierPhone?: string;
  deliveryType?: string;
  status?: string;
  address?: AddressDTO;
}

export interface AddressDTO {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

// Analytics DTOs
export interface SalesSummaryDTO {
  totalRevenue: number;
  averageTicket: number;
  totalSales: number;
  period?: {
    startDate?: Date;
    endDate?: Date;
  };
}

export interface StorePerformanceDTO {
  storeId: number;
  storeName: string;
  totalRevenue: number;
  totalSales: number;
  averageTicket: number;
  totalDiscount: number;
}

export interface TopProductDTO {
  productId: number;
  productName: string;
  categoryName?: string;
  totalQuantity: number;
  totalRevenue: number;
  salesCount: number;
}
