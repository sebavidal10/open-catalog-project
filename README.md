# open-catalog-project 📚🎬

Base de datos estática de libros y películas servida mediante archivos JSON. Los datos se actualizan automáticamente con GitHub Actions cuando alguien propone contenido.

---

## 🌐 1. Uso de la API (Consumo)

No necesitas clonar el repo si solo quieres los datos. Consúmelo como una API REST estática desde GitHub Pages:

- **Libros:** `https://sebavidal10.github.io/open-catalog-project/data/books/[ISBN].json`
- **Películas:** `https://sebavidal10.github.io/open-catalog-project/data/movies/[slug].json`

### Ejemplo de respuesta (JSON)

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

## 🤝 2. Cómo Contribuir (Vía Issues)

Este catálogo crece gracias a la comunidad. Si falta algo, no hace falta que sepas programar:

1. Ve a **Issues** y crea uno nuevo.
2. Título del Issue:
   - Libro: `add-book: 9780141036144` (usa el ISBN-13)
   - Película: `add-movie: The Matrix`
3. Cuando un moderador le ponga la etiqueta `approved`, el bot se encargará de bajar la info y subirla al catálogo automáticamente.

---

## 🛠️ 3. Setup y Desarrollo Local

Si quieres bajar los datos a tu máquina o desplegar tu propia copia:

### Requisitos y API Key

Para las películas es **obligatorio** tener una clave de [OMDb API](http://www.omdbapi.com/) (es gratis). Sin ella, el script de películas fallará.

### Instalación

```bash
git clone https://github.com/sebavidal10/open-catalog-project.git
cd open-catalog-project
npm install
```

### Ejecutar scripts manualmente

```bash
# Setea tu clave (solo para pelis)
export OMDB_API_KEY="tu_clave_aqui"

# Bajar info
node scripts/fetch-book.js 9780141187761
node scripts/fetch-movie.js "Interstellar"
```

---

## 🚀 4. Tu propia versión

Si quieres hostear esto tú mismo:

1. Haz un **Fork** de este repo.
2. Sube tu `OMDB_API_KEY` a los **Secrets** de GitHub (Settings > Secrets > Actions).
3. Activa **GitHub Pages** en la configuración del repo apuntando a la rama `main`.
