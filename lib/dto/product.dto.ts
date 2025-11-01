export interface ProductDTO {
  id: number;
  name: string;
  brandId: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  subBrandId?: number;
}

export interface ProductDetailDTO extends ProductDTO {
  posUuid?: string;
  createdAt?: Date;
}

export interface CreateProductDTO {
  name: string;
  brandId: number;
  categoryId?: number;
  subBrandId?: number;
  posUuid?: string;
}

export interface UpdateProductDTO {
  name?: string;
  categoryId?: number;
  posUuid?: string;
}
