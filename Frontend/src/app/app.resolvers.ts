import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';

export const initialDataResolver = () => {
    const navigationService = inject(NavigationService);

    // Return navigation data
    return navigationService.get();
};
