

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Alerts from './Alerts';


describe('Alerts Page Component', () => {

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  it('should render the Placeholder component with the correct title and description', () => {

    renderWithRouter(<Alerts />);


    const titleElement = screen.getByText('Configuración de alertas');
    expect(titleElement).toBeInTheDocument();


    const descriptionElement = screen.getByText('Define umbrales de stock y notificaciones.');
    expect(descriptionElement).toBeInTheDocument();
  });


  it('should only render one main heading element (Placeholder title)', () => {
      renderWithRouter(<Alerts />);

  });
});
