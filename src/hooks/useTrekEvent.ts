
import { useTrekEventDetails } from './trek/useTrekEventDetails';
import { useTrekRegistration } from './trek/useTrekRegistration';
import { useTreksList } from './trek/useTreksList';

// Main hook that brings together all trek functionality
export function useTrekEvent(trekId: string | undefined) {
  const { trekEvent, loading, setTrekEvent } = useTrekEventDetails(trekId);
  const registration = useTrekRegistration(trekId);
  
  return {
    trekEvent,
    loading,
    setTrekEvent,
    ...registration
  };
}

// Export the individual hooks
export { useTreksList, useTrekEventDetails };

// Function for fetching treks with pagination
export function useTreks() {
  return useTreksList();
}
