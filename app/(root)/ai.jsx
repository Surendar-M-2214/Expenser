import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Animated, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-expo";
import { styles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";
import AIMessage from "../../components/AIMessage";

export default function AIScreen() {
  const { user } = useUser();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // ScrollView ref for auto-scrolling
  const scrollViewRef = useRef(null);

  // Function to scroll to bottom with debouncing
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  // Handle input focus with delayed scroll
  const handleInputFocus = () => {
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  // Start loading animation
  useEffect(() => {
    if (isLoading) {
      // Pulse animation
      const pulseAnimation = Animated.loop(
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
      );

      // Rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      // Scale animation
      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();
      rotateAnimation.start();
      scaleAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
        scaleAnimation.stop();
      };
    } else {
      // Reset animations
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [isLoading]);

  // Auto-scroll to bottom when messages change (with delay to prevent jittering)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;

    if (!user?.id) {
      Alert.alert("Authentication Required", "Please sign in to use AI features");
      return;
    }

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: question,
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      // Prepare conversation history for the API
      const conversationHistory = messages
        .filter(msg => msg.type === 'user' || msg.type === 'ai')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
        .slice(-10); // Keep last 10 messages to avoid token limits

      console.log("user?.id", user?.id);
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          userId: user?.id || 'anonymous', // Dynamic user ID from Clerk auth
          conversationHistory: conversationHistory
        })
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (data.success) {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          content: data.data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        const errorResponse = {
          id: messages.length + 2,
          type: 'ai',
          content: "Sorry, I'm having trouble processing your request right now. Please try again later.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: "Sorry, I'm having trouble connecting to the AI service. Please check your internet connection and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear conversation history
  const clearConversation = () => {
    Alert.alert(
      "Clear Conversation",
      "Are you sure you want to clear the conversation history?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => setMessages([])
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.chatgptContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >

      {/* CHAT MESSAGES - FULL SCREEN */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatgptChat} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
        nestedScrollEnabled={true}
      >
        {messages.length === 0 ? (
          <View style={styles.chatgptWelcome}>
            <View style={styles.chatgptWelcomeIcon}>
              <Ionicons name="chatbubble-ellipses" size={32} color={COLORS.primary} />
        </View>
            <Text style={styles.chatgptWelcomeTitle}>How can I help you today?</Text>
            
            
            {/* Sample Questions */}
            <View style={styles.chatgptSuggestions}>
              {[
                "How should I start investing?",
                "What's the best way to save money?",
                "Should I invest in gold or stocks?",
                "How much should I save each month?"
              ].map((sampleQuestion) => (
                <TouchableOpacity 
                  key={sampleQuestion}
                  style={[
                    styles.chatgptSuggestionChip,
                    !user?.id && { opacity: 0.5 }
                  ]}
                  onPress={() => {
                    if (user?.id) {
                      setQuestion(sampleQuestion);
                    } else {
                      Alert.alert("Authentication Required", "Please sign in to use AI features");
                    }
                  }}
                >
                  <Text style={styles.chatgptSuggestionText}>{sampleQuestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.chatgptMessageContainer,
                message.type === 'user' ? styles.chatgptUserMessage : styles.chatgptAiMessage
              ]}
            >
              {message.type === 'user' ? (
                <View style={styles.chatgptUserBubble}>
                  <Text style={styles.chatgptUserText}>
                    {message.content}
                  </Text>
                </View>
              ) : (
                <View style={styles.chatgptMessageText}>
                  <AIMessage reply={message.content} />
                </View>
              )}
            </View>
          ))
        )}
        {isLoading && (
          <View style={styles.chatgptAiMessage}>
            <View style={styles.chatgptMessageText}>
              <View style={styles.chatgptTyping}>
                <Text style={styles.chatgptTypingText}>AI is thinking</Text>
                <Animated.View style={[
                  styles.chatgptTypingDots,
                  {
                    transform: [{ scale: pulseAnim }]
                  }
                ]}>
                  <Text style={styles.chatgptTypingDot}>.</Text>
                  <Text style={styles.chatgptTypingDot}>.</Text>
                  <Text style={styles.chatgptTypingDot}>.</Text>
                </Animated.View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* CHATGPT INPUT BAR */}
      <View style={styles.chatgptInputContainer}>
        {/* Clear Conversation Button */}
        {messages.length > 0 && (
          <TouchableOpacity 
            style={styles.clearConversationButton}
            onPress={clearConversation}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.clearConversationText}>Clear</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.chatgptInputWrapper}>
          <TextInput
            style={styles.chatgptInput}
            placeholder={user?.id ? "Message AI Financial Assistant..." : "Please sign in..."}
            placeholderTextColor={COLORS.textLight}
            value={question}
            onChangeText={setQuestion}
            onFocus={handleInputFocus}
            multiline
            editable={!isLoading && !!user?.id}
          />
              <TouchableOpacity 
            style={[
              styles.chatgptSendButton, 
              (!question.trim() || isLoading || !user?.id) && styles.chatgptSendButtonDisabled
            ]}
                onPress={handleAskQuestion}
            disabled={!question.trim() || isLoading || !user?.id}
              >
                <Ionicons name="send" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
    </KeyboardAvoidingView>
  );
}