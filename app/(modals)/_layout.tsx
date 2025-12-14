import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#4F46E5',
      }}
    >
      <Stack.Screen
        name="set-sobriety-date"
        options={{
          title: 'Set Sobriety Date',
        }}
      />
    </Stack>
  );
}
