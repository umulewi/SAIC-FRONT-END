import { SectionForm } from "../../components/admin/SectionForm";
import { Field, TextInput, TextArea } from "../../components/admin/Field";

export function ContactEditor() {
  return (
    <SectionForm sectionKey="contact" title="Contact Information" description="Shown in the footer and on the Contact page.">
      {(value, setValue) => (
        <>
          <Field label="Email">
            <TextInput value={value.email} onChange={(e) => setValue({ ...value, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <TextInput value={value.phone} onChange={(e) => setValue({ ...value, phone: e.target.value })} />
          </Field>
          <Field label="Address">
            <TextArea rows={2} value={value.address} onChange={(e) => setValue({ ...value, address: e.target.value })} />
          </Field>
          <Field label="Google Maps embed URL" hint="Paste the src URL from a Google Maps embed iframe">
            <TextInput
              value={value.mapEmbedUrl}
              onChange={(e) => setValue({ ...value, mapEmbedUrl: e.target.value })}
            />
          </Field>
        </>
      )}
    </SectionForm>
  );
}
