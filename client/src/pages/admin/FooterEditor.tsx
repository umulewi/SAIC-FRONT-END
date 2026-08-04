import { SectionForm } from "../../components/admin/SectionForm";
import { Field, TextArea } from "../../components/admin/Field";
import { ListField } from "../../components/admin/ListField";

export function FooterEditor() {
  return (
    <SectionForm sectionKey="footer" title="Footer" description="Content shown in the site-wide footer.">
      {(value, setValue) => (
        <>
          <Field label="About blurb">
            <TextArea rows={3} value={value.about} onChange={(e) => setValue({ ...value, about: e.target.value })} />
          </Field>
          <ListField
            label="Company links"
            items={value.companyLinks}
            onChange={(companyLinks) => setValue({ ...value, companyLinks })}
            keys={[
              { key: "label", placeholder: "Label" },
              { key: "href", placeholder: "/path" },
            ]}
            emptyItem={{ label: "", href: "" }}
          />
          <ListField
            label="Resource links"
            items={value.resourceLinks}
            onChange={(resourceLinks) => setValue({ ...value, resourceLinks })}
            keys={[
              { key: "label", placeholder: "Label" },
              { key: "href", placeholder: "/path" },
            ]}
            emptyItem={{ label: "", href: "" }}
          />
          <Field label="Copyright text">
            <TextArea
              rows={2}
              value={value.copyright}
              onChange={(e) => setValue({ ...value, copyright: e.target.value })}
            />
          </Field>
        </>
      )}
    </SectionForm>
  );
}
