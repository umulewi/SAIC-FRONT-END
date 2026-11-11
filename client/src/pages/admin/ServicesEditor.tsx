import { CollectionEditor } from "../../components/admin/CollectionEditor";

export function ServicesEditor() {
  return (
    <CollectionEditor
      name="services"
      title="Services"
      description="Displayed on the homepage and the Services page."
      titleKey="title"
      subtitleKey="description"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "content", label: "Detailed content", type: "textarea", rows: 5 },
        { key: "image", label: "Image", type: "image" },
        { key: "href", label: "Link", type: "text" },
      ]}
    />
  );
}
