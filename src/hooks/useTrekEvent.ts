
import { useTrekEventDetails } from './trek/useTrekEventDetails';
import { useTrekRegistration } from './trek/useTrekRegistration';
import { useTreksList } from './trek/useTreksList';

// Main hook that brings together all trek functionality
export function useTrekEvent(trekId: string | undefined) {
  const registration = useTrekRegistration(trekId);
  
  return {
    ...registration
  };
}

// Export the individual hooks
export { useTreksList };

// Future enhancement: Add a hook for fetching treks with pagination
export function useTreks() {
  return useTreksList();
}
