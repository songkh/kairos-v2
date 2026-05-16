// Expo Go stub for @stripe/stripe-react-native
// stripe-react-native は Expo Go 非対応のため EAS Build でのみ使用可能
// このスタブは expo-go-preview ブランチでの開発確認用

const React = require('react');
const { View } = require('react-native');

const StripeProvider = function StripeProviderStub(props) {
  return React.createElement(View, null, props.children);
};

const useStripe = function() {
  return {
    initPaymentSheet: async function() { return { error: null }; },
    presentPaymentSheet: async function() { return { error: null }; },
    confirmPayment: async function() { return { error: null, paymentIntent: null }; },
  };
};

module.exports = {
  StripeProvider,
  useStripe,
  CardField: function CardFieldStub() { return React.createElement(View, null); },
};
module.exports.default = module.exports;
