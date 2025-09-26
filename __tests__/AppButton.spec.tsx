import { AppButton } from '@/components/ui/Button';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

describe('AppButton', () => {
    it('renders correctly with variant prop', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <AppButton variant="subtle" onPress={onPress}>Finish Job</AppButton>
        );

        expect(getByText('Finish Job')).toBeTruthy();
    });

    it('press works with variant and no navigation context', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <AppButton variant="subtle" onPress={onPress}>Finish Job</AppButton>
        );

        fireEvent.press(getByText('Finish Job'));
        expect(onPress).toHaveBeenCalled();
    });

    it('works with all variant types', () => {
        const onPress = jest.fn();
        const variants = ['primary', 'subtle', 'ghost', 'danger'] as const;

        variants.forEach(variant => {
            const { getByText } = render(
                <AppButton variant={variant} onPress={onPress}>Test {variant}</AppButton>
            );

            fireEvent.press(getByText(`Test ${variant}`));
            expect(onPress).toHaveBeenCalled();
        });
    });

    it('works without variant prop (default primary)', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <AppButton onPress={onPress}>Default Button</AppButton>
        );

        fireEvent.press(getByText('Default Button'));
        expect(onPress).toHaveBeenCalled();
    });

    it('handles dynamic variant changes without crashing', () => {
        const onPress = jest.fn();
        const { getByText, rerender } = render(
            <AppButton variant="subtle" onPress={onPress}>Dynamic Button</AppButton>
        );

        // Change variant dynamically
        rerender(
            <AppButton variant="primary" onPress={onPress}>Dynamic Button</AppButton>
        );

        fireEvent.press(getByText('Dynamic Button'));
        expect(onPress).toHaveBeenCalled();
    });

    it('handles navigation context errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        const onPress = jest.fn(() => {
            throw new Error('Couldn\'t find a navigation context. Have you wrapped your app with \'NavigationContainer\'?');
        });

        const { getByText } = render(
            <AppButton variant="primary" onPress={onPress}>Error Button</AppButton>
        );

        fireEvent.press(getByText('Error Button'));

        expect(consoleSpy).toHaveBeenCalledWith(
            'Navigation context error in AppButton:',
            'Couldn\'t find a navigation context. Have you wrapped your app with \'NavigationContainer\'?'
        );

        consoleSpy.mockRestore();
    });
});
