// This file runs before Jest loads any modules
// It sets up globals that Expo SDK 54 expects

// Define the global registry that Expo's winter runtime expects
global.__ExpoImportMetaRegistry = {};

// Prevent Expo from trying to install globals
global.__EXPO_WINTER_INSTALLED__ = true;

// Mock structuredClone if it doesn't exist
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
