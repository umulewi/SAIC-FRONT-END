import { CollectionEditor } from "../../components/admin/CollectionEditor";

export function ImpactAreasEditor() {
  return (
    <CollectionEditor
      name="impactAreas"
      title="Impact Areas"
      description="The three focus domains shown on the homepage and About page."
      titleKey="title"
      subtitleKey="description"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "image", label: "Image", type: "image" },
      ]}
    />
  );
}
