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

## 🤝 2. Cómo contribuir (Vía Issues)

Este catálogo crece con los aportes de todos. Si quieres agregar algo:

1. Ve a la pestaña de **Issues**.
2. Abre uno nuevo usando este formato en el título:
   - `add-book: [ISBN]` (Ej: `add-book: 9780141036144`)
   - `add-movie: [Título]` (Ej: `add-movie: Interstellar`)
   - `add-comic: [ISBN]` (Ej: `add-comic: 9781302915544`)
3. Una vez aprobado por un moderador (etiqueta `approved`), el bot lo agregará automáticamente al catálogo.

---

## 🛠️ 3. Setup Técnico

Si vas a hacer un **Fork** para tener tu propia versión:

1. **Instala dependencias:** `npm install`
2. **API Key:** Consigue una clave gratuita en [omdbapi.com](http://www.omdbapi.com/). Es **fundamental** para que las películas funcionen.
3. **Secrets:** En tu repo, ve a `Settings > Secrets > Actions` y guarda tu clave como `OMDB_API_KEY`.
4. **GitHub Pages:** Ve a `Settings > Pages`. En **Source**, selecciona **GitHub Actions**. El workflow incluido (`deploy.yml`) se encargará del resto.

Para probar los scripts manualmente:

```bash
export OMDB_API_KEY="tu_clave"
node scripts/fetch-book.js 9780141187761
node scripts/fetch-movie.js "Inception"
node scripts/fetch-comic.js 9781302915544
```

---

## 👨‍💻 4. Desarrollo

Si quieres colaborar con código:

1. **Formateo y Linting:**
   - `npm run lint`: Busca errores.
   - `npm run format`: Arregla el estilo de código automáticamente.

2. **Estructura:**
   - `scripts/`: Scripts de ejecución (CLI).
   - `src/`: Código fuente reutilizable.
