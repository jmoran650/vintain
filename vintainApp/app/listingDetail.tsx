import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { fetchListingById } from '../src/apiService';

export default function ListingDetail() {
  const { listingId } = useLocalSearchParams();
  const [listing, setListing] = useState<any>(null);

  useEffect(() => {
    if (listingId) {
      loadListing(listingId as string);
    }
  }, [listingId]);

  async function loadListing(id: string) {
    try {
      const data = await fetchListingById(id);
      setListing(data);
    } catch (err) {
      console.error('Failed to fetch listing detail:', err);
    }
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading listing details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{listing.brand} - {listing.name}</Text>
        <Text style={styles.subtitle}>Listing ID: {listing.id}</Text>
        <Text style={styles.description}>{listing.description}</Text>
        {listing.imageUrls?.map((url: string, idx: number) => (
          <Image key={idx} source={{ uri: url }} style={styles.image} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
  },
  scrollContent: {
    padding: 16,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 8,
    color: '#3e2723',
    fontFamily: 'SpaceMono',
  },
  subtitle: { 
    fontSize: 14, 
    marginBottom: 8, 
    color: '#5d4037',
    fontFamily: 'SpaceMono',
  },
  description: { 
    fontSize: 16, 
    marginBottom: 12,
    color: '#3e2723',
    fontFamily: 'SpaceMono',
  },
  image: { 
    width: '100%', 
    height: 200, 
    resizeMode: 'cover', 
    marginBottom: 12,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#3e2723',
    fontFamily: 'SpaceMono',
  },
});