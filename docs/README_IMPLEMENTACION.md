# Implementación del Sistema de Progreso Local - TaskCard

## 🎯 Resumen de la Implementación

He implementado exitosamente las funcionalidades solicitadas para el sistema de progreso local en el componente `TaskCard`. El sistema ahora incluye:

### ✅ Funcionalidades Implementadas

1. **Fondo rojizo para cursos reprobados** - Visual claro del estado
2. **Mostrar VTR en el footer** - Número visible cuando VTR > 1
3. **Integración completa con sistema de almacenamiento local**
4. **Componente EnhancedTaskCard** - Con botones para cambiar estado
5. **Ejemplo de integración completo** - Demostración funcional

## 📁 Archivos Modificados/Creados

### Modificados:
- `components/task-card.tsx` - Añadidas funcionalidades de estado y VTR

### Creados:
- `components/enhanced-task-card.tsx` - Componente con botones de acción
- `components/example-integration.tsx` - Ejemplo completo de uso
- `README_IMPLEMENTACION.md` - Esta documentación

## 🔧 Cambios en TaskCard

### Nuevas Props:
```typescript
interface TaskCardProps {
  // Props existentes...
  
  // Nueva prop para datos del usuario
  userCourseData?: {
    estado: CourseStatus        // 'pendiente' | 'aprobado' | 'reprobado'
    vtr: number                // Veces tomado el ramo
    instanceId: string         // ID único de la instancia
  }
}
```

### Funcionalidades Visuales:

#### 1. **Fondo Rojizo para Reprobados**
```typescript
const getCardBackgroundClass = () => {
  if (userCourseData?.estado === 'reprobado') {
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }
  return 'bg-white dark:bg-gray-800 border dark:border-gray-700'
}
```

#### 2. **VTR en Footer**
```typescript
{/* VTR - Solo mostrar si es > 1 */}
{userCourseData?.vtr && userCourseData.vtr > 1 && (
  <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
    VTR: {userCourseData.vtr}
  </span>
)}
```

## 🚀 Cómo Usar

### Uso Básico (TaskCard con datos locales):

```typescript
import TaskCard from '@/components/task-card'

function MiComponente() {
  const userCourseData = {
    estado: 'reprobado' as CourseStatus,
    vtr: 2,
    instanceId: 'curso-1-vtr-2'
  }

  return (
    <TaskCard
      task={miTarea}
      onClick={() => {}}
      onDuplicate={() => {}}
      userCourseData={userCourseData}  // ← Nueva prop
    />
  )
}
```

### Uso Avanzado (EnhancedTaskCard con botones):

```typescript
import EnhancedTaskCard from '@/components/enhanced-task-card'

function MiComponente() {
  const handleStatusChange = async (instanceId: string, newStatus: CourseStatus) => {
    // Lógica para cambiar estado usando el sistema de almacenamiento
    const result = await markCourseAsApproved(instanceId) // o markCourseAsFailed
    if (result.success) {
      // Actualizar UI
    }
  }

  return (
    <EnhancedTaskCard
      task={miTarea}
      userCourseData={userCourseData}
      onStatusChange={handleStatusChange}
      showActions={true}  // ← Mostrar botones aprobar/reprobar
    />
  )
}
```

### Integración Completa con Sistema de Progreso:

```typescript
import { useUserProgress } from '@/hooks/use-user-progress'
import { cursos } from '@/data/data_INF'

function MiApp() {
  const {
    columns,
    sidebarTasks,
    userProgress,
    markCourseAsFailed,
    markCourseAsApproved,
  } = useUserProgress(cursos, 'INF')

  const getUserCourseData = (task: Task) => {
    // Buscar datos del usuario para esta tarea
    for (const semestreId in userProgress?.semestres) {
      const semestre = userProgress.semestres[semestreId]
      const userCourse = semestre.cursos.find(
        curso => curso.cursoId === task.cursoId
      )
      
      if (userCourse) {
        return {
          estado: userCourse.estado,
          vtr: userCourse.vtr,
          instanceId: userCourse.instanceId,
        }
      }
    }
    return undefined
  }

  return (
    <div>
      {columns.map(column => (
        <div key={column.id}>
          {column.tasks.map(task => (
            <EnhancedTaskCard
              key={task.id}
              task={task}
              userCourseData={getUserCourseData(task)}
              onStatusChange={async (instanceId, newStatus) => {
                if (newStatus === 'aprobado') {
                  await markCourseAsApproved(instanceId)
                } else if (newStatus === 'reprobado') {
                  await markCourseAsFailed(instanceId)
                }
              }}
              showActions={true}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
```

## 🎨 Estilos Visuales

### Estados de Fondo:
- **Normal/Aprobado**: `bg-white dark:bg-gray-800` (fondo blanco/gris)
- **Reprobado**: `bg-red-50 dark:bg-red-900/20` (fondo rojizo sutil)

### VTR en Footer:
- **Fuente**: `font-mono` (monospace para números)
- **Tamaño**: `text-xs` (pequeño, no intrusivo)
- **Color**: `text-gray-600 dark:text-gray-400` (gris sutil)
- **Formato**: "VTR: 2" (solo cuando VTR > 1)

### Badges en EnhancedTaskCard:
- **Aprobado**: Badge verde
- **Reprobado**: Badge rojo
- **Pendiente**: Badge gris
- **VTR**: Badge con borde cuando VTR > 1

## 🔄 Flujo de Reprobación

### Cuando se marca un curso como reprobado:

1. **Estado visual**: El fondo cambia a rojizo inmediatamente
2. **VTR**: Se incrementa automáticamente
3. **Nueva instancia**: Se crea automáticamente en el siguiente semestre
4. **Persistencia**: Se guarda en localStorage
5. **UI**: Se actualiza automáticamente

### Ejemplo de flujo:
```
1. Usuario tiene MAT-021 en Semestre 1 (VTR: 1, estado: pendiente)
2. Usuario marca como reprobado
3. MAT-021 en Semestre 1 → estado: reprobado, fondo rojizo, VTR: 1
4. Se crea automáticamente MAT-021 en Semestre 2 (VTR: 2, estado: pendiente)
5. Footer del Semestre 2 muestra "VTR: 2"
```

## 🧪 Testing

### Para probar la funcionalidad:

1. **Usar el ejemplo**: Importa `ExampleIntegration` en tu app
2. **Añadir cursos**: Click en cursos del sidebar
3. **Cambiar estados**: Usa los botones "Aprobar"/"Reprobar"
4. **Verificar VTR**: Observa que se incrementa al reprobar
5. **Verificar fondo**: Cursos reprobados tienen fondo rojizo
6. **Verificar persistencia**: Recarga la página, datos se mantienen

### Comandos útiles:
```typescript
// Limpiar progreso para empezar de nuevo
localStorage.removeItem('trayectoria-sansana-progress')

// Ver datos en consola
console.log(JSON.parse(localStorage.getItem('trayectoria-sansana-progress')))
```

## 🔧 Personalización

### Cambiar colores de estado:
```typescript
// En task-card.tsx, modificar getCardBackgroundClass()
const getCardBackgroundClass = () => {
  if (userCourseData?.estado === 'reprobado') {
    return 'bg-red-100 dark:bg-red-900/30'  // ← Más intenso
  }
  return 'bg-white dark:bg-gray-800'
}
```

### Cambiar formato de VTR:
```typescript
// En task-card.tsx, modificar el span del VTR
<span className="text-xs font-mono text-red-600 dark:text-red-400">
  {userCourseData.vtr}x  {/* ← Solo número con "x" */}
</span>
```

## 📊 Compatibilidad

### Retrocompatibilidad:
- ✅ TaskCard funciona sin `userCourseData` (comportamiento normal)
- ✅ No rompe código existente
- ✅ Props opcionales, no requeridas

### Integración gradual:
1. **Fase 1**: Usar TaskCard normal con `userCourseData`
2. **Fase 2**: Migrar a EnhancedTaskCard donde necesites botones
3. **Fase 3**: Integración completa con hooks del sistema

## 🎉 Resultado Final

El sistema ahora cumple completamente con los requerimientos:

- ✅ **Fondo rojizo para reprobados**: Implementado con clases Tailwind sutiles
- ✅ **VTR en footer**: Mostrado como número cuando VTR > 1
- ✅ **Integración con sistema local**: Funciona con hooks existentes
- ✅ **Funcionalidad de reprobación**: Genera nueva tarjeta automáticamente
- ✅ **Persistencia**: Datos se guardan en localStorage
- ✅ **Retrocompatibilidad**: No rompe código existente

**¡El sistema está listo para usar en producción!**
