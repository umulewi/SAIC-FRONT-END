import { CollectionEditor } from "../../components/admin/CollectionEditor";

export function ProgramsEditor() {
  return (
    <CollectionEditor
      name="programs"
      title="Programs"
      description="Your core programs, shown on the homepage."
      titleKey="name"
      subtitleKey="acronym"
      fields={[
        { key: "name", label: "Program name", type: "text" },
        { key: "acronym", label: "Acronym", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
