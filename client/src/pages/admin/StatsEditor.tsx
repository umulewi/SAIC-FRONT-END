import { CollectionEditor } from "../../components/admin/CollectionEditor";

export function StatsEditor() {
  return (
    <CollectionEditor
      name="stats"
      title="Stats Bar"
      description="The highlight numbers shown just below the hero."
      titleKey="value"
      subtitleKey="label"
      fields={[
        { key: "value", label: "Value", type: "text" },
        { key: "label", label: "Label", type: "text" },
      ]}
    />
  );
}
