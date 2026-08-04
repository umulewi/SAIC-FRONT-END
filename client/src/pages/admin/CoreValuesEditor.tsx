import { CollectionEditor } from "../../components/admin/CollectionEditor";

const ICON_OPTIONS = [
  "Clock",
  "Sparkles",
  "Target",
  "Leaf",
  "Users",
  "TrendingUp",
  "ShieldCheck",
  "Handshake",
  "Sprout",
];

export function CoreValuesEditor() {
  return (
    <CollectionEditor
      name="coreValues"
      title="Core Values"
      description="The three (or more) principles shown on your homepage."
      titleKey="title"
      subtitleKey="description"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
      ]}
    />
  );
}
