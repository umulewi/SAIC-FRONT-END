import { CollectionEditor } from "../../components/admin/CollectionEditor";

export function JobOpeningsEditor() {
  return (
    <CollectionEditor
      name="jobOpenings"
      title="Job Openings"
      description="Open roles shown on the Careers page. Each gets its own page with an application form."
      titleKey="title"
      subtitleKey="location"
      fields={[
        { key: "title", label: "Role title", type: "text" },
        { key: "location", label: "Location", type: "text" },
        { key: "type", label: "Type (e.g. Full-time, Contract)", type: "text" },
        { key: "description", label: "Full description (one paragraph per line)", type: "textarea", rows: 10 },
      ]}
    />
  );
}
