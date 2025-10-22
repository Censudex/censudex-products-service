# Taller N°2: Microservicio de Productos (Censudex)

Este repositorio contiene el `Products Service`, uno de los microservicios desarrollados para el Taller N°2: Migración a Microservicios de Censudex.

En este repositorio gestiona toda la lógica de negocio y el ciclo de vida (CRUD) de los productos del catálogo. Esto incluye la creación, consulta, actualización y eliminación de productos, así como la gestión de sus imágenes asociadas (Cloudinary).

---

## 🚀 Arquitectura y Patrón de Diseño

Para cumplir con los requisitos del taller, este microservicio se construyó usando una arquitectura limpia y modularizada:

* **Framework:** **NestJS** (Node.js), un framework robusto para construir aplicaciones escalables en el lado del servidor.
* **Protocolo de Comunicación:** **gRPC**. El servicio expone todos sus métodos a través de un contrato `.proto` (`src/proto/products.proto`) para ser consumido de forma síncrona por el API Gateway.
* **Base de Datos:** **MongoDB**, tal como se especifica en los requisitos del taller. Se utiliza **Mongoose** como ODM para la modelación y acceso a los datos.
* **Gestión de Imágenes:** **Cloudinary**. Toda la lógica de subida y gestión de imágenes está encapsulada en su propio módulo (`CloudinaryModule`) para una clara separación de intereses.
* **Patrón de Diseño:** **Patrón Repositorio (Repository Pattern)**. Se implementó este patrón para desacoplar completamente la lógica de negocio (`ProductsService`) de la lógica de acceso a datos (`ProductsRepository`).
    * El **Controlador de Productos** (gRPC) solo recibe la llamada y la delega al servicio.
    * El **Servicio de Productos** contiene toda la lógica de negocio (validaciones, orquestación de subida de imágenes, etc.) y llama al repositorio.
    * El **Repositorio de Productos** es la única capa que habla directamente con Mongoose y la base de datos.
* **Gestión de Configuración:** Se utiliza `@nestjs/config` para manejar variables de entorno (MongoDB URI, Claves de Cloudinary) de forma segura a través de un archivo `.env`.

---

## 📋 Consultas Disponibles (API gRPC)

El servicio `ProductsService` expone los siguientes métodos gRPC:

* **`CreateProduct(CreateProductRequest)`**
    Registra un nuevo producto. Requiere nombre, descripción, precio, categoría y los datos de la imagen (`image_data`). Valida que el nombre sea único y sube la imagen a Cloudinary.

* **`GetProducts(GetProductsRequest)`**
    Devuelve un listado de todos los productos registrados en la base de datos.

* **`GetProductById(GetProductByIdRequest)`**
    Busca y devuelve un producto específico basado en su ID (UUID).

* **`UpdateProduct(UpdateProductRequest)`**
    Actualiza la información de un producto existente. Permite cambiar nombre, descripción, precio y categoría. Si se envía una nueva imagen (`new_image_data`), reemplaza la anterior en Cloudinary.

* **`DeleteProduct(DeleteProductRequest)`**
    Desactiva un producto marcándolo como "inactivo". Esto implementa la lógica de **Soft Delete** requerida, preservando el registro en la base de datos para mantener la trazabilidad.

---

## 🛠️ Cómo Ejecutar el Proyecto (Paso a Paso)

Sigue estos pasos para levantar el microservicio localmente.

### 1. Prerrequisitos
* Tener **Node.js** (v18 o superior) instalado.
* Una cuenta de **MongoDB Atlas** (para obtener la URL de conexión).
* Una cuenta de **Cloudinary** (para obtener las claves de API).

### 2. Clonar el Repositorio
```bash
git clone [https://github.com/Censudex/censudex-products-service.git](https://github.com/Censudex/censudex-products-service.git)
cd censudex-products-service
```

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Configurar Variables de Entorno
Crea un archivo llamado (`.env`) en la misma altura que (`/src`)
Copia el contenido de (`.env.example`) o usa este ejemplo:
```bash
MONGO_URI=your_mongo_uri_here
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```
Asegúrate de reemplazar los valores y de que tu IP esté en la whitelist de MongoDB Atlas.

### 5. Ejecutar el Servicio
```bash
npm run start:dev
```
El servidor se iniciará en modo *watch*. Deberías ver el siguiente mensaje en tu consola, indicando que está listo para recibir conexiones gRPC:
```bash
Products Service se está ejecutando en el puerto 50051
```

---

## 🧪 Cómo Probar

Se recomienda probar en **Postman** en su modo **gRPC Request**.
1. **Crear Petición:** Crea una nueva petición gRPC en Postman.

2. **Importar .proto:** Importa el archivo src/proto/products.proto para cargar la definición del servicio.

3. **URL del Servidor:** Ingresa localhost:50051.

4. **Desactivar TLS:** Haz clic en el ícono de candado 🔒 junto a la URL y desactiva la opción "Enable TLS".

### **Flujo de Pruebas Recomandado**

Sigue estos pasos en orden para probar el ciclo de vida completo (CRUD) de un producto.

1. Probar (`CreateProduct`)
    * **Acción:** Selecciona el método (`CreateProduct`) y envía un JSON válido. El campo (`image_data`) espera un string Base64 (sin prefijos).
    * **Ejemplo de Mensaje:**
      ```JSON
      {
        "name": "Producto de Prueba",
        "description": "Probando la creación del servicio.",
        "price": 19990,
        "category": "Pruebas",
        "image_data": "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      }
      ```
     * **Resultado Esperado:** Un objeto (`product`) con el nuevo ID, la URL de Cloudinary y el estado (`"active"`). Copia el (`id`) para las siguientes pruebas.
      
2. Probar (`GetProducts`)
    * **Acción:** Selecciona el método (`GetProducts`) y presiona "Invoke".
    * **Resultado Esperado:** Un objeto (`products`) que contiene una lista (array) con el producto que acabas de crear.

3. Probar (`GetProductById`)
    * **Acción:** Selecciona el método (`GetProductById`). Usa el (`id`) que copiaste del paso 1.
    * **Ejemplo de Mensaje:**
      ```JSON
      {
        "id": "tu-id-copiado-del-producto-creado"
      }
      ```
     * **Resultado Esperado:** El objeto (`product`) completo.

4. Probar (`UpdateProduct`)
    * **Acción:** Selecciona el método (`UpdateProduct`). Usa el mismo (`id`).
    * **Ejemplo de Mensaje:** (Para cambiar el precio, pero se puede actualizar cualquier campo)
      ```JSON
      {
        "id": "tu-id-copiado-del-producto-creado",
        "price": 25000
      }
      ```
    * **Resultado Esperado:** El objeto (`product`) con el (`price`) actualizado a `25000`.

5. Probar (`DeleteProduct`) (Soft Delete)
    * **Acción:** Selecciona el método (`DeleteProduct`). Usa el mismo (`id`).
    * **Ejemplo de Mensaje:**
      ```JSON
      {
        "id": "tu-id-copiado-del-producto-creado"
      }
      ```
     * **Resultado Esperado:** El objeto (`product`) completo, pero con el campo (`status: "inactive"`).
  
6. (Opcional) Verificar Soft Delete
    * **Acción:** Vuelve a llamar a (`GetProductById`) con el mismo id.
    * **Resultado Esperado:** El producto aún se devuelve, confirmando que no se borró de la base de datos, y su estado es `inactive"`.
