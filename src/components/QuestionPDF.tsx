import { Page, Text, Document, StyleSheet, View, Image } from '@react-pdf/renderer';
    import { Question } from '../types';

    const styles = StyleSheet.create({
      page: {
        padding: 20,
        fontSize: 15,
        fontFamily: 'Baloo',
      },
      title: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Baloo',
      },
      folderTitle: {
        fontSize: 16,
        marginTop: 15,
        marginBottom: 10,
        backgroundColor: '#e0e0e0',
        padding: 8,
        fontFamily: 'Baloo',
      },
      categoryTitle: {
        fontSize: 14,
        marginTop: 15,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        padding: 8,
        fontFamily: 'Baloo',
      },
      questionContainer: {
        marginBottom: 5,
        breakInside: 'avoid',
      },
      questionText: {
        fontSize: 12,
        marginBottom: 5,
        fontFamily: 'Baloo',
        lineHeight: 1.4,
      },
      questionStatus: {
        fontSize: 10,
        marginBottom: 5,
        color: '#666666',
        fontFamily: 'Baloo',
      },
      imageContainer: {
        marginBottom: 5,
        maxHeight: 400,
        alignItems: 'center',
      },
      questionImage: {
        objectFit: 'contain',
        maxWidth: '95%',
        maxHeight: 240,
      },
      options: {
        marginLeft: 20,
        marginTop: 3,
      },
      option: {
        marginBottom: 3,
        fontSize: 11,
        lineHeight: 1.3,
        fontFamily: 'Baloo',
      },
      answerSection: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#999',
        paddingTop: 20,
      },
      answerTitle: {
        fontSize: 16,
        marginBottom: 15,
        fontFamily: 'Baloo',
        textAlign: 'center',
      },
      categoryAnswers: {
        marginTop: 15,
        marginBottom: 20,
        pageBreakInside: 'avoid',
      },
      categoryAnswerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: 'Baloo',
        backgroundColor: '#f5f5f5',
        padding: 5,
      },
      answerKey: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
      },
      answer: {
        width: '45%',
        marginBottom: 8,
        fontSize: 11,
        lineHeight: 1.4,
        fontFamily: 'Baloo',
        padding: 2,
      },
      answerLine: {
        marginBottom: 8,
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#999',
        borderBottomStyle: 'dotted',
      },
    });

    interface QuestionPDFProps {
      title: string;
      categorizedQuestions: Array<{
        folderName: string;
        categories: Array<{
          categoryName: string;
          questions: Question[];
        }>;
      }>;
      includeAnswers?: boolean;
    }

    export const QuestionPDF = ({ 
      title, 
      categorizedQuestions,
      includeAnswers = true 
    }: QuestionPDFProps) => (
      <Document>
        {/* Questions Page */}
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>{title}</Text>

          {categorizedQuestions.map((folder, folderIndex) => (
            <View key={folderIndex}>
              <Text style={styles.folderTitle}>{folder.folderName}</Text>
              {folder.categories.map((category, categoryIndex) => (
                <View key={`${folderIndex}-${categoryIndex}`}>
                  <Text style={styles.categoryTitle}>{category.categoryName}</Text>
                  {category.questions.map((question, index) => (
                    <View key={`${folderIndex}-${categoryIndex}-${index}`} style={styles.questionContainer} wrap={false}>
                      {!question.is_active && (
                        <Text style={styles.questionStatus}>(Inactive Question)</Text>
                      )}
                      <Text style={styles.questionText}>
                        {index + 1}. {question.question}
                      </Text>

                      {question.type === 'image' && question.image_url && (
                        <View style={styles.imageContainer}>
                          <Image
                            src={question.image_url}
                            style={styles.questionImage}
                            cache={false}
                          />
                        </View>
                      )}

                      {question.type === 'text' && (
                        <View style={styles.answerLine} />
                      )}

                      {question.type === 'multichoice' && question.options && (
                        <View style={styles.options}>
                          {question.options.map((option, optIndex) => (
                            <Text key={optIndex} style={styles.option}>
                              {String.fromCharCode(97 + optIndex)}. {option}
                            </Text>
                          ))}
                        </View>
                      )}

                      {question.type === 'truefalse' && (
                        <View style={styles.options}>
                          <Text style={styles.option}>a. True</Text>
                          <Text style={styles.option}>b. False</Text>
                        </View>
                      )}

                      {question.type === 'image' && (
                        <View style={styles.answerLine} />
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </Page>

        {/* Answer Key Page */}
        {includeAnswers && categorizedQuestions.length > 0 && (
          <Page size="A4" style={styles.page}>
            <Text style={styles.answerTitle}>Answer Key</Text>
            {categorizedQuestions.map((folder, folderIndex) => (
              <View key={`answers-${folderIndex}`}>
                <Text style={styles.folderTitle}>{folder.folderName}</Text>
                {folder.categories.map((category, categoryIndex) => (
                  <View key={`answers-${folderIndex}-${categoryIndex}`} style={styles.categoryAnswers}>
                    <Text style={styles.categoryAnswerTitle}>{category.categoryName}</Text>
                    <View style={styles.answerKey}>
                      {category.questions.map((question, index) => (
                        <Text key={`${folderIndex}-${categoryIndex}-${index}`} style={styles.answer}>
                          {index + 1}. {question.correct_answer}
                          {!question.is_active ? ' (Inactive)' : ''}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </Page>
        )}
      </Document>
    );
