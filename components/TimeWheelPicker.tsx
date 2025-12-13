// Custom Time Wheel Picker Component
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  value: string; // "h:mm A" format, e.g., "3:45 PM"
  onChange: (time: string) => void;
}

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const periods = ['AM', 'PM'];

const parseTimeString = (timeStr: string): { hour: number; minute: number; period: string } => {
  if (!timeStr || timeStr.trim() === '') {
    return { hour: 12, minute: 0, period: 'PM' };
  }

  // Try to parse "h:mm A" format
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    // Validate values
    if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
      return { hour, minute, period };
    }
  }

  // Default fallback
  return { hour: 12, minute: 0, period: 'PM' };
};

const formatTimeString = (hour: number, minute: number, period: string): string => {
  return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
};

export default function TimeWheelPicker({ value, onChange }: Props) {
  const parsed = parseTimeString(value);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(parsed.period);

  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the first render to avoid calling onChange with the initial value
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newTimeString = formatTimeString(selectedHour, selectedMinute, selectedPeriod);
    if (newTimeString !== value) {
      onChange(newTimeString);
    }
  }, [selectedHour, selectedMinute, selectedPeriod, onChange, value]);

  const displayTime = formatTimeString(selectedHour, selectedMinute, selectedPeriod);

  return (
    <View style={styles.container}>
      {/* Clock-style display */}
      <View style={styles.clockDisplay}>
        <View style={styles.clockRing}>
          <View style={styles.clockInner}>
            <Text style={styles.timeText}>{displayTime}</Text>
          </View>
          {/* Hour markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <View
                key={i}
                style={[
                  styles.hourMarker,
                  {
                    transform: [
                      { translateX: x },
                      { translateY: y },
                    ],
                  },
                ]}
              >
                <Text style={styles.hourMarkerText}>{i === 0 ? 12 : i}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Picker wheels */}
      <View style={styles.pickersContainer}>
        {/* Hour Picker */}
        <View style={styles.pickerColumn}>
          <ScrollView
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={styles.pickerContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              if (index >= 0 && index < hours.length) {
                setSelectedHour(hours[index]);
              }
            }}
            contentOffset={{ x: 0, y: (selectedHour - 1) * ITEM_HEIGHT }}
          >
            {hours.map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.pickerItem,
                  selectedHour === hour && styles.selectedItem,
                ]}
                onPress={() => setSelectedHour(hour)}
              >
                <Text
                  style={[
                    styles.pickerText,
                    selectedHour === hour && styles.selectedText,
                  ]}
                >
                  {hour}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <Text style={styles.separatorText}>:</Text>
        </View>

        {/* Minute Picker */}
        <View style={styles.pickerColumn}>
          <ScrollView
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={styles.pickerContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              if (index >= 0 && index < minutes.length) {
                setSelectedMinute(minutes[index]);
              }
            }}
            contentOffset={{ x: 0, y: selectedMinute * ITEM_HEIGHT }}
          >
            {minutes.map((minute) => (
              <TouchableOpacity
                key={minute}
                style={[
                  styles.pickerItem,
                  selectedMinute === minute && styles.selectedItem,
                ]}
                onPress={() => setSelectedMinute(minute)}
              >
                <Text
                  style={[
                    styles.pickerText,
                    selectedMinute === minute && styles.selectedText,
                  ]}
                >
                  {minute.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Period Picker (AM/PM) */}
        <View style={styles.periodColumn}>
          <ScrollView
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={styles.pickerContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              if (index >= 0 && index < periods.length) {
                setSelectedPeriod(periods[index]);
              }
            }}
            contentOffset={{ x: 0, y: periods.indexOf(selectedPeriod) * ITEM_HEIGHT }}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.pickerItem,
                  selectedPeriod === period && styles.selectedItem,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.pickerText,
                    selectedPeriod === period && styles.selectedText,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  clockDisplay: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  clockRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: Colors.celestialGold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(221, 133, 216, 0.05)',
  },
  clockInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourMarkerText: {
    color: Colors.celestialGold,
    fontSize: 12,
    fontFamily: 'serif',
    opacity: 0.7,
  },
  timeText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: '500',
    textAlign: 'center',
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: width - 80,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  pickerColumn: {
    flex: 1,
    maxWidth: 70,
  },
  periodColumn: {
    flex: 1,
    maxWidth: 60,
  },
  separator: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separatorText: {
    color: Colors.celestialGold,
    fontSize: 24,
    fontWeight: '600',
  },
  picker: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  pickerContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  selectedItem: {
    backgroundColor: 'rgba(221, 133, 216, 0.15)',
    borderRadius: BorderRadius.md,
  },
  pickerText: {
    color: Colors.moonlightGray,
    fontSize: 16,
    fontFamily: 'System',
  },
  selectedText: {
    color: Colors.celestialGold,
    fontWeight: '600',
  },
});
