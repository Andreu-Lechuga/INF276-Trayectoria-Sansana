# Sistema de Almacenamiento y Gestión de Datos - Trayectoria Sansana

## Descripción General

Este sistema implementa una solución completa de almacenamiento local y gestión de datos para el planificador de ramos universitarios. Permite a los usuarios gestionar su progreso académico sin necesidad de login, manteniendo los datos originales intactos.

## Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DEL SISTEMA                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ Datos Originales│    │ localStorage    │                │
│  │ (data_INF.ts)   │    │ (UserProgress)  │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           └───────────┬───────────┘                        │
│                       │                                    │
│              ┌─────────▼─────────┐                         │
│              │   Data Manager    │                         │
│              │ (Combina datos)   │                         │
│              └─────────┬─────────┘                         │
│                       │                                    │
│              ┌─────────▼─────────┐                         │
│              │ Componentes React │                         │
│              │   (Kanban UI)     │                         │
│              └───────────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Estructura de Archivos

```
lib/
├── storage-service.ts          # Gestión de localStorage
├── course-state-manager.ts     # Lógica de reprobaciones y copias
├── data-manager.ts            # Combinación de datos originales + usuario
└── validation.ts              # Validaciones (futuro)

hooks/
├── use-user-progress.ts       # Hook principal para progreso del usuario
├── use-course-operations.ts   # Hook para operaciones específicas de cursos
└── suse-local-torage.ts       # Hook para localStorage (futuro)

types/
└── user-progress.ts           # Tipos TypeScript para el sistema

components/
└── enhanced-task-card.tsx     # Componente mejorado con funcionalidades
```

## Funcionalidades Implementadas

### ✅ 1. Almacenamiento Local (Cache)

- **Ubicación**: localStorage del navegador
- **Clave**: `trayectoria-sansana-progress`
- **Persistencia**: Automática en cada cambio
- **Backup/Restore**: Funcionalidad completa de exportación/importación

### ✅ 2. Sistema de Reprobaciones con VTR

- **Reprobación**: Mantiene copia original + crea nueva instancia en siguiente semestre
- **VTR (Veces Tomado el Ramo)**: Incremento automático
- **Tracking**: Seguimiento completo de todas las instancias

### ✅ 3. Eliminación en Cascada

- **Detección**: Identifica automáticamente cursos con copias
- **Eliminación**: Remueve todas las instancias relacionadas
- **Seguridad**: Confirmación antes de eliminar múltiples instancias

### ✅ 4. Validación de Prerrequisitos

- **Verificación**: Automática antes de añadir cursos
- **Feedback**: Mensajes claros sobre prerrequisitos faltantes
- **Sugerencias**: Lista de cursos disponibles según prerrequisitos

## Estructura de Datos

### UserProgress (localStorage)

```typescript
{
  "carrera": "INF",
  "version": "1.0",
  "lastModified": "2025-01-26T20:43:00.000Z",
  "semestres": {
    "1": {
      "cursos": [
        {
          "cursoId": 1,
          "instanceId": "curso-1-vtr-1",
          "estado": "aprobado",
          "vtr": 1,
          "fechaAsignacion": "2025-01-26T20:43:00.000Z"
        }
      ]
    },
    "2": {
      "cursos": [
        {
          "cursoId": 1,
          "instanceId": "curso-1-vtr-2",
          "estado": "pendiente",
          "vtr": 2,
          "fechaAsignacion": "2025-01-26T20:43:00.000Z",
          "esCopiaPorReprobacion": true,
          "cursoOriginalInstanceId": "curso-1-vtr-1"
        }
      ]
    }
  },
  "reprobaciones": [
    {
      "cursoId": 1,
      "instanciasCreadas": ["curso-1-vtr-1", "curso-1-vtr-2"],
      "ultimoVtr": 2,
      "semestreOriginal": 1
    }
  ]
}
```

## Uso del Sistema

### 1. Inicialización

```typescript
import { useUserProgress } from '@/hooks/use-user-progress';
import { cursos } from '@/data/data_INF';

function MiComponente() {
  const {
    columns,
    sidebarTasks,
    addCourseToSemester,
    markCourseAsFailed,
    markCourseAsApproved,
    // ... otras funciones
  } = useUserProgress(cursos, 'INF');

  // El hook se encarga de toda la gestión automáticamente
}
```

### 2. Operaciones de Cursos

```typescript
import { useCourseOperations } from '@/hooks/use-course-operations';

function MiComponente() {
  const {
    addCourseToCurrentSemester,
    handleCourseStatusChange,
    handleCourseRemoval,
    canAddCourse,
    validatePrerequisites
  } = useCourseOperations();

  // Añadir curso
  const handleAddCourse = async (task, editingColumnId) => {
    const success = await addCourseToCurrentSemester(task, editingColumnId);
    if (success) {
      // Curso añadido exitosamente
    }
  };

  // Marcar como reprobado (crea copia automáticamente)
  const handleFailCourse = async (instanceId) => {
    const success = await handleCourseStatusChange(instanceId, 'reprobado');
    // Se crea automáticamente una copia en el siguiente semestre
  };
}
```

### 3. Componente Mejorado

```typescript
import EnhancedTaskCard from '@/components/enhanced-task-card';

function MiKanban() {
  return (
    <div>
      {tasks.map(task => (
        <EnhancedTaskCard
          key={task.instanceId}
          task={task}
          onUpdate={refreshData}
          showActions={true}
        />
      ))}
    </div>
  );
}
```

## Flujo de Datos

### 1. Carga Inicial

```
1. Cargar datos originales (data_INF.ts)
2. Cargar progreso del usuario (localStorage)
3. Combinar ambos en estado unificado
4. Renderizar kanban con datos combinados
```

### 2. Operación de Reprobación

```
1. Usuario marca curso como reprobado
2. Sistema actualiza estado del curso original
3. Sistema crea nueva instancia en siguiente semestre
4. Sistema actualiza registro de reprobaciones
5. Sistema guarda en localStorage
6. UI se actualiza automáticamente
```

### 3. Eliminación en Cascada

```
1. Usuario elimina un curso
2. Sistema busca registro de reprobaciones
3. Si existe: elimina TODAS las instancias relacionadas
4. Si no existe: elimina solo la instancia actual
5. Sistema actualiza localStorage
6. UI se actualiza automáticamente
```

## Ventajas del Sistema

### ✅ **Sin Backend**
- No requiere servidor
- No requiere login
- Funciona completamente offline

### ✅ **Datos Originales Intactos**
- Los archivos `data_INF.ts` nunca se modifican
- Fácil actualización de datos de la carrera
- Separación clara entre datos oficiales y progreso del usuario

### ✅ **Persistencia Robusta**
- Auto-guardado en cada cambio
- Validación de datos antes de guardar
- Sistema de backup/restore

### ✅ **Escalable**
- Fácil agregar nuevas carreras
- Arquitectura modular
- Tipos TypeScript bien definidos

### ✅ **Mantenible**
- Código bien estructurado
- Separación de responsabilidades
- Documentación completa

## Próximas Mejoras

### 🔄 **En Desarrollo**
- [ ] Validación avanzada de prerrequisitos
- [ ] Sugerencias inteligentes de cursos
- [ ] Estadísticas de progreso
- [ ] Exportación a PDF

### 🚀 **Futuras**
- [ ] Sincronización entre dispositivos
- [ ] Modo colaborativo
- [ ] Integración con sistemas universitarios
- [ ] Notificaciones de prerrequisitos

## Troubleshooting

### Problema: Los datos no se guardan
**Solución**: Verificar que localStorage esté habilitado en el navegador

### Problema: Errores de validación
**Solución**: Revisar la estructura de datos en localStorage y limpiar si es necesario

### Problema: Cursos duplicados
**Solución**: Usar las funciones del sistema en lugar de manipular datos directamente

## Contacto y Soporte

Para preguntas sobre el sistema:
1. Revisar esta documentación
2. Consultar los tipos TypeScript en `/types/user-progress.ts`
3. Revisar ejemplos de uso en los hooks
4. Consultar el código de los componentes de ejemplo
