

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Index from './Index';

describe('Index Page Component', () => {



  const locationReplaceMock = vi.fn();

  beforeEach(() => {


    vi.stubGlobal('location', { replace: locationReplaceMock });


    locationReplaceMock.mockClear();
  });

  it('should redirect the user to the /login page on mount', () => {


    render(<Index />);



    expect(locationReplaceMock).toHaveBeenCalled();


    expect(locationReplaceMock).toHaveBeenCalledWith('/login');


    expect(locationReplaceMock).toHaveBeenCalledTimes(1);
  });

  it('should render nothing (null)', () => {

    const { container } = render(<Index />);


    expect(container.firstChild).toBeNull();
  });
});
