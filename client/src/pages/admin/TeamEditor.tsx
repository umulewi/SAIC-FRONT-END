import { CollectionEditor } from "../../components/admin/CollectionEditor";

export function TeamEditor() {
  return (
    <CollectionEditor
      name="team"
      title="Team"
      description="Shown on the Team page."
      titleKey="name"
      subtitleKey="role"
      fields={[
        { key: "name", label: "Full name", type: "text" },
        { key: "role", label: "Role", type: "text" },
        { key: "photo", label: "Photo", type: "image" },
        { key: "bio", label: "Bio", type: "textarea" },
      ]}
    />
  );
}
