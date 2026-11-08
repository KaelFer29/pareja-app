import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useContext, type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

type FormKeyboardAvoidingProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function FormKeyboardAvoiding({ children, style }: FormKeyboardAvoidingProps) {
  const headerHeight = useContext(HeaderHeightContext) ?? 0;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
