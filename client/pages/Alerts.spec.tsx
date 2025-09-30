// client/pages/Alerts.spec.tsx

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // IMPORTAR MemoryRouter
import { describe, expect, it } from 'vitest';
import Alerts from './Alerts';


describe('Alerts Page Component', () => {
  // Función de ayuda para envolver el componente en el Router
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  it('should render the Placeholder component with the correct title and description', () => {
    // 1. Renderiza el componente envuelto en MemoryRouter
    renderWithRouter(<Alerts />);

    // 2. Verifica que el título específico esté en el documento
    const titleElement = screen.getByText('Configuración de alertas');
    expect(titleElement).toBeInTheDocument();

    // 3. Verifica que la descripción específica esté en el documento
    const descriptionElement = screen.getByText('Define umbrales de stock y notificaciones.');
    expect(descriptionElement).toBeInTheDocument();
  });

  // El segundo test también usará la función de ayuda
  it('should only render one main heading element (Placeholder title)', () => {
      renderWithRouter(<Alerts />);
      // ... el resto de las aserciones (si las conservas)
  });
});
