// Expo Go stub for @rnmapbox/maps
// @rnmapbox/maps は Expo Go 非対応のため EAS Build でのみ使用可能
// このスタブは expo-go-preview ブランチでの開発確認用

const React = require('react');
const { View, Text, StyleSheet } = require('react-native');

const MapboxGL = {
  MapView: function MapViewStub(props) {
    return React.createElement(
      View,
      { style: [{ flex: 1, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' }, props.style] },
      React.createElement(Text, { style: { color: '#9CA3AF', fontSize: 12 } }, 'Mapbox（EAS Build 必須）')
    );
  },
  Camera: function CameraStub() { return null; },
  ShapeSource: function ShapeSourceStub() { return null; },
  LineLayer: function LineLayerStub() { return null; },
  PointAnnotation: function PointAnnotationStub() { return null; },
  setAccessToken: function() {},
  requestAndroidLocationPermissions: async function() { return true; },
  offlineManager: { createPack: async function() {} },
  UserLocation: function UserLocationStub() { return null; },
  LocationPuck: function LocationPuckStub() { return null; },
};

module.exports = MapboxGL;
module.exports.default = MapboxGL;
