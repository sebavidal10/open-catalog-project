# open-catalog-project 📚🎬

API estática y automatizada de medios. Los datos se sirven como archivos JSON estáticos, ideales para aplicaciones que necesitan una base de datos de libros y películas sin depender de APIs externas lentas o con límites de cuota severos.

---

## 🌐 1. Uso de la API (Consumo Externo)

Esta es la forma más rápida de usar el proyecto. Puedes consumir los datos directamente desde la infraestructura de GitHub Pages de este repositorio.

### 📚 Libros

- **Endpoint:** `https://sebavidal10.github.io/open-catalog-project/data/books/[ISBN].json`
- **Ejemplo de integración:**

```javascript
const isbn = '9780141187761';
fetch(
  `https://sebavidal10.github.io/open-catalog-project/data/books/${isbn}.json`,
)
  .then((res) => res.json())
  .then((data) => console.log(data));
```

- **Esquema de respuesta:**

```json
{
  "isbn": "9780141187761",
  "title": "Nineteen Eighty-Four",
  "authors": ["George Orwell"],
  "pages": 384,
  "cover": "https://covers.openlibrary.org/...",
  "fetched_at": "2026-02-02T..."
}
```

### 🎬 Películas

- **Endpoint:** `https://sebavidal10.github.io/open-catalog-project/data/movies/[slug].json`
- **Ejemplo de integración:**

```javascript
const slug = 'inception';
fetch(
  `https://sebavidal10.github.io/open-catalog-project/data/movies/${slug}.json`,
)
  .then((res) => res.json())
  .then((data) => console.log(data));
```

- **Esquema de respuesta:**

```json
{
  "title": "Inception",
  "year": "2010",
  "director": "Christopher Nolan",
  "poster": "https://m.media-amazon.com/...",
  "imdbRating": "8.8",
  "fetched_at": "2026-02-02T..."
}
```

---

---

## 🤝 2. Cómo Contribuir (Aportes vía Issue)

No necesitas programar para colaborar. El catálogo crece gracias a los aportes de la comunidad a través de los **Issues**.

### Pasos para sugerir contenido:

1. Ve a la pestaña **Issues** de este repositorio.
2. Crea un **New Issue** con el título:
   - Para libros: `add-book: [ISBN]` (Ej: `add-book: 9780141036144`)
   - Para películas: `add-movie: [Título]` (Ej: `add-movie: Interstellar`)
3. Un administrador revisará el pedido y añadirá la etiqueta `approved`.
4. El **Catalog Bot** procesará la solicitud, extraerá la información y actualizará la API automáticamente.

---

## 🛠️ 3. Guía de Instalación y Uso Local

Si prefieres tener tu propia copia o usar los scripts para descargar datos a tu propio servidor.

### Requisitos

- Node.js v20+
- Una clave de [OMDb API](http://www.omdbapi.com/) (solo para películas).

### Setup

1. **Clonar y preparar:**

   ```bash
   git clone https://github.com/sebavidal10/open-catalog-project.git
   cd open-catalog-project
   npm install
   ```

2. **Configurar llave de OMDb:**

   ```bash
   export OMDB_API_KEY="tu_clave_aqui"
   ```

3. **Descargar nuevos registros:**
   ```bash
   node scripts/fetch-book.js 9780141187761
   node scripts/fetch-movie.js "Inception"
   ```

---

## 🚀 4. Despliega tu propia API

¿Quieres tu propia versión privada?

1. Haz un **Fork** de este proyecto.
2. Ve a **Settings > Secrets and variables > Actions** y añade `OMDB_API_KEY`.
3. En **Settings > Pages**, activa el despliegue desde la rama `main`.
4. El bot funcionará en tu propio fork del mismo modo.
