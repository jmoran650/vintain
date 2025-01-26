// vintainApp/app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, TextInput, FlatList, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchAllListings, searchListings } from '../../src/apiService';

// Optionally define a small interface for your listing
interface Listing {
  id: string;
  brand: string;
  name: string;
  description: string;
  imageUrls: string[];
}

export default function ListingListScreen() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const pageSize = 5;

  useEffect(() => {
    loadListings(page);
  }, [page]);

  async function loadListings(newPage: number) {
    try {
      let data;
      if (isSearching && searchTerm.trim().length > 0) {
        data = await searchListings(searchTerm, newPage, pageSize);
      } else {
        data = await fetchAllListings(newPage, pageSize);
      }
      setListings(data.listings);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Failed to load listings:', err);
    }
  }

  async function onSearch() {
    setIsSearching(true);
    setPage(1);
    try {
      const data = await searchListings(searchTerm, 1, pageSize);
      setListings(data.listings);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  function onClearSearch() {
    setSearchTerm('');
    setIsSearching(false);
    setPage(1);
  }

  function onNextPage() {
    if ((page * pageSize) < totalCount) {
      setPage(prev => prev + 1);
    }
  }

  function onPrevPage() {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }

  function renderItem({ item }: { item: Listing }) {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => router.push({
          pathname: '/listingDetail',
          params: { listingId: item.id },
        })}
      >
        <Text style={styles.listItemTitle}>
          {item.brand} - {item.name}
        </Text>
        <Text numberOfLines={2}>{item.description}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listing List</Text>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search brand/description..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Button title="Search" onPress={onSearch} />
        <Button title="Clear" onPress={onClearSearch} />
      </View>

      {/* Listing list */}
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Pagination controls */}
      <View style={styles.paginationRow}>
        <Button title="Prev" onPress={onPrevPage} disabled={page === 1} />
        <Text>Page {page}</Text>
        <Button title="Next" onPress={onNextPage} disabled={(page * pageSize) >= totalCount} />
      </View>

      <Text>Total: {totalCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 8 },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 4,
  },
  listItem: {
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
    padding: 12,
  },
  listItemTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
});