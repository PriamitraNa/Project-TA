import ContentWrapper from "../../components/ui/ContentWrapper";
import { 
  useDashboard, 
  StatisticsCards, 
  GenderChart, 
  ClassChart 
} from "../../features/admin/dashboard";

export default function DashboardAdmin() {
  const { 
    statistics, 
    genderData, 
    classData,
    isLoadingStats,
    isLoadingGender,
    isLoadingClass
  } = useDashboard();

  return (
    <>
      <ContentWrapper>
        <div className="space-y-6">
          <StatisticsCards statistics={statistics} isLoading={isLoadingStats} />
        </div>
      </ContentWrapper>

      <div className="mt-8">
        <ContentWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GenderChart data={genderData} isLoading={isLoadingGender} />
            <ClassChart data={classData} isLoading={isLoadingClass} />
          </div>
        </ContentWrapper>
      </div>
    </>
  );
}
