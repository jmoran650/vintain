// vintainApp/app/(tabs)/index.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  Button,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAllListings, useSearchListings } from '../../hooks/useApi';

interface Listing {
  id: string;
  brand: string;
  name: string;
  description: string;
  imageUrls: string[];
}

export default function ListingListScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 5;

  // Use the search query if a search term is provided, otherwise use the all listings query.
  const allListingsQuery = useAllListings(page, pageSize);
  const searchQuery = useSearchListings(searchTerm, page, pageSize);
  const activeQuery = searchTerm.trim().length > 0 ? searchQuery : allListingsQuery;

  if (activeQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#8d6e63" />
      </SafeAreaView>
    );
  }

  if (activeQuery.isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error loading listings.</Text>
      </SafeAreaView>
    );
  }

  const data = activeQuery.data;
  const listings: Listing[] = data?.listings || [];
  const totalCount: number = data?.totalCount || 0;

  function onSearch() {
    setPage(1);
    // The hook automatically refetches when searchTerm is part of the queryKey.
  }

  function onClearSearch() {
    setSearchTerm('');
    setPage(1);
  }

  function onNextPage() {
    if (page * pageSize < totalCount) {
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
        onPress={() =>
          router.push({
            pathname: '/listingDetail',
            params: { listingId: item.id },
          })
        }
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

      <FlatList data={listings} keyExtractor={(item) => item.id} renderItem={renderItem} />

      <SafeAreaView style={styles.paginationRow}>
        <Button title="Prev" onPress={onPrevPage} disabled={page === 1} color="#8d6e63" />
        <Text style={styles.pageText}>Page {page}</Text>
        <Button title="Next" onPress={onNextPage} disabled={page * pageSize >= totalCount} color="#8d6e63" />
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