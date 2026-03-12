# INF276 - Ingeniería, Informática y Sociedad

Bienvenidos al proyecto de INF276 - Sistema de Gestión de Trayectoria Académica

**Desarrollado por:** Andreu Lechuga

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm o pnpm instalado

### Instalación y Ejecución

#### Primera vez (instalar dependencias)
```bash
# Usando npm
npm install
npm run dev

# O usando pnpm (más rápido)
pnpm install
pnpm dev
```

#### Ejecuciones posteriores
```bash
# Usando npm
npm run dev

# O usando pnpm
pnpm dev
```

### 📍 Visualización del Proyecto

Una vez iniciado el servidor de desarrollo, abre tu navegador en:
- **URL:** http://localhost:3000

El servidor se ejecutará con hot-reload, lo que significa que los cambios se reflejarán automáticamente.

---

## 📦 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta el linter para verificar el código |

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 15.2.4
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **UI Components:** Radix UI
- **Gestión de Estado:** React Hooks
- **Drag & Drop:** @hello-pangea/dnd

---

## 📁 Estructura del Proyecto

```
├── app/                    # Páginas y rutas de la aplicación
├── components/             # Componentes reutilizables
├── data/                   # Datos de carreras y progreso
├── hooks/                  # Custom React hooks
├── lib/                    # Utilidades y servicios
├── public/                 # Archivos estáticos
├── types/                  # Definiciones de TypeScript
└── docs/                   # Documentación del proyecto
```

---

## 🌐 Despliegue en GitHub Pages

Este proyecto está configurado para desplegarse automáticamente en GitHub Pages.

### 🔗 URL de Producción
**https://andreu-lechuga.github.io/INF276-Trayectoria-Sansana/**

### 📖 Guía de Despliegue
Para más información sobre cómo desplegar y configurar el proyecto, consulta [DEPLOY.md](./DEPLOY.md)

### ⚡ Despliegue Automático
Cada push a la rama `main` despliega automáticamente los cambios a GitHub Pages mediante GitHub Actions.
