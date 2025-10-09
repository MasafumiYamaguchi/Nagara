export default ({ config }) => ({
  ...config,
  name: 'Tsuuwa',
  slug: 'tsuuwa',
  extra: {
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.tsuuwa.com',
    agoraAppId: process.env.EXPO_PUBLIC_AGORA_APP_ID || '',
  },
});