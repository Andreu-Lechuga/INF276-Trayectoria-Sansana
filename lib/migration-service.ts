// Servicio de migración para datos existentes
// Migra datos de la clave antigua a las nuevas claves específicas por carrera

import { storageService } from './storage-service';
import { getAllCarreras } from '@/data/carreras';

export class MigrationService {
  private migrationKey = 'trayectoria-sansana-migration-v1';

  /**
   * Verifica si ya se ejecutó la migración
   */
  private hasMigrationRun(): boolean {
    if (typeof window === 'undefined') return true;
    
    try {
      const migrationFlag = localStorage.getItem(this.migrationKey);
      return migrationFlag === 'completed';
    } catch (error) {
      console.error('Error verificando migración:', error);
      return false;
    }
  }

  /**
   * Marca la migración como completada
   */
  private markMigrationCompleted(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.migrationKey, 'completed');
      console.log('Migración marcada como completada');
    } catch (error) {
      console.error('Error marcando migración:', error);
    }
  }

  /**
   * Ejecuta la migración automática de datos existentes
   */
  runMigration(): boolean {
    try {
      // Verificar si ya se ejecutó la migración
      if (this.hasMigrationRun()) {
        console.log('Migración ya ejecutada previamente');
        return true;
      }

      console.log('Iniciando migración de datos...');

      // Ejecutar migración de datos existentes
      const migrationSuccess = storageService.migrateExistingData();

      if (migrationSuccess) {
        this.markMigrationCompleted();
        console.log('Migración completada exitosamente');
        return true;
      } else {
        console.warn('Migración no necesaria o falló');
        // Marcar como completada de todas formas para evitar intentos repetidos
        this.markMigrationCompleted();
        return false;
      }
    } catch (error) {
      console.error('Error durante la migración:', error);
      return false;
    }
  }

  /**
   * Fuerza la re-ejecución de la migración (para debugging)
   */
  forceMigration(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      // Eliminar flag de migración
      localStorage.removeItem(this.migrationKey);
      
      // Ejecutar migración
      return this.runMigration();
    } catch (error) {
      console.error('Error forzando migración:', error);
      return false;
    }
  }

  /**
   * Obtiene información sobre el estado de la migración
   */
  getMigrationInfo(): {
    hasRun: boolean;
    hasOldData: boolean;
    newDataExists: boolean;
    carreras: Array<{
      link: string;
      hasOldFormat: boolean;
      hasNewFormat: boolean;
    }>;
  } {
    if (typeof window === 'undefined') {
      return {
        hasRun: false,
        hasOldData: false,
        newDataExists: false,
        carreras: []
      };
    }

    const hasRun = this.hasMigrationRun();
    const oldKey = 'trayectoria-sansana-progress';
    const hasOldData = localStorage.getItem(oldKey) !== null;

    const carreras = getAllCarreras().map(carrera => {
      const newKey = `trayectoria-sansana-progress-${carrera.link}`;
      return {
        link: carrera.link,
        hasOldFormat: hasOldData,
        hasNewFormat: localStorage.getItem(newKey) !== null
      };
    });

    const newDataExists = carreras.some(c => c.hasNewFormat);

    return {
      hasRun,
      hasOldData,
      newDataExists,
      carreras
    };
  }

  /**
   * Limpia datos de migración (para testing)
   */
  cleanMigrationData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.migrationKey);
      console.log('Datos de migración limpiados');
    } catch (error) {
      console.error('Error limpiando datos de migración:', error);
    }
  }
}

// Instancia singleton del servicio de migración
export const migrationService = new MigrationService();

/**
 * Función de utilidad para ejecutar migración al inicializar la aplicación
 */
export function initializeMigration(): void {
  if (typeof window !== 'undefined') {
    // Ejecutar migración después de que se cargue la página
    setTimeout(() => {
      migrationService.runMigration();
    }, 100);
  }
}
