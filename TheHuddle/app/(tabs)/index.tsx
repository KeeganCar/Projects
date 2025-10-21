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
  { id: '1', user: 'nfl_guru', group: 'NFL Fans', content: 'Who is your Super Bowl pick for this year?' },
  { id: '2', user: 'jordan_fan', group: 'NBA', content: 'Is LeBron the GOAT? Hot take!' },
  { id: '3', user: 'dave_from_work', group: 'Office League', content: 'My 4-leg parlay for tonight just hit! 🤑' },
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
