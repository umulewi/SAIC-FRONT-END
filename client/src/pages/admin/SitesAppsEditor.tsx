import { CollectionEditor } from "../../components/admin/CollectionEditor";

export function SitesAppsEditor() {
  return (
    <CollectionEditor
      name="sitesApps"
      title="Sites & Apps"
      description="Websites and applications listed on the public Sites & Apps page."
      titleKey="title"
      subtitleKey="url"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "url", label: "Link URL", type: "text" },
        { key: "image", label: "Thumbnail image", type: "image" },
      ]}
    />
  );
}
