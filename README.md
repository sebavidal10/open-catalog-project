# open-catalog-project 📚🎬

API estática y automatizada de medios. Los datos se sirven como archivos JSON estáticos, ideales para aplicaciones que necesitan una base de datos de libros y películas sin depender de APIs externas lentas o con límites de cuota severos.

---

## 🌐 1. Uso de la API (Consumo Externo)

Esta es la forma más rápida de usar el proyecto. Puedes consumir los datos directamente desde la infraestructura de GitHub Pages de este repositorio.

### Endpoints

La API sigue una estructura predecible basada en carpetas:

- **Libros:** `https://sebavidal10.github.io/open-catalog-project/data/books/[ISBN].json`
- **Películas:** `https://sebavidal10.github.io/open-catalog-project/data/movies/[slug].json`

### Ejemplo de Integración (JavaScript)

```javascript
// Obtener información de un libro
const isbn = '9780141187761';
fetch(
  `https://sebavidal10.github.io/open-catalog-project/data/books/${isbn}.json`,
)
  .then((response) => response.json())
  .then((data) => console.log(data.title)); // "Nineteen Eighty-Four"
```

### Formato de Respuesta

| Campo              | Tipo         | Descripción                           |
| :----------------- | :----------- | :------------------------------------ |
| `title`            | string       | Título oficial del medio.             |
| `authors/director` | array/string | Creadores del contenido.              |
| `cover/poster`     | url          | Enlace a la imagen principal.         |
| `fetched_at`       | string       | Fecha ISO de la última actualización. |

---

## 🛠️ 2. Guía de Instalación y Uso Local

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
   # Un libro por ISBN
   node scripts/fetch-book.js 9780141187761

   # Una película por título
   node scripts/fetch-movie.js "Inception"
   ```

---

## 🤖 3. Automatización (Cómo crece el catálogo)

Este repositorio utiliza el **Catalog Bot**, un sistema basado en GitHub Actions que permite a la comunidad sugerir contenido.

### Flujo de Contribución

1. Crea un **Issue** con el título `add-book: [ISBN]` o `add-movie: [Título]`.
2. El bot esperará a que un administrador añada la etiqueta `approved`.
3. Una vez aprobado, el bot extrae la información, genera el JSON y lo sube al repositorio automáticamente.

---

## 🚀 4. Despliega tu propia API

¿Quieres tu propia versión privada?

1. Haz un **Fork** de este proyecto.
2. Ve a **Settings > Secrets and variables > Actions** y añade `OMDB_API_KEY`.
3. En **Settings > Pages**, activa el despliegue desde la rama `main`.
4. El bot funcionará en tu propio fork del mismo modo.
