import { Linking, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Station = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type Props = {
  stations: Station[];
};

export default function Map({ stations }: Props) {

 function openMaps(
  latitude: number,
  longitude: number
) {
  const url =
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  Linking.openURL(url);
}

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -15.7942,
          longitude: -47.8822,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.name}
            onCalloutPress={() =>
              openMaps(
                station.latitude,
                station.longitude
              )
            }
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: '100%',
    height: '100%',
  },
});