# 🚀 Guía de Despliegue en GitHub Pages

## 📋 Configuración Completada

Este proyecto ha sido configurado para desplegarse automáticamente en GitHub Pages usando Next.js con exportación estática.

### ✅ Cambios Realizados

1. **`next.config.mjs`** - Configurado para exportación estática:
   - `output: 'export'` - Habilita la exportación estática
   - `basePath: '/INF276-Trayectoria-Sansana'` - Ruta base del repositorio
   - `assetPrefix: '/INF276-Trayectoria-Sansana/'` - Prefijo para recursos estáticos

2. **`.github/workflows/deploy.yml`** - Workflow de GitHub Actions:
   - Se ejecuta automáticamente en cada push a `main`
   - Construye la aplicación con `npm run build`
   - Despliega el contenido de `./out` a GitHub Pages

3. **`public/.nojekyll`** - Archivo vacío que previene que GitHub Pages use Jekyll

## 🔧 Pasos para Activar GitHub Pages

### 1. Configurar GitHub Pages en el Repositorio

1. Ve a tu repositorio: `https://github.com/Andreu-Lechuga/INF276-Trayectoria-Sansana`
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona: **GitHub Actions**
5. Guarda los cambios

### 2. Hacer Push de los Cambios

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 3. Verificar el Despliegue

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás el workflow "Deploy to GitHub Pages" ejecutándose
3. Espera a que termine (puede tomar 2-5 minutos)
4. Una vez completado, tu sitio estará disponible en:
   ```
   https://andreu-lechuga.github.io/INF276-Trayectoria-Sansana/
   ```

## 🧪 Probar Localmente

Antes de hacer push, puedes probar el build localmente:

```bash
# Construir la aplicación
npm run build

# El resultado estará en la carpeta ./out
# Puedes servir esta carpeta con cualquier servidor estático
```

Para probar el sitio localmente con el basePath correcto:

```bash
# Instalar un servidor estático simple
npm install -g serve

# Servir la carpeta out
serve out
```

## 📝 Notas Importantes

### Limitaciones de Next.js con `output: 'export'`

- ❌ No se pueden usar API Routes (`/api/*`)
- ❌ No se puede usar Server-Side Rendering (SSR)
- ❌ No se puede usar Incremental Static Regeneration (ISR)
- ❌ No se puede usar Middleware
- ✅ Todas las rutas deben ser estáticas
- ✅ Client-side rendering funciona perfectamente
- ✅ localStorage y otras APIs del navegador funcionan

### Tu Aplicación

Tu aplicación usa principalmente:
- ✅ React components del lado del cliente
- ✅ localStorage para persistencia de datos
- ✅ Rutas estáticas (`/`, `/sistema-almacenamiento`, `/test-modal`)
- ✅ Datos JSON estáticos en `/public/data/`

**Todo esto es compatible con GitHub Pages** ✨

## 🔄 Actualizaciones Futuras

Cada vez que hagas push a la rama `main`, el sitio se actualizará automáticamente:

```bash
git add .
git commit -m "Tu mensaje de commit"
git push origin main
```

El workflow de GitHub Actions se ejecutará automáticamente y desplegará los cambios.

## 🐛 Solución de Problemas

### El sitio no carga correctamente
- Verifica que GitHub Pages esté configurado en **Source: GitHub Actions**
- Revisa los logs en la pestaña **Actions** para ver errores

### Los recursos (imágenes, CSS) no cargan
- Asegúrate de que todos los recursos estén en la carpeta `public/`
- Verifica que las rutas no usen `/` al inicio (el basePath se agrega automáticamente)

### El build falla
- Revisa los errores en la pestaña **Actions**
- Asegúrate de que `npm run build` funcione localmente primero

## 📚 Recursos Adicionales

- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**URL de tu aplicación:** `https://andreu-lechuga.github.io/INF276-Trayectoria-Sansana/`
