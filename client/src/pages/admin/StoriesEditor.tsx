import { CollectionEditor } from "../../components/admin/CollectionEditor";

export function StoriesEditor() {
  return (
    <CollectionEditor
      name="stories"
      title="Stories from the Field"
      description="News, event highlights, and stories shown on the Gallery page. Each has its own detail page."
      titleKey="title"
      subtitleKey="category"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "category", label: "Category", type: "text" },
        { key: "date", label: "Date", type: "text" },
        { key: "image", label: "Cover image", type: "image" },
        { key: "excerpt", label: "Short excerpt", type: "textarea", rows: 2 },
        { key: "content", label: "Full story (one paragraph per line)", type: "textarea", rows: 10 },
      ]}
    />
  );
}
