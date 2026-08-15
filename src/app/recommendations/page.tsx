import { PageHeader } from "@/components/common/page-header";
import { RecommendationsGrid } from "@/components/recommendations/recommendations-grid";

export default function RecommendationsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Intelligence · Cold Start"
        title="Recommendations"
        description="Seeded with acclaimed titles from IMDb's highest-rated movies and series. Mark what you've already seen as watched to start building your profile — once there's real watch history, this list will be generated from it instead."
      />
      <RecommendationsGrid />
    </div>
  );
}
