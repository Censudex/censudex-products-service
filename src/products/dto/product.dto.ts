/**
 * Datos de transferencia para la creación.
 * Incluye un campo para datos de imagen en formato Buffer.
 */
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  imageData: Buffer; 
}

/**
 * Datos de transferencia para la actualización de productos. 
 * Incluye un campo opcional para nuevos datos de imagen.
 */
export interface UpdateProductDto {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  newImageData?: Buffer; 
}