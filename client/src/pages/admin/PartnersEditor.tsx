import { CollectionEditor } from "../../components/admin/CollectionEditor";

export function PartnersEditor() {
  return (
    <CollectionEditor
      name="partners"
      title="Partners"
      description="Organizations shown in the partners strip."
      titleKey="name"
      fields={[
        { key: "name", label: "Partner name", type: "text" },
        { key: "logo", label: "Logo", type: "image" },
      ]}
    />
  );
}
