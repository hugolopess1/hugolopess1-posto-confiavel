import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const API_URL =
  'https://posto-confiavel-api.onrender.com';

export default function App() {
  const [stations, setStations] =
    useState<any[]>([]);

  useEffect(() => {
    loadStations();
  }, []);

  async function loadStations() {
    try {
      const response = await fetch(
        `${API_URL}/stations`
      );

      const data = await response.json();

      console.log(data);

      setStations(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.title}>
          Posto Confiável
        </Text>

        {stations.map((station) => (
          <View
            key={station.id}
            style={styles.card}
          >
            <Text style={styles.name}>
              {station.name}
            </Text>

            <Text>
              Bandeira:{' '}
              {station.brand}
            </Text>

            <Text>
              Gasolina:{' '}
              {station.gasolinePrice}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 20,
  },

  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});