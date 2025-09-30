// client/pages/Index.spec.tsx

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Index from './Index';

describe('Index Page Component', () => {
  // 1. Configurar el Mock (Simulación)
  // Antes de cada prueba, simulamos la función window.location.replace.
  // Esto evita que la prueba intente realmente cambiar la URL del entorno de prueba.
  const locationReplaceMock = vi.fn();

  beforeEach(() => {
    // Sobrescribe window.location.replace con nuestra función mock
    // y la restauramos después de cada prueba.
    vi.stubGlobal('location', { replace: locationReplaceMock });

    // Limpiamos el mock para que los contadores de llamadas sean precisos en cada prueba
    locationReplaceMock.mockClear();
  });

  it('should redirect the user to the /login page on mount', () => {
    // 2. Renderizar
    // Renderizamos el componente. Esto dispara el useEffect.
    render(<Index />);

    // 3. Verificar
    // Verificamos que window.location.replace haya sido llamada.
    expect(locationReplaceMock).toHaveBeenCalled();

    // Verificamos que haya sido llamada exactamente con la ruta de destino.
    expect(locationReplaceMock).toHaveBeenCalledWith('/login');

    // Verificamos que no haya sido llamada más de una vez.
    expect(locationReplaceMock).toHaveBeenCalledTimes(1);
  });

  it('should render nothing (null)', () => {
    // 2. Renderizar y verificar el resultado
    const { container } = render(<Index />);

    // El componente retorna null, por lo que el contenedor no debería tener hijos.
    expect(container.firstChild).toBeNull();
  });
});
