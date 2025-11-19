import StudentAnalysisSection from "./StudentAnalysisSection";

export default function StudentAnalysisTab({ student, domainScores, strengthsWeaknessesData, weeklyProgressData }) {
  return (
    <StudentAnalysisSection 
      domainScores={domainScores} 
      strengthsWeaknessesData={strengthsWeaknessesData}
      weeklyProgressData={weeklyProgressData}
    />
  );
}
