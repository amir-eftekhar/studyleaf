interface PDFCardProps {
  pdf: {
    _id: string;
    title: string;
    size: string;
    createdAt: string;
  };
  isDark?: boolean;
}

export function PDFCard({ pdf, isDark }: PDFCardProps) {
  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {pdf.title}
      </h3>
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Added {new Date(pdf.createdAt).toLocaleDateString()}</p>
        <p>{pdf.size}</p>
      </div>
    </div>
  );
} 