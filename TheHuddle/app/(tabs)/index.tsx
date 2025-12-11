/**
 * TheHuddle – Feed Screen
 * Author: Keegan Carnell
 *
 * Overview:
 * - Placeholder for the main community feed
 * - Eventually will show posts across groups / followed users
 * - Currently just a static welcome message
 */

import { StyleSheet, Text, View } from 'react-native';

// placeholder content for now
const feedData = [
  { id: '1', user: 'person1', group: 'NFL', content: 'Big Win' },
  { id: '2', user: 'person2', group: 'NBA', content: 'Lebrrrroooon' },
  { id: '3', user: 'person3', group: 'Office League', content: 'No way that missed...' },
];

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>
        Welcome to your feed! This is where you'll see hot posts from the community and your groups.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
