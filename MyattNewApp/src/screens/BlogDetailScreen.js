import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';

const BlogDetailScreen = ({ navigation, route }) => {
  const { slug } = route.params || {};
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlogDetails();
    } else {
      Alert.alert('Error', 'Invalid blog.');
      setLoading(false);
    }
  }, []);

  const fetchBlogDetails = async () => {
    try {
      const response = await fetch(`https://myattacademy.sapphiresolutions.in.net/blogs/blog?blog_id=${slug}`);
      const data = await response.json();

      if (response.ok && data.data) {
        setBlog(data.data);
      } else {
        Alert.alert('Error', data.message || 'Invalid blog data received.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while fetching blog details.');
    } finally {
      setLoading(false);
    }
  };

  const stripHtmlTags = (html) => {
    return html?.replace(/<[^>]*>?/gm, '') ?? '';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#A9C667" />
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Blog not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {blog.image && blog.image.startsWith('http') && (
        <Image source={{ uri: blog.image }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{blog.title}</Text>
        <Text style={styles.description}>{stripHtmlTags(blog.details)}</Text>
        <Text style={styles.date}>
          {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : ''}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  date: {
    marginTop: 10,
    color: '#888',
    fontSize: 13,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BlogDetailScreen;
