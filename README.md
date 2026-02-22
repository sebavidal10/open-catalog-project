# open-catalog-project 📚🎬

Base de datos estática de libros y películas. Los datos se sirven como archivos JSON estáticos, ideal para apps que necesitan info rápida sin lidiar con APIs externas complejas.

---

## 🌐 1. Cómo usar la API

No necesitas clonar nada. Consúmelo directamente desde GitHub Pages:

- **Libros:** `https://sebavidal10.github.io/open-catalog-project/data/books/[ISBN].json`
- **Películas:** `https://sebavidal10.github.io/open-catalog-project/data/movies/[slug].json`
- **Cómics:** `https://sebavidal10.github.io/open-catalog-project/data/comics/[ISBN].json`

### Ejemplo de uso (JS)

```javascript
// Para un libro
fetch(
  'https://sebavidal10.github.io/open-catalog-project/data/books/9780141187761.json',
)
  .then((res) => res.json())
  .then((data) => console.log(data.title));

// Para una película
fetch(
  'https://sebavidal10.github.io/open-catalog-project/data/movies/inception.json',
)
  .then((res) => res.json())
  .then((data) => console.log(data.director));

// Para un cómic
fetch(
  'https://sebavidal10.github.io/open-catalog-project/data/comics/9781302915544.json',
)
  .then((res) => res.json())
  .then((data) => console.log(data.title));
```

### Formatos de respuesta

#### 📚 Libro

```json
{
  "isbn": "9780141187761",
  "title": "Nineteen Eighty-Four",
  "authors": ["George Orwell"],
  "publish_date": "January 29, 2004",
  "pages": 384,
  "cover": "https://covers.openlibrary.org/...",
  "fetched_at": "2026-02-02T..."
}
```

#### 🎬 Película

```json
{
  "title": "Inception",
  "year": "2010",
  "director": "Christopher Nolan",
  "writer": "Christopher Nolan",
  "actors": "Leonardo DiCaprio, Joseph Gordon-Levitt",
  "poster": "https://m.media-amazon.com/...",
  "imdbRating": "8.8",
  "plot": "A thief who steals corporate secrets...",
  "fetched_at": "2026-02-02T..."
}
```

#### 📚 Cómic

```json
{
  "isbn": "9781302915544",
  "title": "The Amazing Spider-Man Epic Collection: Great Power",
  "authors": ["Stan Lee", "Steve Ditko"],
  "publish_date": "2019",
  "publisher": ["Marvel"],
  "pages": 480,
  "cover": "https://covers.openlibrary.org/...",
  "subjects": ["Comics & Graphic Novels", "Superheroes"],
  "fetched_at": "2026-02-05T..."
}
```

---

## 🤝 2. Cómo contribuir

Este catálogo crece de dos formas:

1.  **Sincronización Automática:** La API de Bóveda envía automáticamente nuevos items encontrados en librerías externas (como OpenLibrary) al **Receiver Server**.
2.  **Manual:** Agregando archivos JSON directamente al repositorio y regenerando índices.

---

## 🚀 3. Receiver Server (Sync API)

El proyecto incluye un servidor Express (`server.js`) diseñado para recibir nuevos items desde el backend de Bóveda de forma segura.

### Requisitos locales

- Node.js 18+
- Variables de entorno:
  - `CATALOG_API_KEY`: Clave secreta para autorizar peticiones (debe coincidir con la del backend).
  - `PORT`: Puerto de escucha (default: `3001`).

### Ejecución

```bash
# Copia el ejemplo de env
cp .env.example .env
# Inicia el servidor
node server.js
```

### Endpoints

- **POST `/items?type=[BOOK|COMIC|MOVIE]`**: Guarda un nuevo item y regenera el índice automáticamente. Requiere header `x-api-key`.

---

## 🛠️ 4. Setup Técnico

Si vas a hacer un **Fork** para tener tu propia versión:

1. **Instala dependencias:** `npm install`
2. **GitHub Pages:** Ve a `Settings > Pages`. En **Source**, selecciona **GitHub Actions**. El workflow incluido (`deploy.yml`) se encargará del resto.

### Generar índices

Si has añadido contenido manualmente o mediante los scripts, ejecuta:

```bash
node scripts/generate-index.js
```

Esto actualizará los archivos `index.json` en las carpetas de `data/movies/`, `data/books/` y `data/comics/`.

---

## 👨‍💻 5. Desarrollo

Si quieres colaborar con código:

1. **Formateo y Linting:**
   - `npm run lint`: Busca errores.
   - `npm run format`: Arregla el estilo de código automáticamente.

2. **Estructura:**
   - `src/`: Código fuente reutilizable.
   - `scripts/`: Scripts de ejecución (CLI).
   - `tests/`: Pruebas unitarias de scripts.

3. **Pruebas:**
   Todo código nuevo debe incluir tests. Ejecútalos con:
   ```bash
   npm test
   ```
