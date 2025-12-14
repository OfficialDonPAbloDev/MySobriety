import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../../../src/shared/components/ui/Button';

describe('Button Component', () => {
  it('renders correctly with text', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button onPress={onPressMock}>Click me</Button>);

    fireEvent.press(getByText('Click me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock} disabled>
        Click me
      </Button>
    );

    fireEvent.press(getByText('Click me'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { queryByText, UNSAFE_getByType } = render(<Button loading>Click me</Button>);

    // Text should not be visible when loading
    expect(queryByText('Click me')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button onPress={onPressMock} loading testID="button">
        Click me
      </Button>
    );

    fireEvent.press(getByTestId('button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
