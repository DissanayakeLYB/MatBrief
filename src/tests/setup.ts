/**
 * Jest Test Setup File
 * 
 * This file runs BEFORE each test file. Use it to:
 * - Configure testing utilities
 * - Set up global mocks
 * - Silence expected warnings
 * 
 * Why do we need this?
 * React Native has many native modules (camera, GPS, etc.) that don't exist
 * in the Jest environment (which runs in Node.js, not on a phone).
 * We mock these to prevent errors during testing.
 * 
 * Note: jest.mock() factories can't reference external variables,
 * so we use require() inside the factory to get React.
 */

/**
 * Mock react-native-safe-area-context
 * 
 * SafeAreaProvider requires native code to detect device insets.
 * In tests, we mock it to return default values (all zeros).
 */
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  const mockReact = require('react');
  const { View } = require('react-native');
  
  return {
    SafeAreaProvider: ({ children }: { children: unknown }) => children,
    SafeAreaView: ({ children }: { children: unknown }) => 
      mockReact.createElement(View, { testID: 'safe-area-view' }, children),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets: inset, frame },
  };
});

/**
 * Mock @react-navigation/native-stack
 * 
 * The native stack navigator uses native screen transitions.
 * We create a mock that:
 * - Navigator: Renders all Screen children
 * - Screen: Renders the component prop if provided
 */
jest.mock('@react-navigation/native-stack', () => {
  const mockReact = require('react');
  
  return {
    createNativeStackNavigator: () => ({
      // Navigator renders all its Screen children
      Navigator: ({ children }: { children: unknown }) => {
        return mockReact.createElement(mockReact.Fragment, null, children);
      },
      // Screen renders the component passed to it
      Screen: ({ component: Component }: { component: React.ComponentType }) => {
        return mockReact.createElement(Component);
      },
    }),
  };
});

/**
 * Mock @react-navigation/native
 * 
 * Navigation requires native linking setup. We mock the NavigationContainer
 * to just render its children without the native navigation context.
 */
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }: { children: unknown }) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
      name: 'MockRoute',
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

/**
 * Mock react-native-screens
 * 
 * This package provides native screen components. We mock it for tests.
 */
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  enableFreeze: jest.fn(),
  screensEnabled: () => true,
}));

/**
 * Silence specific warnings that we expect during testing.
 * 
 * Why: Some libraries log warnings that aren't relevant in test environment.
 * We filter these to keep test output clean and focused on actual issues.
 */
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render is no longer supported') ||
        message.includes('Warning: An update to') ||
        message.includes('inside a test was not wrapped in act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      message.includes('Require cycle:')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
