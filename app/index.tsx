import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';

import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const isWeb = Platform.OS === 'web';

let MapView: any = View;
let Marker: any = View;

const API_URL = "https://posto-confiavel-api.onrender.com"

const fallbackStations = [
  {
    id: '1',
    name: 'Posto Exemplo',
    brand: 'BR',
    distance: '0 m',
    rating: 5,
    status: 'Conectando API',
    gasoline: 'R$ 0,00',
    ethanol: 'R$ 0,00',
    diesel: 'R$ 0,00',
    reviews: 0,
    trust: 50,
    avgKmL: 0,
    latitude: -15.7942,
    longitude: -47.8822,
  },
];

function formatPrice(value?: number) {
  if (!value) return 'R$ 0,00';

  return `R$ ${value
    .toFixed(2)
    .replace('.', ',')}`;
}

function normalizeStation(station: any) {
  return {
    id:
      station.id ||
      Math.random().toString(),

    name: station.name || 'Posto',

    brand: station.brand || 'POSTO',

    distance: station.distanceKm
      ? `${station.distanceKm} km`
      : '---',

    rating: station.avgRating || 0,

    status:
      station.trustScore >= 80
        ? 'Muito confiável'
        : station.trustScore >= 50
        ? 'Regular'
        : 'Risco alto',

    gasoline: formatPrice(
      station.gasolinePrice
    ),

    ethanol: formatPrice(
      station.ethanolPrice
    ),

    diesel: formatPrice(
      station.dieselPrice
    ),

    reviews: station.reviewCount || 0,

    trust: station.trustScore || 50,

    avgKmL: station.avgKmL || 13.6,

    latitude: station.latitude,

    longitude: station.longitude,
  };
}

export default function App() {
  const [screen, setScreen] =
    useState('map');

  const [stations, setStations] =
    useState(fallbackStations);

  const [selected, setSelected] =
    useState(fallbackStations[0]);

  const [location, setLocation] =
    useState<any>(null);

  useEffect(() => {
    loadLocation();
  }, []);

  async function loadLocation() {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log(
          'Permissão negada'
        );

        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync(
          {}
        );

      setLocation(currentLocation);

      const response = await fetch(
        `${API_URL}/stations?lat=${currentLocation.coords.latitude}&lng=${currentLocation.coords.longitude}`
      );

      const data =
        await response.json();

      console.log('API:', data);

      if (
        Array.isArray(data) &&
        data.length > 0
      ) {
        const mapped =
          data.map(normalizeStation);

        setStations(mapped);
        setSelected(mapped[0]);
      }
    } catch (err) {
      console.log('Erro API:', err);
    }
  }

  function openDetails(station: any) {
    setSelected(station);
    setScreen('details');
  }

  return (
    <SafeAreaView style={styles.safe}>
      {screen === 'map' && (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.title}>
            Posto Confiável
          </Text>

          <Text style={styles.subtitle}>
            Postos próximos e avaliação
            de confiança
          </Text>

          {location && (
            <Text
              style={styles.subtitle}
            >
              📍{' '}
              {location.coords.latitude.toFixed(
                4
              )}{' '}
              |{' '}
              {location.coords.longitude.toFixed(
                4
              )}
            </Text>
          )}

          {location &&
            Platform.OS !== 'web' && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude:
                    location.coords
                      .latitude,

                  longitude:
                    location.coords
                      .longitude,

                  latitudeDelta: 0.03,

                  longitudeDelta: 0.03,
                }}
                showsUserLocation={
                  true
                }
              >
                {stations.map(
                  (
                    station: any
                  ) => {
                    const markerColor =
                      station.trust >=
                      80
                        ? 'green'
                        : station.trust >=
                          50
                        ? 'yellow'
                        : 'red';

                    return (
                      <Marker
                        key={
                          station.id
                        }
                        coordinate={{
                          latitude:
                            station.latitude ||
                            location
                              .coords
                              .latitude,

                          longitude:
                            station.longitude ||
                            location
                              .coords
                              .longitude,
                        }}
                        title={
                          station.name
                        }
                        description={`${station.status} • ${station.gasoline}`}
                        pinColor={
                          markerColor
                        }
                        onPress={() =>
                          openDetails(
                            station
                          )
                        }
                      />
                    );
                  }
                )}
              </MapView>
            )}

          {Platform.OS === 'web' && (
            <View style={styles.map}>
              <Text
                style={styles.mapText}
              >
                🗺️ Mapa disponível
                apenas no celular
              </Text>
            </View>
          )}

          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onPress={() =>
                openDetails(station)
              }
            />
          ))}
        </ScrollView>
      )}

      {screen === 'list' && (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.title}>
            Postos próximos
          </Text>

          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onPress={() =>
                openDetails(station)
              }
            />
          ))}
        </ScrollView>
      )}

      {screen === 'details' && (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.title}>
            {selected.name}
          </Text>

          <Text style={styles.subtitle}>
            {selected.distance} ·{' '}
            {selected.status}
          </Text>

          <View style={styles.card}>
            <Text
              style={styles.bigBrand}
            >
              {selected.brand}
            </Text>

            <Text
              style={styles.rating}
            >
              ★ {selected.rating}
            </Text>

            <Text>
              {selected.reviews}{' '}
              avaliações
            </Text>
          </View>

          <View style={styles.row}>
            <Price
              label="Gasolina"
              value={
                selected.gasoline
              }
            />

            <Price
              label="Etanol"
              value={
                selected.ethanol
              }
            />

            <Price
              label="Diesel"
              value={
                selected.diesel
              }
            />
          </View>

          <View style={styles.card}>
            <Text
              style={styles.section}
            >
              Índice de Confiança
            </Text>

            <Text
              style={styles.trust}
            >
              {selected.trust}/100
            </Text>

            <Text>
              ✅ Avaliações positivas
            </Text>

            <Text>
              ✅ Consumo real
              compatível
            </Text>

            <Text>
              ✅ Sem denúncias
              recentes
            </Text>
          </View>

          <View style={styles.card}>
            <Text
              style={styles.section}
            >
              Quilometragem dos
              usuários
            </Text>

            <Text style={styles.kml}>
              {selected.avgKmL} km/L
            </Text>
          </View>
        </ScrollView>
      )}

      {screen === 'history' && (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.title}>
            Histórico
          </Text>

          <View style={styles.card}>
            <Text style={styles.kml}>
              13,2 km/L
            </Text>

            <Text>
              Média geral do veículo
            </Text>
          </View>
        </ScrollView>
      )}

      {screen === 'profile' && (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.title}>
            Perfil
          </Text>

          <View style={styles.card}>
            <Text
              style={styles.bigBrand}
            >
              Hugo
            </Text>

            <Text>
              56 abastecimentos
            </Text>

            <Text>
              12 postos avaliados
            </Text>
          </View>
        </ScrollView>
      )}

      <View style={styles.nav}>
        <NavButton
          label="Mapa"
          onPress={() =>
            setScreen('map')
          }
        />

        <NavButton
          label="Lista"
          onPress={() =>
            setScreen('list')
          }
        />

        <TouchableOpacity
          style={styles.plus}
        >
          <Text
            style={styles.plusText}
          >
            +
          </Text>
        </TouchableOpacity>

        <NavButton
          label="Histórico"
          onPress={() =>
            setScreen('history')
          }
        />

        <NavButton
          label="Perfil"
          onPress={() =>
            setScreen('profile')
          }
        />
      </View>
    </SafeAreaView>
  );
}

function StationCard({
  station,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <Text style={styles.stationName}>
        {station.brand} ·{' '}
        {station.name}
      </Text>

      <Text style={styles.rating}>
        ★ {station.rating} ·{' '}
        {station.status}
      </Text>

      <Text>{station.distance}</Text>

      <View style={styles.row}>
        <Price
          label="Gasolina"
          value={station.gasoline}
        />

        <Price
          label="Etanol"
          value={station.ethanol}
        />
      </View>

      <Text>
        {station.reviews} avaliações
      </Text>
    </TouchableOpacity>
  );
}

function Price({
  label,
  value,
}: any) {
  return (
    <View style={styles.price}>
      <Text style={styles.muted}>
        {label}
      </Text>

      <Text
        style={styles.priceValue}
      >
        {value}
      </Text>
    </View>
  );
}

function NavButton({
  label,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <Text style={styles.navText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },

  content: {
    padding: 18,
    paddingBottom: 110,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },

  map: {
    height: 260,
    backgroundColor: '#e5e7eb',
    borderRadius: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapText: {
    color: '#6b7280',
    fontWeight: '800',
    fontSize: 16,
  },

  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  stationName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },

  rating: {
    color: '#0f8f3d',
    fontWeight: '900',
    marginVertical: 6,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  price: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  muted: {
    color: '#6b7280',
    fontSize: 12,
  },

  priceValue: {
    fontWeight: '900',
    fontSize: 15,
    marginTop: 4,
  },

  section: {
    fontWeight: '900',
    fontSize: 17,
    marginBottom: 8,
  },

  trust: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f8f3d',
    marginBottom: 8,
  },

  kml: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
  },

  bigBrand: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },

  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 78,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  navText: {
    color: '#0f8f3d',
    fontWeight: '800',
  },

  plus: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0f8f3d',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },

  plusText: {
    color: 'white',
    fontSize: 34,
    fontWeight: '900',
  },
});