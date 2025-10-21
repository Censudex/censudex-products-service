export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  imageData: Buffer; 
}

export interface UpdateProductDto {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  newImageData?: Buffer; 
}