import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const layout = {
    window: {
        width,
        height,
    },
    isSmallDevice: width < 375,
    borderRadius: {
        sm: 8,
        md: 16,
        lg: 24,
        xl: 40,
        full: 9999,
    },
    padding: {
        screen: 24,
        component: 16,
    }
};
