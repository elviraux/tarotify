// Gradient Background Component with Starry Effect
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
}

// Generate random stars
const generateStars = (count: number) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: Math.random() * width,
      top: Math.random() * height,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }
  return stars;
};

const stars = generateStars(50);

export default function GradientBackground({ children }: Props) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.voidBlack, Colors.deepMidnightBlue, Colors.voidBlack]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Stars */}
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.voidBlack,
  },
  star: {
    position: 'absolute',
    backgroundColor: Colors.stardustSilver,
    borderRadius: 9999,
  },
});
