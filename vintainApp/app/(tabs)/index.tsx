// vintainApp/app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  Button,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchAllListings, searchListings } from '../../src/apiService';

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
        <Text numberOfLines={2} style={styles.listItemDescription}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Vintage Listings</Text>

      <SafeAreaView style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search brand/description..."
          placeholderTextColor="#8d6e63"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Button title="Search" onPress={onSearch} color="#8d6e63" />
        <Button title="Clear" onPress={onClearSearch} color="#a1887f" />
      </SafeAreaView>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <SafeAreaView style={styles.paginationRow}>
        <Button title="Prev" onPress={onPrevPage} disabled={page === 1} color="#8d6e63" />
        <Text style={styles.pageText}>Page {page}</Text>
        <Button title="Next" onPress={onNextPage} disabled={(page * pageSize) >= totalCount} color="#8d6e63" />
      </SafeAreaView>

      <Text style={styles.totalText}>Total Listings: {totalCount}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff8e1',
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'SpaceMono',
    color: '#3e2723',
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#8d6e63',
    borderRadius: 8,
    padding: 8,
    marginRight: 4,
    color: '#3e2723',
    fontFamily: 'SpaceMono',
    backgroundColor: '#fff',
  },
  listItem: {
    backgroundColor: '#f7f1e3',
    marginVertical: 6,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d7ccc8',
  },
  listItemTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 18,
    color: '#3e2723',
    fontFamily: 'SpaceMono',
  },
  listItemDescription: {
    fontSize: 14,
    color: '#5d4037',
    fontFamily: 'SpaceMono',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    alignItems: 'center',
  },
  pageText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    color: '#3e2723',
  },
  totalText: {
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'SpaceMono',
    color: '#3e2723',
  },
});