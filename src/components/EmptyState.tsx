interface EmptyStateProps {
  type: 'sets' | 'pdfs' | 'lectures' | 'notes' | 'saved';
  isDark: boolean;
  userName: string;
}

export function EmptyState({ type, isDark, userName }: EmptyStateProps) {
  const emptyStates = {
    sets: {
      title: "No Study Sets Yet",
      message: `${userName}, your study set collection is looking a bit empty. Ready to create your first masterpiece?`,
      action: "Create Your First Set"
    },
    pdfs: {
      title: "PDF Library Empty",
      message: `${userName}, start building your digital library by uploading your first PDF!`,
      action: "Upload PDF"
    },
    lectures: {
      title: "No Recorded Lectures",
      message: `${userName}, capture your first lecture and let AI help you take notes!`,
      action: "Record Lecture"
    },
    notes: {
      title: "Notes Looking Empty",
      message: `${userName}, your notebook is ready for your first brilliant idea!`,
      action: "Create Note"
    },
    saved: {
      title: "No Saved Sets",
      message: `${userName}, discover and save study sets from our community to build your collection!`,
      action: "Explore Sets"
    }
  };

  const content = emptyStates[type];

  return (
    <div className={`text-center py-16 px-4 rounded-2xl ${
      isDark 
        ? 'bg-gray-800/50 border border-gray-700' 
        : 'bg-white/70 border border-purple-100'
    } backdrop-blur-sm`}>
      <div className="max-w-md mx-auto">
        <h3 className={`text-2xl font-medium mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {content.title}
        </h3>
        <p className={`mb-8 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {content.message}
        </p>
        <button
          className="inline-flex items-center px-6 py-3 rounded-xl text-white font-medium
          bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700
          transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-purple-500 shadow-lg"
        >
          {content.action}
        </button>
      </div>
    </div>
  );
} 