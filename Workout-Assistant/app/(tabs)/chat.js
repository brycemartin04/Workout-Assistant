import React, { useState, useCallback, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Markdown from 'react-native-markdown-display';
import { saveChatLog, getChatLogs, getWorkoutSummary, deleteChatLog } from '@/utils/storage';


const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{"id": "1740353557878-bot", "sender": "bot", "text": "Hi there! I'm your Virtual Trainer! How can I assist you with your fitness journey today?"}]); // Array of { id, text, sender }
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState(false);
  const [workoutContextSent, setWorkoutContextSent] = useState(false);

  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [conversationModalVisible, setConversationModalVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  const IP_ADDRESS = 'localhost' //import custom ip here

   useFocusEffect(
        useCallback(() => {
            const loadWorkouts = async () => {
                const storedWorkouts = await getWorkoutSummary();
                //console.log('Raw JSON:', JSON.stringify(storedWorkouts, null, 2));
                setWorkouts(storedWorkouts);
            };
            loadWorkouts();
        }, [])
    );


  const sendMessage = async () => {
    if (!message.trim()) return;
    Keyboard.dismiss();
    // Add the user's message to the conversation
    const userMessage = { id: Date.now().toString(), text: message, sender: 'user' };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      //console.log(workouts);
      const conversationHistory = [
        // Include the workout data only if it hasn’t been sent already
        ...(!workoutContextSent ? [{
          role: 'system',
          content: JSON.stringify(workouts, null, 2)
        }] : []),
        ...updatedMessages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }))
      ];

      if (!workoutContextSent) {
        setWorkoutContextSent(true);
      }
      
      // Build the payload with the new message and the entire conversation history
      const payload = {
        message,
        history: conversationHistory,
      };
      // Replace with your backend URL (using your local IP if testing on a physical device)
      const response = await fetch('http://{IP_ADDRESS}:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      // The backend returns a reply from OpenAI 40 Mini
      const botReply = data.reply || 'No reply received.';
      const botMessage = {
        id: Date.now().toString() + '-bot',
        text: botReply,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorMessage = {
        id: Date.now().toString() + '-error',
        text: 'Error communicating with the server.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const markdownStyles = {
    body: {
      fontSize: 16,
      color: '#333',
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
    // Add additional markdown styles as needed
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
        {isUser ? (
        <Text style={isUser ? styles.userText : styles.botText}>{item.text}</Text>
      ) : (
        <Markdown style={markdownStyles}>
          {item.text}
        </Markdown>
      )}
      </View>
    );
  };

  // Save the current conversation log
  const saveCurrentConversation = async () => {
    if (messages.length === 0) {
      Alert.alert('No messages', "There's no conversation to save.");
      return;
    }
    await saveChatLog(messages);
  };

  const viewSavedLogs = async () => {
    const logsData = await getChatLogs();
    setLogs(logsData);
    setLogsModalVisible(true);
  };

  const deleteLog = async (index) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            const updatedLogs = await deleteChatLog(index);
            if (updatedLogs) {
              setLogs(updatedLogs);
            }
          }
        },
      ]
    );
  };

  // Render each saved conversation in the modal
  const renderLogItem = ({ item, index }) => {
    // Show a summary with the date of the first message and count of messages
    const firstMessage = item[0];
    const secondMessage = item[1];
    const date = new Date(parseInt(firstMessage.id.split('-')[0])).toLocaleString();
    return (
      <TouchableOpacity
        style={styles.logCard}
        onPress={() => {
          setSelectedConversation(item);
          setLogsModalVisible(false);
          setConversationModalVisible(true);
        }}
      >
        <View style={styles.logCardHeader}>
          <Text style={styles.logTitle}>{secondMessage.text}</Text>
          <TouchableOpacity onPress={() => deleteLog(index)} style={{padding: 10, marginTop: -10, marginRight: -10}}>
            <FontAwesome name="trash" size={20} color="#555" />
          </TouchableOpacity>
        </View>
        <Text style={styles.logSubtitle}>{date} - {item.length} messages</Text>
      </TouchableOpacity>
    );
  };

  // Render individual conversation messages in the conversation modal
  const renderConversationMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
        {isUser ? (
        <Text style={isUser ? styles.userText : styles.botText}>{item.text}</Text>
      ) : (
        <Markdown style={markdownStyles}>
          {item.text}
        </Markdown>
      )}
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Virtual Trainer</Text>
      </View>
      <View style={styles.conversationButtonsContainer}>
          <TouchableOpacity onPress={saveCurrentConversation} style={styles.conversationButton}>
            <Text style={styles.conversationButtonText}>Save Conversation</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={viewSavedLogs} style={styles.conversationButton}>
            <Text style={styles.conversationButtonText}>View Logs</Text>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // adjust this value as needed
    >
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Start chatting...</Text>
            </View>
          }
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            {loading ? <ActivityIndicator size="small" color="white" style={styles.loading} /> : <Text style={styles.sendButtonText}>Send</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Modal
          visible={logsModalVisible}
          animationType="slide"
          onRequestClose={() => setLogsModalVisible(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Saved Conversations</Text>
              <TouchableOpacity onPress={() => setLogsModalVisible(false)} style={{paddingHorizontal: 10}}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={logs}
              renderItem={renderLogItem}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={styles.logsList}
            />
          </SafeAreaView>
        </Modal>
        <Modal
          visible={conversationModalVisible}
          animationType="slide"
          onRequestClose={() => setConversationModalVisible(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Conversation Details</Text>
              <TouchableOpacity onPress={() => setConversationModalVisible(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedConversation || []}
              renderItem={renderConversationMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.logsList}
            />
          </SafeAreaView>
        </Modal>
    </SafeAreaView>
  );
};

export default ChatPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginBottom: 83,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatList: {
    paddingVertical: 15,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 18,
  },
  messageContainer: {
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
    maxWidth: '80%',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    // Android elevation
    elevation: 3,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  loading: {
    backgroundColor: 'transparent'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    // iOS shadow for input container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height:4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(85,85,85,.2)',
    width: '60%',
  },
  headerTitle: {
    color: '#4A90E2',
    fontSize: 25,
    fontWeight: 'bold',
  },
  conversationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  conversationButton: {
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 40,
    borderColor: '#4A90E2',
    borderWidth: 1,
  },
  conversationButtonText: {
    color: '#555',
    fontSize: 14,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(85,85,85,0.2)',
    backgroundColor: '#fff',
  },
  modalHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#4A90E2',
  },
  logsList: {
    padding: 15,
  },
  logCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  logSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  deleteLogText: {
    color: '#EE0606',
    fontSize: 14,

  },
});
