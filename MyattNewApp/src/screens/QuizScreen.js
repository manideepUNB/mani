import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  ToastAndroid,
  Platform,
  Modal,
  Share,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'react-native-blob-util';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('', message);
  }
};

const QuizScreen = ({ route, navigation }) => {
  const { quizId, quizTitle, lessonId } = route.params;
  console.log('QuizScreen params:', { quizId, quizTitle, lessonId }); // Debug log

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentExam, setCurrentExam] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

  const fetchQuizQuestions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Please login to view quiz');
        return;
      }

      const response = await fetch(
        `https://myattacademyapi.sapphiresolutions.in.net/api/course/quiz?lesson_id=${lessonId}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success === "Success") {
        const exam = data.data.find(q => q.exam_id === Number(quizId));
        if (exam && exam.questions) {
          setCurrentExam(exam);
          setQuizData(exam.questions);
        } else {
          setError('No questions found in this quiz');
        }
      } else {
        setError(data.message || 'Could not load quiz questions');
      }
    } catch (error) {
      setError('Failed to fetch quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const submitQuizAnswers = async () => {
    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please login to submit quiz');
        return;
      }

      let correctCount = 0;
      const questions = quizData.map(question => {
        const selectedOptionId = selectedAnswers[question.question_id];
        const selectedOption = question.options.find(opt => opt.option_id === selectedOptionId);
        const isCorrect = selectedOption?.is_correct_answer?.toLowerCase() === "yes";
        if (isCorrect) correctCount++;

        return {
          exam_id: currentExam.exam_id,
          question_id: question.question_id,
          option_id: selectedOptionId,
          isPassed: isCorrect ? 1 : 0
        };
      });

      const response = await fetch(
        'https://myattacademyapi.sapphiresolutions.in.net/api/course/quiz/submit',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lesson_id: Number(lessonId),
            questions: questions,
            uuid: Date.now().toString()
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.success === "Success") {
        setScore(correctCount);
        setShowResults(true);

        if (correctCount === quizData.length) {
          showToast('Congratulations!! All your answers are correct');
          setTimeout(() => navigation.goBack(), 2000);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to submit quiz');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderOption = (option, question) => {
    const isSelected = selectedAnswers[question.question_id] === option.option_id;
    const isCorrect = option.is_correct_answer?.toLowerCase() === "yes";

    return (
      <TouchableOpacity
        key={option.option_id}
        style={[
          styles.optionButton,
          isSelected && !showResults && styles.selectedOption,
          showResults && isCorrect && styles.correctOption,
          showResults && isSelected && !isCorrect && styles.incorrectOption,
        ]}
        onPress={() => handleAnswerSelect(question.question_id, option.option_id)}
        disabled={showResults || submitting}
      >
        <View style={styles.optionContent}>
          {option.images && (
            <Image
              source={{ uri: `https://myattacademyapi.sapphiresolutions.in.net/${option.images}` }}
              style={styles.optionImage}
              resizeMode="contain"
            />
          )}
          
          <Text style={[
            styles.optionText,
            isSelected && !showResults && styles.selectedOptionText,
            showResults && isCorrect && styles.correctOptionText,
            showResults && isSelected && !isCorrect && styles.incorrectOptionText,
          ]}>
            {option.option_name}
          </Text>

          {showResults && (
            <View style={[
              styles.answerLabel,
              isCorrect ? styles.correctAnswerLabel : (isSelected ? styles.wrongAnswerLabel : null)
            ]}>
              <Text style={styles.answerLabelText}>
                {isCorrect ? 'Correct Answer' : (isSelected ? 'Wrong Answer' : '')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuestionResult = (question, index) => {
    return (
      <View key={question.question_id} style={styles.questionCard}>
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
        <Text style={styles.questionText}>{question.question_name}</Text>
        
        {question.image && question.image.length > 0 && (
          <Image
            source={{ uri: question.image[0] }}
            style={styles.questionImage}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Question image"
          />
        )}

        <View style={styles.optionsContainer}>
          {question.options?.map(option => renderOption(option, question))}
        </View>
      </View>
    );
  };

  const generateQuestionsPDF = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please login to download quiz questions');
        return;
      }

      showToast('Download started...');
      console.log('Fetching download link for quiz:', quizId);

      const response = await fetch(
        `https://myattacademyapi.sapphiresolutions.in.net/api/course/download-quiz/${quizId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data && data.download_link) {
        const downloadUrl = data.download_link;
        console.log('Opening PDF from URL:', downloadUrl);

        try {
          const supported = await Linking.canOpenURL(downloadUrl);
          if (supported) {
            await Linking.openURL(downloadUrl);
          } else {
            Alert.alert('Error', 'Cannot open PDF file');
          }
        } catch (error) {
          console.error('Error opening PDF:', error);
          Alert.alert('Error', 'Failed to open PDF file');
        }
      } else {
        console.error('Invalid API response:', data);
        Alert.alert('Error', 'PDF download link is missing');
      }
    } catch (error) {
      console.error('Error downloading questions:', error);
      Alert.alert('Error', 'Failed to download quiz questions');
    }
  };

  const generateAnswersPDF = async () => {
    try {
      // Use the provided static PDF URL for answers
      const downloadUrl = 'https://myattacademyapi.sapphiresolutions.in.net/pdfs/Answers_U1Q1%20-%20Let%20s%20Chant%20the%20Consonants%20Beginning.pdf';
      showToast('Download started...');
      console.log('Opening PDF from URL:', downloadUrl);

      try {
        const supported = await Linking.canOpenURL(downloadUrl);
        if (supported) {
          await Linking.openURL(downloadUrl);
        } else {
          Alert.alert('Error', 'Cannot open PDF file');
        }
      } catch (error) {
        console.error('Error opening PDF:', error);
        Alert.alert('Error', 'Failed to open PDF file');
      }
    } catch (error) {
      console.error('Error downloading answers:', error);
      Alert.alert('Error', 'Failed to download quiz answers');
    }
  };

  const DownloadModal = () => (
    <Modal
      visible={showDownloadModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDownloadModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Download Options</Text>
          
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={() => {
              generateQuestionsPDF();
              setShowDownloadModal(false);
            }}
          >
            <Ionicons name="document-text-outline" size={24} color="#fff" />
            <Text style={styles.downloadButtonText}>Download Questions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={() => {
              generateAnswersPDF();
              setShowDownloadModal(false);
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <Text style={styles.downloadButtonText}>Download Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowDownloadModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#A9C667" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchQuizQuestions}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF5400" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (showResults) {
              navigation.goBack();
            } else {
              Alert.alert(
                'Leave Quiz?',
                'Are you sure you want to leave? Your progress will be lost.',
                [
                  { text: 'Stay', style: 'cancel' },
                  { text: 'Leave', onPress: () => navigation.goBack() }
                ]
              );
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {showResults ? 'Quiz Results' : currentExam?.exam_name || quizTitle || 'Quiz'}
          </Text>
          {showResults && (
            <Text style={styles.scoreText}>
              Score: {score}/{quizData?.length || 0}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.headerDownloadButton}
          onPress={() => setShowDownloadModal(true)}
        >
          <Ionicons name="download-outline" size={24} color="#55198A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}
        accessibilityElementsHidden={false}
        importantForAccessibility="yes">
        {showResults ? (
          quizData?.map((question, index) => renderQuestionResult(question, index))
        ) : (
          quizData?.map((question, index) => (
            <View key={question.question_id} style={styles.questionCard}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Question ${index + 1}: ${question.question_name}`}>
              <Text style={styles.questionNumber}>Question {index + 1}</Text>
              <Text style={styles.questionText}>{question.question_name}</Text>
              
              {question.image && question.image.length > 0 && (
                <Image
                  source={{ uri: question.image[0] }}
                  style={styles.questionImage}
                  resizeMode="contain"
                  accessible={true}
                  accessibilityLabel="Question image"
                />
              )}

              <View style={styles.optionsContainer}>
                {question.options?.map(option => renderOption(option, question))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {!showResults && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={submitQuizAnswers}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Quiz</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      <DownloadModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFE168',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#55198A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  questionImage: {
    width: width - 64,
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionButton: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    alignItems: 'center',
  },
  optionContent: {
    padding: 12,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  optionImage: {
    width: width - 80,
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#55198A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF5400',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#55198A',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: '#F44336',
    fontWeight: '500',
  },
  answerLabel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  correctAnswerLabel: {
    backgroundColor: '#4CAF50',
  },
  wrongAnswerLabel: {
    backgroundColor: '#F44336',
  },
  answerLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  downloadButton: {
    backgroundColor: '#55198A',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  headerDownloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
});

export default QuizScreen; 