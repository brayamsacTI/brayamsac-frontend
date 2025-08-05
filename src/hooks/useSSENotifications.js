import { useEffect, useRef } from 'react';

export function useSSENotifications(onAsistenciaChange) {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Crear conexión SSE
    const eventSource = new EventSource(`http://localhost:3000/api/notifications/events?token=${token}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('📡 Conexión SSE establecida - Frontend');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Notificación recibida - Frontend:', data);

        if (data.type === 'asistencia_change' && typeof onAsistenciaChange === 'function') {
          onAsistenciaChange(data);
        }
      } catch (error) {
        console.error('Error procesando notificación SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Error en conexión SSE - Frontend:', error);
    };

    // Cleanup al desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        console.log('🔌 Conexión SSE cerrada - Frontend');
      }
    };
  }, [onAsistenciaChange]);

  return eventSourceRef.current;
}
