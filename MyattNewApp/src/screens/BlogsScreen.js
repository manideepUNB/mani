import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, Alert } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { TouchableOpacity } from 'react-native';

const BlogsScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://myattacademyapi.sapphiresolutions.in.net/api/blogs`);
      const data = await response.json();

      if (response.ok && Array.isArray(data.data?.data)) {
        setBlogs(data.data.data);
      } else {
        const msg = data.message || 'Failed to fetch blogs';
        setError(msg);
        Alert.alert('Error', msg);
      }
    } catch (error) {
      const errMsg = 'An error occurred while fetching blogs';
      setError(errMsg);
      Alert.alert('Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogPress = (slug) => {
    navigation.navigate('BlogDetailScreen', { slug });
  };

  const handleReadMore = (blog) => {
    navigation.navigate('BlogFullDetails', { blog });
  };
  
  const renderBlogItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.blogCard}
      onPress={() => handleReadMore(item)}
    >
      {item.image?.startsWith('http') && (
        <Image source={{ uri: item.image }} style={styles.blogImage} resizeMode="cover" />
      )}

      <View style={styles.blogContent}>
        <Text style={styles.blogTitle}>{item.title || 'Untitled Blog'}</Text>
        {item.created_at && (
          <Text style={styles.blogDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#A9C667" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!loading && blogs.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No blogs found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={blogs}
        renderItem={renderBlogItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  blogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blogImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  blogDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 10,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  blogDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BlogsScreen;
