import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';

const BlogFullDetails = ({ route, navigation }) => {
  const { blog } = route.params;
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>{blog.title}</Text>
        
        {blog.image?.startsWith('http') && (
          <Image
            source={{ uri: blog.image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          <RenderHtml
            contentWidth={width - 32}
            source={{ html: blog.details }}
            tagsStyles={{
              p: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 16 },
              h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
              h2: { fontSize: 20, fontWeight: 'bold', marginBottom: 14 },
              h3: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
              ul: { marginBottom: 16 },
              li: { fontSize: 16, color: '#333', marginBottom: 8 },
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    padding: 16,
    paddingBottom: 8,
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
});

export default BlogFullDetails;