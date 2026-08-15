import { PageHeader } from "@/components/common/page-header";
import { BrowseView } from "@/components/browse/browse-view";

export default function BrowsePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Archive · Bulk Entry"
        title="Browse"
        description="Popular movies and series — mark what you've already seen, or search for a title that isn't in the popular list."
      />
      <BrowseView />
    </div>
  );
}
