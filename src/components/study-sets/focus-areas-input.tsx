'use client'

interface FocusAreasInputProps {
  isDark: boolean;
  onFocusAreaAdd: (area: string) => void;
  onStrugglingTopicAdd: (topic: string) => void;
}

export default function FocusAreasInput({ isDark, onFocusAreaAdd, onStrugglingTopicAdd }: FocusAreasInputProps) {
  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className={`block mb-2 text-purple-600 font-medium`}>
          Focus Areas
        </label>
        <input
          type="text"
          placeholder="Add focus areas (comma-separated)"
          className={`w-full px-4 py-2 rounded-lg ${
            isDark 
              ? 'bg-gray-800 text-purple-300 border-gray-700' 
              : 'bg-white text-purple-900 border-purple-200'
          } border focus:ring-2 focus:ring-purple-500`}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              onFocusAreaAdd(input.value);
              input.value = '';
            }
          }}
        />
      </div>
      <div>
        <label className={`block mb-2 text-purple-600 font-medium`}>
          Topics You're Struggling With
        </label>
        <input
          type="text"
          placeholder="Add struggling topics (comma-separated)"
          className={`w-full px-4 py-2 rounded-lg ${
            isDark 
              ? 'bg-gray-800 text-purple-300 border-gray-700' 
              : 'bg-white text-purple-900 border-purple-200'
          } border focus:ring-2 focus:ring-purple-500`}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              onStrugglingTopicAdd(input.value);
              input.value = '';
            }
          }}
        />
      </div>
    </div>
  );
}
