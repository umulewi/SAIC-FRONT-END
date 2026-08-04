import { SectionForm } from "../../components/admin/SectionForm";
import { Field, TextInput, TextArea } from "../../components/admin/Field";
import { ImageField } from "../../components/admin/ImageField";
import { ListField } from "../../components/admin/ListField";

export function AboutEditor() {
  return (
    <SectionForm sectionKey="about" title="About Section" description="Tells your organization's story on the homepage and About page.">
      {(value, setValue) => (
        <>
          <Field label="Eyebrow badge">
            <TextInput value={value.eyebrow} onChange={(e) => setValue({ ...value, eyebrow: e.target.value })} />
          </Field>
          <Field label="Headline">
            <TextInput value={value.headline} onChange={(e) => setValue({ ...value, headline: e.target.value })} />
          </Field>
          <Field label="Body text">
            <TextArea rows={5} value={value.body} onChange={(e) => setValue({ ...value, body: e.target.value })} />
          </Field>
          <ImageField label="Image" value={value.image} onChange={(url) => setValue({ ...value, image: url })} />
          <ListField
            label="Highlight stats"
            items={value.stats}
            onChange={(stats) => setValue({ ...value, stats })}
            keys={[
              { key: "value", placeholder: "5+" },
              { key: "label", placeholder: "Years of Impact" },
            ]}
            emptyItem={{ value: "", label: "" }}
          />
        </>
      )}
    </SectionForm>
  );
}
