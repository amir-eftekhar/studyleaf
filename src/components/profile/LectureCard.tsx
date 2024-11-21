interface LectureCardProps {
  lecture: {
    _id: string;
    title: string;
    duration: string;
    createdAt: string;
  };
  isDark?: boolean;
}

export function LectureCard({ lecture, isDark }: LectureCardProps) {
  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {lecture.title}
      </h3>
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Recorded {new Date(lecture.createdAt).toLocaleDateString()}</p>
        <p>{lecture.duration}</p>
      </div>
    </div>
  );
} 