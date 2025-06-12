# Guía de Integración del Sistema de Almacenamiento

## 🎯 Resumen de la Implementación

He implementado un sistema completo de almacenamiento y gestión de datos que cumple con todos tus requerimientos:

### ✅ Funcionalidades Implementadas

1. **Almacenamiento Local (Cache)** - Sin login, datos en localStorage
2. **Sistema de Reprobaciones con VTR** - Copias automáticas con incremento de VTR
3. **Eliminación en Cascada** - Elimina todas las copias relacionadas
4. **Validación de Prerrequisitos** - Verificación automática antes de añadir cursos
5. **Persistencia Automática** - Guardado en cada cambio

## 📁 Archivos Creados

```
types/user-progress.ts              # Tipos TypeScript del sistema
lib/storage-service.ts              # Servicio de localStorage
lib/course-state-manager.ts        # Lógica de reprobaciones y copias
lib/data-manager.ts                # Gestor principal que combina datos
hooks/use-user-progress.ts         # Hook principal para el progreso
hooks/use-course-operations.ts     # Hook para operaciones específicas
components/enhanced-task-card.tsx  # Componente mejorado con funcionalidades
docs/SISTEMA_ALMACENAMIENTO.md     # Documentación completa
```

## 🔧 Pasos para Integrar en tu Proyecto

### Paso 1: Verificar Dependencias

El sistema usa las dependencias que ya tienes en tu proyecto:
- React hooks (useState, useEffect, useCallback)
- Tu sistema de toasts existente (@/hooks/use-toast)
- Componentes UI que ya tienes

### Paso 2: Integración Gradual

#### Opción A: Integración Completa (Recomendada)

Reemplaza tu `app-container.tsx` actual con una versión que use el nuevo sistema:

```typescript
// En tu app-container.tsx
import { useUserProgress } from '@/hooks/use-user-progress';
import { useCourseOperations } from '@/hooks/use-course-operations';
import { cursos } from '@/data/data_INF';

export default function AppContainer() {
  const {
    columns,
    sidebarTasks,
    userProgress,
    isLoading,
    error,
    refreshData
  } = useUserProgress(cursos, 'INF');

  const {
    addCourseToCurrentSemester,
    handleCourseStatusChange,
    handleCourseRemoval
  } = useCourseOperations();

  // Tu lógica existente de UI...
  
  return (
    // Tu JSX existente, pero usando los nuevos datos
  );
}
```

#### Opción B: Integración Parcial (Para Testing)

Mantén tu código actual y añade el nuevo sistema gradualmente:

```typescript
// Añadir al final de tu app-container.tsx existente
import { dataManager } from '@/lib/data-manager';

// En tu useEffect de carga de datos:
useEffect(() => {
  if (selectedCarrera) {
    // Tu código existente...
    
    // Añadir inicialización del nuevo sistema
    dataManager.initialize(cursos, selectedCarrera.link);
    
    // Opcional: obtener datos del nuevo sistema para comparar
    const newSystemData = dataManager.getCombinedKanbanData();
    console.log('Datos del nuevo sistema:', newSystemData);
  }
}, [selectedCarrera]);
```

### Paso 3: Actualizar TaskCard (Opcional)

Puedes reemplazar tu `TaskCard` actual con el nuevo `EnhancedTaskCard`:

```typescript
// En lugar de:
import TaskCard from './task-card';

// Usar:
import EnhancedTaskCard from './enhanced-task-card';

// Y en el render:
<EnhancedTaskCard
  task={task}
  onUpdate={refreshData}
  showActions={true}
  isInSidebar={false}
/>
```

### Paso 4: Funcionalidades de Reprobación

Para añadir las funcionalidades de reprobación a tus componentes existentes:

```typescript
import { useCourseOperations } from '@/hooks/use-course-operations';

function MiComponente() {
  const { handleCourseStatusChange } = useCourseOperations();

  const marcarComoReprobado = async (instanceId: string) => {
    const success = await handleCourseStatusChange(instanceId, 'reprobado');
    if (success) {
      // Se creó automáticamente una copia en el siguiente semestre
      refreshData(); // Actualizar la UI
    }
  };

  const marcarComoAprobado = async (instanceId: string) => {
    const success = await handleCourseStatusChange(instanceId, 'aprobado');
    if (success) {
      refreshData(); // Actualizar la UI
    }
  };
}
```

## 🔄 Migración de Datos Existentes

### Si ya tienes datos en localStorage:

El sistema incluye migración automática. Si detecta datos en un formato anterior, los migrará automáticamente.

### Para limpiar y empezar de nuevo:

```typescript
import { storageService } from '@/lib/storage-service';

// Limpiar datos existentes
storageService.clearUserProgress();

// El sistema creará automáticamente nuevos datos la próxima vez
```

## 🧪 Testing del Sistema

### 1. Verificar Almacenamiento

```typescript
// En la consola del navegador:
localStorage.getItem('trayectoria-sansana-progress');
```

### 2. Probar Reprobaciones

1. Añade un curso a un semestre
2. Márcalo como reprobado
3. Verifica que aparezca una copia en el siguiente semestre
4. Verifica que el VTR se haya incrementado

### 3. Probar Eliminación en Cascada

1. Elimina un curso que tenga copias
2. Verifica que se eliminen todas las instancias relacionadas

## 🎨 Personalización Visual

### Colores de Estado

El sistema usa estos colores por defecto:
- **Aprobado**: Verde (#10b981)
- **Reprobado**: Rojo (#ef4444)
- **Pendiente**: Color original del curso

Puedes personalizar en `enhanced-task-card.tsx`:

```typescript
const getStatusInfo = () => {
  switch (task.estado) {
    case 'aprobado':
      return { color: "#tu-color-verde" };
    case 'reprobado':
      return { color: "#tu-color-rojo" };
    // ...
  }
};
```

### Badges y Indicadores

El sistema muestra automáticamente:
- Badge de estado (Aprobado/Reprobado/Pendiente)
- Badge de VTR cuando es > 1
- Badge de "Copia" para cursos generados por reprobación

## 📊 Monitoreo y Debug

### Información de Debug

En modo desarrollo, el `EnhancedTaskCard` muestra información adicional:
- Instance ID del curso
- ID del curso original (para copias)

### Logs del Sistema

El sistema incluye logs detallados en la consola:
- Operaciones de guardado
- Creación de copias
- Eliminaciones en cascada
- Errores de validación

## 🚨 Consideraciones Importantes

### 1. Compatibilidad con Código Existente

El nuevo sistema está diseñado para coexistir con tu código actual. Puedes:
- Mantener tu lógica de UI existente
- Usar solo las partes del sistema que necesites
- Migrar gradualmente

### 2. Rendimiento

- El sistema es eficiente y solo guarda cuando hay cambios reales
- Los datos se cargan una sola vez al inicializar
- Las operaciones son síncronas excepto el guardado

### 3. Limitaciones del localStorage

- Límite típico: ~5-10MB por dominio
- Los datos se pierden si el usuario limpia el navegador
- Considera implementar exportación/importación para backup

## 🔧 Resolución de Problemas

### Error: "dataManager is not initialized"

```typescript
// Asegúrate de inicializar antes de usar:
dataManager.initialize(cursos, 'INF');
```

### Error: "Cannot read property of undefined"

```typescript
// Verifica que los datos estén cargados:
if (columns.length > 0) {
  // Usar los datos
}
```

### Datos no se guardan

```typescript
// Verificar que localStorage esté disponible:
if (typeof window !== 'undefined' && window.localStorage) {
  // localStorage disponible
}
```

## 📞 Soporte

Si tienes problemas con la integración:

1. **Revisa la documentación**: `docs/SISTEMA_ALMACENAMIENTO.md`
2. **Consulta los tipos**: `types/user-progress.ts`
3. **Revisa los ejemplos**: En los hooks y componentes
4. **Verifica la consola**: Para logs de error detallados

## 🎉 ¡Listo para Usar!

El sistema está completamente implementado y listo para integrarse en tu proyecto. Puedes empezar con una integración parcial para testing y luego migrar completamente cuando te sientas cómodo con el sistema.

**¡El sistema cumple con todos tus requerimientos originales y está optimizado para tu caso de uso específico!**
