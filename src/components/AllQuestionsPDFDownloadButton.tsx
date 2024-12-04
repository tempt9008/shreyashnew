import { useState } from 'react';
    import { FileDown, Loader2 } from 'lucide-react';
    import { pdf } from '../lib/pdf-worker';
    import { QuestionPDF } from './QuestionPDF';
    import { supabase } from '../lib/supabase';
    import { Folder, Category, Question } from '../types';
    import toast from 'react-hot-toast';

    // Fisher-Yates shuffle algorithm
    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    interface CategoryQuestions {
      categoryName: string;
      questions: Question[];
    }

    interface FolderCategories {
      folderName: string;
      categories: CategoryQuestions[];
    }

    export default function AllQuestionsPDFDownloadButton() {
      const [isGenerating, setIsGenerating] = useState(false);

      const organizeQuestionsByFolderAndCategory = async (): Promise<FolderCategories[]> => {
        try {
          // Fetch all folders
          const { data: folders } = await supabase
            .from('folders')
            .select('*')
            .order('created_at');

          if (!folders) return [];

          // Fetch all categories
          const { data: categories } = await supabase
            .from('categories')
            .select('*')
            .in('folder_id', folders.map(f => f.id));

          if (!categories) return [];

          // Fetch all questions
          const { data: questions } = await supabase
            .from('questions')
            .select('*')
            .in('category_id', categories.map(c => c.id))
            .eq('is_active', true);

          if (!questions) return [];

          // Organize questions by folder and category
          const folderMap = new Map(folders.map(f => [f.id, f.name]));
          const categoryMap = new Map(categories.map(c => [c.id, c.name]));

          const organizedQuestions = folders.map(folder => ({
            folderName: folder.name,
            categories: categories
              .filter(cat => cat.folder_id === folder.id)
              .map(category => ({
                categoryName: category.name,
                questions: shuffleArray(questions.filter(q => q.category_id === category.id)),
              }))
          }));

          return organizedQuestions;
        } catch (error) {
          console.error('Error organizing questions:', error);
          toast.error('Error organizing questions for PDF generation');
          return [];
        }
      };

      const handleDownload = async () => {
        try {
          setIsGenerating(true);
          toast.loading('Preparing PDF...', { id: 'pdf-generation' });

          const organizedQuestions = await organizeQuestionsByFolderAndCategory();

          if (organizedQuestions.length === 0) {
            toast.dismiss('pdf-generation');
            toast.error('No questions available for PDF generation');
            return;
          }

          // Check for image questions
          const imageQuestions = organizedQuestions.flatMap(folder => 
            folder.categories.flatMap(cat => cat.questions.filter(q => q.type === 'image' && q.image_url))
          );
          if (imageQuestions.length > 0) {
            toast.loading('Processing images...', { id: 'image-processing' });
            
            // Pre-cache images
            await Promise.all(
              imageQuestions.map(async (q) => {
                if (q.image_url) {
                  try {
                    const response = await fetch(q.image_url);
                    if (!response.ok) throw new Error('Failed to load image');
                    await response.blob();
                  } catch (error) {
                    console.error('Error loading image:', error);
                    q.image_url = undefined;
                  }
                }
              })
            );
          }

          const blob = await pdf(
            <QuestionPDF
              title="All Questions"
              categorizedQuestions={organizedQuestions}
            />
          ).toBlob();
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'all-questions.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast.dismiss('pdf-generation');
          toast.dismiss('image-processing');
          toast.success('PDF generated successfully');
        } catch (error) {
          console.error('Error generating PDF:', error);
          toast.dismiss('pdf-generation');
          toast.dismiss('image-processing');
          toast.error('Error generating PDF. Please try again.');
        } finally {
          setIsGenerating(false);
        }
      };

      return (
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <FileDown className="h-5 w-5 mr-2" />
          )}
          Download All Questions PDF
        </button>
      );
    }
