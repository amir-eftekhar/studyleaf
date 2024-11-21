interface NoteCardProps {
  note: {
    _id: string;
    title: string;
    preview: string;
    createdAt: string;
  };
  isDark?: boolean;
}

export function NoteCard({ note, isDark }: NoteCardProps) {
  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {note.title}
      </h3>
      <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {note.preview}
      </p>
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Created {new Date(note.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
} 