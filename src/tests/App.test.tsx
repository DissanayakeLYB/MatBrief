/**
 * App Component Test
 * 
 * This is a "smoke test" — it verifies the app renders without crashing.
 * It's the most basic test you can write, but it catches many issues:
 * - Import errors
 * - Syntax errors
 * - Missing dependencies
 * - Component initialization failures
 * 
 * Testing Philosophy:
 * - Test BEHAVIOR, not implementation details
 * - Write tests that give confidence the app works for users
 * - Avoid testing internal state or private methods
 */

import { render, screen } from '@testing-library/react-native';
import App from '../../App';

/**
 * describe() groups related tests together.
 * This helps organize test output and makes it clear what's being tested.
 */
describe('App', () => {
  /**
   * it() (or test()) defines a single test case.
   * The string describes WHAT behavior we're verifying.
   * Good test names read like sentences: "it renders without crashing"
   */
  it('renders without crashing', () => {
    // render() mounts the component in a virtual DOM
    // This is where crashes would happen if something is broken
    const { toJSON } = render(<App />);

    // If we get here without throwing, the test passes
    // toJSON() gives us a snapshot of the rendered tree
    expect(toJSON()).not.toBeNull();
  });

  /**
   * This test verifies the app displays expected content.
   * 
   * Why test for text?
   * - It's what users actually see
   * - It catches accidental deletions or typos
   * - It's stable (unlike testing for specific styling)
   */
  it('displays the app title', () => {
    render(<App />);

    // getByText throws if the text isn't found, making the test fail
    // This is more reliable than checking if a specific component exists
    const title = screen.getByText('MatBrief');
    expect(title).toBeTruthy();
  });

  /**
   * Test the subtitle text is displayed.
   * Having multiple assertions in separate tests helps identify
   * exactly what broke when something fails.
   */
  it('displays the welcome message', () => {
    render(<App />);

    const subtitle = screen.getByText('Your app is ready to build!');
    expect(subtitle).toBeTruthy();
  });
});
