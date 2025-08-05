# Solución a Problemas de Sesión - Frontend

## Problemas Identificados

1. **Cierre de sesión y reingreso**: Problemas al cerrar sesión y volver a iniciar sesión, posiblemente debido a que no se limpia correctamente el localStorage.

2. **Cierre automático de sesión al navegar**: La sesión ahora se mantiene persistente al cerrar la pestaña o el navegador (comportamiento actualizado).

3. **Validación de tokens**: Posibles problemas con la validación de tokens y su expiración.

4. **Conexión con Render**: Asegurar que la aplicación mantenga la conexión correcta con el backend en Render.

## Soluciones Implementadas

### 1. Utilidades de Sesión

Se ha creado un archivo de utilidades para centralizar la gestión de sesiones:

- **Archivo**: `src/utils/sessionUtils.js`
- **Funcionalidades**:
  - `verificarSesionActiva()`: Verifica si hay una sesión activa (token, nombre y rol).
  - `calcularTiempoRestanteToken()`: Calcula el tiempo restante de un token JWT.
  - `limpiarSesion()`: Limpia todos los datos de sesión del localStorage.
  - `logEstadoSesion()`: Registra el estado actual de la sesión en la consola.
  - `validarTokenConBackend()`: Realiza una validación del token con el backend.

### 2. Script de Diagnóstico

Se ha creado un script para diagnosticar problemas de sesión:

- **Archivo**: `diagnostico-sesion.js`
- **Funcionalidades**:
  - Verificación del contenido del localStorage.
  - Análisis del token JWT (incluyendo expiración).
  - Verificación de la información de usuario.
  - Sugerencias de solución.
  - Función para validar el token manualmente.

### 3. Configuración de API Mejorada

Se ha actualizado la configuración de API para:

- **Conexión con Render**: URL por defecto apunta a `https://brayamsac-backend.onrender.com`
- **Función buildApiUrl**: Para construir URLs de API de manera consistente
- **Endpoints adicionales**: Rotaciones, Dashboard, Usuario-Almacenes, etc.

### 4. Mejoras en Hooks Existentes

Los hooks existentes han sido actualizados:

- **useAutoLogout.js**: Ahora maneja sesión persistente con logout manual
- **useTokenExpiration.js**: Verifica la expiración del token cada 30 segundos
- **useUsuario.js**: Valida el token con el backend usando buildApiUrl

## Cómo Utilizar las Herramientas

### Diagnóstico de Problemas de Sesión

1. Abra la consola del navegador (F12 o Ctrl+Shift+I).
2. Copie y pegue el contenido del archivo `diagnostico-sesion.js`.
3. Ejecute el script y revise la información mostrada.
4. Para validar manualmente el token, ejecute la función `validarToken()`.

### Utilización de las Utilidades de Sesión

#### En componentes de Dashboard

```javascript
import { logEstadoSesion, verificarSesionActiva } from "../utils/sessionUtils.js";
import { buildApiUrl } from '../config/api';

export default function Dashboard() {
  // ...
  
  useEffect(() => {
    // Registrar el estado de la sesión al cargar el componente
    logEstadoSesion();
    
    const validarToken = async () => {
      // Verificar si hay una sesión activa
      if (!verificarSesionActiva()) {
        console.warn("Sesión no activa. Redirigiendo al login.");
        navigate("/");
        return;
      }
      
      // Resto de la validación...
    };
    
    validarToken();
  }, [navigate]);
  
  // Resto del componente...
}
```

#### En componentes de Login

```javascript
import { limpiarSesion } from "../utils/sessionUtils.js";

export default function LoginSistema() {
  // ...
  
  // Limpiar cualquier sesión anterior al montar el componente
  useEffect(() => {
    limpiarSesion();
  }, []);
  
  const handleSubmit = async (e) => {
    // ...
    
    if (loginExitoso) {
      // Limpiar cualquier sesión anterior antes de establecer la nueva
      limpiarSesion();
      
      // Establecer nueva sesión
      tokenManager.set(data.token);
      localStorage.setItem("nombre", nombre);
      localStorage.setItem("rol", rol);
    }
  };
  
  // Resto del componente...
}
```

#### En hooks de autenticación

```javascript
import { limpiarSesion, verificarSesionActiva } from '../utils/sessionUtils';
import { buildApiUrl } from '../config/api';

export const useAutoLogout = () => {
  // Función para logout manual que pueden usar los componentes
  const manualLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(buildApiUrl("/api/auth/logout"), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        console.error("Error en logout manual:", error);
      } finally {
        limpiarSesion();
        window.location.href = "/";
      }
    }
  };

  return { manualLogout };
};
```

## Configuración de Entorno

### Variables de Entorno (.env)

```env
# Configuración para producción (usando backend en Render)
VITE_API_URL=https://brayamsac-backend.onrender.com

# Para desarrollo local, descomenta la siguiente línea:
# VITE_API_URL=http://localhost:3000
```

### Configuración de API (src/config/api.js)

```javascript
// Configuración centralizada de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://brayamsac-backend.onrender.com';

export function buildApiUrl(endpoint) {
  // Si el endpoint ya contiene la URL base, no la duplica
  if (endpoint.startsWith('http')) return endpoint;
  
  // Siempre usar la URL completa del backend para evitar errores de CORS
  return `${API_BASE_URL}${endpoint}`;
}
```

## Recomendaciones Adicionales

1. **Limpieza de localStorage**: Asegúrese de limpiar correctamente el localStorage al cerrar sesión utilizando `limpiarSesion()`.

2. **Validación de tokens**: Utilice `validarTokenConBackend()` para validar el token con el backend cuando sea necesario.

3. **Monitoreo de sesión**: Utilice `logEstadoSesion()` para monitorear el estado de la sesión durante el desarrollo.

4. **Manejo de errores**: Implemente un manejo adecuado de errores en las llamadas a la API de autenticación.

5. **Conexión con Render**: Siempre use `buildApiUrl()` para construir URLs de API y mantener la conexión correcta.

## Archivos Creados/Modificados

- ✅ `Frontend/diagnostico-sesion.js` (nuevo)
- ✅ `Frontend/src/utils/sessionUtils.js` (nuevo)
- ✅ `Frontend/SOLUCION_PROBLEMAS_SESION.md` (nuevo)
- ✅ `Frontend/src/config/api.js` (modificado - agregado buildApiUrl y URL de Render)
- ✅ `Frontend/.env` (modificado - URL de Render por defecto)
- ✅ `Frontend/src/pages/Dashboard.jsx` (modificado - imports actualizados)
- ✅ `Frontend/src/pages/ModernDashboard.jsx` (modificado - imports actualizados)
- ✅ `Frontend/src/hooks/useAutoLogout.js` (ya tenía sesión persistente y logout manual)

## Próximos Pasos

1. Integrar las utilidades de sesión en los componentes principales restantes.
2. Realizar pruebas exhaustivas de inicio y cierre de sesión.
3. Monitorear el comportamiento de la sesión en diferentes escenarios.
4. Verificar que la conexión con Render funcione correctamente en producción.
5. Probar el script de diagnóstico en caso de problemas de sesión.

## Solución de Problemas Comunes

### Error de Conexión con Render
- Verificar que `VITE_API_URL` esté configurado correctamente
- Usar `buildApiUrl()` en todas las llamadas a la API
- Revisar la consola del navegador para errores de CORS

### Sesión No Persistente
- Verificar que `useAutoLogout` no esté haciendo logout automático
- Confirmar que el token se almacena correctamente en localStorage
- Usar `logEstadoSesion()` para diagnosticar el problema

### Token Expirado
- Usar `calcularTiempoRestanteToken()` para verificar el tiempo restante
- Implementar refresh de token si es necesario
- Redirigir al login cuando el token expire

### Problemas de Navegación
- Asegurar que `verificarSesionActiva()` se ejecute en cada página
- Limpiar la sesión correctamente al hacer logout
- Verificar que las rutas protegidas funcionen correctamente