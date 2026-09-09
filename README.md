# open-catalog-project 📚🎬

Base de datos estática de libros, películas y cómics con optimización de espacio y minificación automática. Los datos se sirven como archivos JSON estáticos de alto rendimiento, ideal para aplicaciones que necesitan información rápida sin depender de APIs externas complejas o lentas.

---

## 🌐 1. Cómo usar la API

No necesitas clonar el repositorio. Puedes consumirlo directamente desde GitHub Pages o CDN:

- **Libros:** `https://sebavidal10.github.io/open-catalog-project/data/books/[ISBN].json`
- **Películas:** `https://sebavidal10.github.io/open-catalog-project/data/movies/[slug].json`
- **Cómics:** `https://sebavidal10.github.io/open-catalog-project/data/comics/[identifier].json`

### Índices Generales
Cada categoría dispone de un archivo `index.json` minificado con el listado completo de slugs, títulos e identificadores:
- `https://sebavidal10.github.io/open-catalog-project/data/movies/index.json` (28.800+ películas)
- `https://sebavidal10.github.io/open-catalog-project/data/comics/index.json` (9.300+ cómics)
- `https://sebavidal10.github.io/open-catalog-project/data/books/index.json` (200+ libros)

### Ejemplo de uso (JavaScript / TypeScript)

```javascript
// Para un libro
fetch('https://sebavidal10.github.io/open-catalog-project/data/books/9780141187761.json')
  .then((res) => res.json())
  .then((data) => console.log(data.title));

// Para una película
fetch('https://sebavidal10.github.io/open-catalog-project/data/movies/inception.json')
  .then((res) => res.json())
  .then((data) => console.log(data.director));

// Para un cómic
fetch('https://sebavidal10.github.io/open-catalog-project/data/comics/9781302915544.json')
  .then((res) => res.json())
  .then((data) => console.log(data.title));
```

---

## ⚡ 2. Automatización y Optimización de Almacenamiento

El catálogo cuenta con mecanismos automáticos para evitar el crecimiento desmedido en disco:

1. **Minificación Automática en Origen**: Toda escritura (`saveFile`) a través de la API del Receiver o scripts scrapers se guarda automáticamente en formato minificado (JSON de una sola línea sin saltos ni espacios redundantes).
2. **Actualización Incremental de Índices**: Al registrar un nuevo item en el Receiver Server (`server.js`), el índice `index.json` de la categoría se actualiza instantáneamente en memoria/disco en 1 ms, sin reescanear el disco.
3. **Script de Optimización Masiva (`npm run optimize`)**:
   Procesa los más de 38.000 archivos del catálogo, los minifica en bloque y regenera los índices completos:
   ```bash
   npm run optimize
   ```

---

## 🚀 3. Receiver Server (Sync API)

Servidor Express (`server.js`) diseñado para recibir nuevos items desde `boveda-api` de forma segura.

### Requisitos y Configuración

1. Copia las variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Inicia el servidor:
   ```bash
   npm start
   # o en desarrollo:
   node server.js
   ```

### Endpoints

- **POST `/items?type=[BOOK|COMIC|MOVIE]`**:
  Guarda el item minificado y actualiza el índice de la categoría de forma incremental.
  - **Headers**: `x-api-key: <CATALOG_API_KEY>` (por defecto `dev-key-123` en desarrollo).
  - **Body**: Objeto JSON con los datos del item.

---

## 🛠️ 4. Scripts y Comandos de Desarrollo

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el Receiver Server en el puerto configurado (`3001` por defecto) |
| `npm run optimize` | Minifica los 38k+ archivos en disco y reconstruye todos los `index.json` |
| `npm run index` | Reconstruye únicamente los archivos `index.json` |
| `npm test` | Ejecuta las pruebas unitarias con Vitest (modelos y file-system) |
| `npm run lint` | Ejecuta ESLint en todo el proyecto (0 advertencias, 0 errores) |
| `npm run format` | Formatea el código con Prettier |

---

## 👨‍💻 5. Licencia

Distribuido bajo la licencia MIT.
