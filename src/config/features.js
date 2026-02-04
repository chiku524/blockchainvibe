/**
 * Feature flags. Enable subscription when you have an active userbase
 * by setting REACT_APP_SUBSCRIPTION_ENABLED=true in your build env.
 */
export const subscriptionEnabled = process.env.REACT_APP_SUBSCRIPTION_ENABLED === 'true';
