// The Oracle - AI Astrologist Chat Screen
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTextGeneration } from '@fastshot/ai';
import GradientBackground from '@/components/GradientBackground';
import FormattedText from '@/components/FormattedText';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getUserProfile, getDailyReading, getTodayDateString } from '@/utils/storage';
import { UserProfile, DailyReading } from '@/types';
import { formatDateLong, getZodiacSign } from '@/utils/formatDate';
import { hapticLight } from '@/utils/haptics';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface OracleResponse {
  reply: string;
  suggestions: string[];
}

// Initial suggestion chips for new conversations
const INITIAL_SUGGESTIONS = [
  'What does my Life Path number mean?',
  'Tell me about my Big Three.',
  'What energy should I focus on today?',
  'Explain my Soul Urge number.',
  'How do my Sun and Moon work together?',
];

// Fallback suggestions if parsing fails
const FALLBACK_SUGGESTIONS = [
  'Tell me more about this.',
  'What should I focus on?',
  'How does this affect my day?',
];

// Parse Oracle response - handles JSON with markdown code blocks
const parseOracleResponse = (text: string): OracleResponse | null => {
  try {
    let jsonText = text;

    // First, try to extract from markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    } else {
      // Find the first '{' and last '}' to extract JSON object
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonText = text.substring(firstBrace, lastBrace + 1);
      }
    }

    const parsed = JSON.parse(jsonText);

    // Validate structure
    if (parsed.reply && typeof parsed.reply === 'string') {
      return {
        reply: parsed.reply.replace(/\\n/g, '\n').trim(),
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.slice(0, 3)
          : FALLBACK_SUGGESTIONS,
      };
    }
  } catch {
    // JSON parsing failed
  }

  return null;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const flatListRef = useRef<FlatList>(null);
  const suggestionsScrollRef = useRef<ScrollView>(null);

  const { generateText, isLoading } = useTextGeneration({
    onSuccess: (response) => {
      // Try to parse structured JSON response
      const parsed = parseOracleResponse(response);

      let replyText: string;
      let newSuggestions: string[];

      if (parsed) {
        replyText = parsed.reply;
        newSuggestions = parsed.suggestions;
      } else {
        // Fallback: use raw response and default suggestions
        replyText = response;
        newSuggestions = FALLBACK_SUGGESTIONS;
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: replyText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update suggestions and reset scroll
      setCurrentSuggestions(newSuggestions);
      setTimeout(() => {
        suggestionsScrollRef.current?.scrollTo({ x: 0, animated: true });
      }, 100);
    },
    onError: (error) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'The stars are momentarily obscured... Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentSuggestions(FALLBACK_SUGGESTIONS);
      console.error('AI Error:', error);
    },
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const profile = await getUserProfile();
    setUserProfile(profile);

    // Load daily reading if it exists for today
    const reading = await getDailyReading();
    if (reading && reading.date === getTodayDateString()) {
      setDailyReading(reading);
    }

    // Create welcome message
    const firstName = profile?.fullName?.split(' ')[0] || 'Seeker';
    const hasReading = reading && reading.date === getTodayDateString();
    const welcomeMessage: Message = {
      id: 'welcome',
      text: hasReading
        ? `I sense you have questions, ${firstName}. I see you've already drawn your cards today. The celestial bodies have aligned to guide you. Ask me about your reading, and the stars shall illuminate their meaning.`
        : `I sense you have questions, ${firstName}. The celestial bodies have aligned to guide you today. Ask, and the stars shall answer.`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setIsInitialized(true);
  };

  const buildPrompt = useCallback((userMessage: string): string => {
    const contextParts: string[] = [];

    // Build user context
    if (userProfile) {
      const zodiac = userProfile.dateOfBirth ? getZodiacSign(userProfile.dateOfBirth) : null;
      contextParts.push(`User: ${userProfile.fullName}`);
      if (userProfile.dateOfBirth) {
        contextParts.push(`Birth Date: ${formatDateLong(userProfile.dateOfBirth)}`);
      }
      if (zodiac) {
        contextParts.push(`Zodiac Sign: ${zodiac}`);
      }
      if (userProfile.timeOfBirth) {
        contextParts.push(`Birth Time: ${userProfile.timeOfBirth}`);
      }
      if (userProfile.placeOfBirth) {
        contextParts.push(`Birth Place: ${userProfile.placeOfBirth}`);
      }
    }

    // Build daily reading context if available
    const readingParts: string[] = [];
    if (dailyReading && dailyReading.cards.length > 0) {
      readingParts.push('Today\'s Daily Tarot Reading:');

      dailyReading.cards.forEach((cardReading) => {
        const positionLabel = cardReading.position.charAt(0).toUpperCase() + cardReading.position.slice(1);
        const card = cardReading.card;
        readingParts.push(`- ${positionLabel}: ${card.name}`);
        readingParts.push(`  Keywords: ${card.keywords.join(', ')}`);
        readingParts.push(`  Meaning: ${card.uprightMeaning}`);
        if (cardReading.shortDescription) {
          readingParts.push(`  Brief: ${cardReading.shortDescription}`);
        }
      });

      if (dailyReading.mainExplanation) {
        readingParts.push(`\nOverall Reading Interpretation: ${dailyReading.mainExplanation}`);
      }
    }

    // Build conversation history (last 6 messages for context)
    const recentMessages = messages.slice(-6);
    const historyParts = recentMessages.map(msg =>
      `${msg.isUser ? 'User' : 'Oracle'}: ${msg.text}`
    );

    const hasDailyReading = dailyReading && dailyReading.cards.length > 0;

    const systemPrompt = `You are The Oracle, a wise, mystical, and empathetic astrologist and tarot reader. You speak with an air of ancient wisdom and cosmic insight. Your responses are concise yet profound, weaving astrological and tarot knowledge with genuine care for the seeker.

${hasDailyReading ? `You have access to the user's current daily tarot reading. When discussing their cards:
- Analyze the DYNAMIC INTERPLAY between the cards (e.g., how the Past card influences the Present context, how Present leads to Future).
- Do not just define each card individually - weave their meanings together into a cohesive narrative.
- Reference specific cards by name when giving advice.
- Connect the card meanings to the user's zodiac sign and birth details when relevant.` : ''}

Use the user's birth details to personalize your guidance. Maintain a mystical tone without being overly theatrical. Keep responses to 2-3 sentences unless a longer explanation is truly needed.

IMPORTANT: You MUST respond with ONLY a valid JSON object in this exact format:
{"reply": "Your mystical answer here with **bold** for emphasis if needed", "suggestions": ["Short follow-up question 1?", "Short follow-up question 2?", "Short follow-up question 3?"]}

The suggestions should be 3 short, relevant follow-up questions (max 6 words each) that naturally continue the conversation based on what you just discussed.`;

    const fullPrompt = `${systemPrompt}

${contextParts.length > 0 ? 'Seeker Information:\n' + contextParts.join('\n') : ''}

${readingParts.length > 0 ? readingParts.join('\n') : ''}

${historyParts.length > 0 ? 'Recent Conversation:\n' + historyParts.join('\n') : ''}

User's Question: ${userMessage}

Respond with ONLY the JSON object:`;

    return fullPrompt;
  }, [userProfile, dailyReading, messages]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || isLoading) return;

    // Trigger light haptic when sending a message
    hapticLight();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const prompt = buildPrompt(inputText.trim());
    setInputText('');
    Keyboard.dismiss();

    generateText(prompt);
  }, [inputText, isLoading, buildPrompt, generateText]);

  // Handle suggestion chip tap
  const handleChipPress = useCallback((chipText: string) => {
    if (isLoading) return;

    hapticLight();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: chipText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const prompt = buildPrompt(chipText);
    Keyboard.dismiss();

    generateText(prompt);
  }, [isLoading, buildPrompt, generateText]);

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble,
      ]}
    >
      {!item.isUser && (
        <View style={styles.aiIconContainer}>
          <Ionicons name="sparkles" size={14} color={Colors.celestialGold} />
        </View>
      )}
      {item.isUser ? (
        <Text style={[styles.messageText, styles.userText]}>
          {item.text}
        </Text>
      ) : (
        <FormattedText
          text={item.text}
          baseStyle={styles.aiText}
        />
      )}
    </View>
  );

  if (!isInitialized) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.celestialGold} />
            <Text style={styles.loadingText}>Consulting the stars...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="moon" size={24} color={Colors.celestialGold} />
            </View>
            <Text style={styles.headerTitle}>The Oracle</Text>
            <View style={styles.headerSubtitleContainer}>
              <Text style={styles.headerSubtitle}>Ask the Stars</Text>
            </View>
          </View>

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
          />

          {/* Typing Indicator */}
          {isLoading && (
            <View style={styles.typingContainer}>
              <Ionicons name="sparkles" size={14} color={Colors.celestialGold} />
              <Text style={styles.typingText}>Divining the cosmos...</Text>
            </View>
          )}

          {/* Suggestion Chips - show throughout conversation */}
          {currentSuggestions.length > 0 && !isLoading && (
            <Animated.View
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(200)}
              style={styles.suggestionsContainer}
              key={currentSuggestions.join(',')} // Re-animate when suggestions change
            >
              <ScrollView
                ref={suggestionsScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsContent}
              >
                {currentSuggestions.map((chip, index) => (
                  <TouchableOpacity
                    key={`${index}-${chip}`}
                    style={styles.suggestionChip}
                    onPress={() => handleChipPress(chip)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionChipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask the Oracle..."
                placeholderTextColor={Colors.moonlightGray}
                multiline
                maxLength={500}
                returnKeyType="send"
                blurOnSubmit={true}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={inputText.trim() && !isLoading ? Colors.textPrimary : Colors.moonlightGray}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(221, 133, 216, 0.2)',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(221, 133, 216, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
  },
  headerSubtitleContainer: {
    marginTop: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.celestialGold,
    fontStyle: 'italic',
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xs,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(221, 133, 216, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.5)',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
  },
  aiIconContainer: {
    marginBottom: Spacing.xs,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.textPrimary,
  },
  aiText: {
    color: Colors.textPrimary,
    fontFamily: 'serif',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  typingText: {
    color: Colors.celestialGold,
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: Spacing.sm,
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(221, 133, 216, 0.2)',
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(221, 133, 216, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionsContainer: {
    paddingVertical: Spacing.sm,
  },
  suggestionsContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.celestialGold,
    backgroundColor: 'transparent',
  },
  suggestionChipText: {
    color: Colors.celestialGold,
    fontSize: 13,
    fontWeight: '500',
  },
});
