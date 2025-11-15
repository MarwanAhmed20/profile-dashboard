import { getInitials } from "../../utils/getInitials";

export default function StudentHeader({ student }) {
  const fullName = `${student?.user?.first_name || ''} ${student?.user?.last_name || ''}`.trim() || 'Unknown Student';
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
          {getInitials(fullName)}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
          <div className="flex gap-4 text-sm opacity-90">
            <span>📧 {student?.user?.email || 'N/A'}</span>
            <span>🆔 {student?.student_id || 'N/A'}</span>
            <span>🎓 {student?.grade_level || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
