import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import PropTypes from 'prop-types';

const { width, height } = Dimensions.get('window');

const MoneyLoadingAnimation = ({ visible = true, text = "Loading..." }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();

      // Start pulse animation
      startPulseAnimation();
      startRotationAnimation();
    } else {
      // Fade out animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRotationAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  if (!visible) return null;

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {/* Money falling from sky - simplified version */}
      {[...Array(6)].map((_, index) => {
        const startX = (index * (width / 6)) + 30;
        const uniqueKey = `money-${startX}-${index}`;
        
        return (
          <Animated.View
            key={uniqueKey}
            style={{
              position: 'absolute',
              left: startX,
              top: -50,
              transform: [
                { rotate: rotateInterpolate },
                { scale: pulseAnim },
              ],
            }}
          >
            <Ionicons 
              name="cash" 
              size={20} 
              color={COLORS.primary} 
            />
          </Animated.View>
        );
      })}

      {/* Loading container */}
      <View
        style={{
          backgroundColor: 'white',
          paddingHorizontal: 30,
          paddingVertical: 25,
          borderRadius: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {/* Money icon with pulse animation */}
        <Animated.View
          style={{
            marginBottom: 15,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Ionicons name="wallet" size={40} color={COLORS.primary} />
        </Animated.View>

        {/* Loading text */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: COLORS.text,
            textAlign: 'center',
          }}
        >
          {text}
        </Text>

        {/* Animated dots */}
        <View style={{ flexDirection: 'row', marginTop: 15 }}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.primary,
                marginHorizontal: 3,
                transform: [{ scale: pulseAnim }],
              }}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

MoneyLoadingAnimation.propTypes = {
  visible: PropTypes.bool,
  text: PropTypes.string,
};

export default MoneyLoadingAnimation;
