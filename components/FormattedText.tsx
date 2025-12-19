// FormattedText - Simple markdown-like text renderer
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, Spacing, Fonts } from '@/constants/theme';

interface FormattedTextProps {
  text: string;
  style?: object;
  baseStyle?: object;
}

export default function FormattedText({ text, style, baseStyle }: FormattedTextProps) {
  // Parse the text into formatted segments
  const renderFormattedText = () => {
    // Split by line breaks first
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();

      // Handle headers (### or ##)
      if (trimmedLine.startsWith('### ')) {
        return (
          <Text key={lineIndex} style={[styles.heading3, baseStyle]}>
            {trimmedLine.replace('### ', '')}
          </Text>
        );
      }

      if (trimmedLine.startsWith('## ')) {
        return (
          <Text key={lineIndex} style={[styles.heading2, baseStyle]}>
            {trimmedLine.replace('## ', '')}
          </Text>
        );
      }

      // Handle bullet points
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const bulletContent = trimmedLine.substring(2);
        return (
          <View key={lineIndex} style={styles.bulletRow}>
            <Text style={[styles.bullet, baseStyle]}>{'\u2022'}</Text>
            <Text style={[styles.bulletText, baseStyle]}>
              {renderInlineFormatting(bulletContent)}
            </Text>
          </View>
        );
      }

      // Handle empty lines as spacing
      if (trimmedLine === '') {
        return <View key={lineIndex} style={styles.spacer} />;
      }

      // Regular paragraph with inline formatting
      return (
        <Text key={lineIndex} style={[styles.paragraph, baseStyle]}>
          {renderInlineFormatting(line)}
        </Text>
      );
    });
  };

  // Handle inline formatting (bold with **)
  const renderInlineFormatting = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // Look for bold text (**text**)
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);

      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before the bold
        if (boldMatch.index > 0) {
          parts.push(
            <Text key={keyIndex++}>{remaining.substring(0, boldMatch.index)}</Text>
          );
        }

        // Add the bold text
        parts.push(
          <Text key={keyIndex++} style={styles.boldText}>
            {boldMatch[1]}
          </Text>
        );

        // Continue with remaining text
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else {
        // No more formatting, add remaining text
        parts.push(<Text key={keyIndex++}>{remaining}</Text>);
        break;
      }
    }

    return parts.length > 0 ? parts : text;
  };

  return <View style={style}>{renderFormattedText()}</View>;
}

const styles = StyleSheet.create({
  heading2: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.celestialGold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontFamily: Fonts.heading,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.celestialGold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontFamily: Fonts.heading,
  },
  paragraph: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  bullet: {
    fontSize: 15,
    color: Colors.celestialGold,
    marginRight: Spacing.sm,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.celestialGold,
  },
  spacer: {
    height: Spacing.sm,
  },
});
