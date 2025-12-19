// Custom Date Wheel Picker Component
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '@/constants/theme';
import { formatDateLong } from '@/utils/formatDate';
import { hapticSelection } from '@/utils/haptics';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export default function DateWheelPicker({ value, onChange }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedDay, setSelectedDay] = useState(value.getDate());
  const [selectedYear, setSelectedYear] = useState(value.getFullYear());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i);
  const days = Array.from(
    { length: getDaysInMonth(selectedMonth, selectedYear) },
    (_, i) => i + 1
  );

  useEffect(() => {
    const maxDays = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedMonth, selectedYear, selectedDay]);

  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    // Only call onChange if the date has actually changed to prevent infinite loops
    if (newDate.getTime() !== value.getTime()) {
      onChange(newDate);
    }
  }, [selectedMonth, selectedDay, selectedYear, onChange, value]);

  const displayDate = new Date(selectedYear, selectedMonth, selectedDay);

  return (
    <View style={styles.container}>
      {/* Clock-style display */}
      <View style={styles.clockDisplay}>
        <View style={styles.clockRing}>
          <View style={styles.clockInner}>
            <Text style={styles.dateText}>{formatDateLong(displayDate)}</Text>
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
                <Text style={styles.hourText}>{i === 0 ? 12 : i}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Picker wheels */}
      <View style={styles.pickersContainer}>
        {/* Month Picker */}
        <View style={styles.pickerColumn}>
          <ScrollView
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={styles.pickerContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              if (index >= 0 && index < months.length && index !== selectedMonth) {
                hapticSelection();
                setSelectedMonth(index);
              }
            }}
            contentOffset={{ x: 0, y: selectedMonth * ITEM_HEIGHT }}
          >
            {months.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.pickerItem,
                  selectedMonth === index && styles.selectedItem,
                ]}
                onPress={() => {
                  if (selectedMonth !== index) {
                    hapticSelection();
                    setSelectedMonth(index);
                  }
                }}
              >
                <Text
                  style={[
                    styles.pickerText,
                    selectedMonth === index && styles.selectedText,
                  ]}
                >
                  {month.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Day Picker */}
        <View style={styles.pickerColumn}>
          <ScrollView
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={styles.pickerContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              if (index >= 0 && index < days.length && days[index] !== selectedDay) {
                hapticSelection();
                setSelectedDay(days[index]);
              }
            }}
            contentOffset={{ x: 0, y: (selectedDay - 1) * ITEM_HEIGHT }}
          >
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.pickerItem,
                  selectedDay === day && styles.selectedItem,
                ]}
                onPress={() => {
                  if (selectedDay !== day) {
                    hapticSelection();
                    setSelectedDay(day);
                  }
                }}
              >
                <Text
                  style={[
                    styles.pickerText,
                    selectedDay === day && styles.selectedText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Year Picker */}
        <View style={styles.pickerColumn}>
          <ScrollView
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={styles.pickerContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              if (index >= 0 && index < years.length && years[index] !== selectedYear) {
                hapticSelection();
                setSelectedYear(years[index]);
              }
            }}
            contentOffset={{
              x: 0,
              y: years.indexOf(selectedYear) * ITEM_HEIGHT,
            }}
          >
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.pickerItem,
                  selectedYear === year && styles.selectedItem,
                ]}
                onPress={() => {
                  if (selectedYear !== year) {
                    hapticSelection();
                    setSelectedYear(year);
                  }
                }}
              >
                <Text
                  style={[
                    styles.pickerText,
                    selectedYear === year && styles.selectedText,
                  ]}
                >
                  {year}
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
  hourText: {
    color: Colors.celestialGold,
    fontSize: 12,
    fontFamily: Fonts.heading,
    opacity: 0.7,
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontFamily: Fonts.heading,
    fontWeight: '500',
    textAlign: 'center',
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: width - 80,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  pickerColumn: {
    flex: 1,
    maxWidth: 80,
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
