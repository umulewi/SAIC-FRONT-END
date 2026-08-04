import { SectionForm } from "../../components/admin/SectionForm";
import { Field, TextInput, TextArea } from "../../components/admin/Field";

export function CtaEditor() {
  return (
    <SectionForm sectionKey="cta" title="Call to Action" description="The closing banner shown near the bottom of pages.">
      {(value, setValue) => (
        <>
          <Field label="Headline">
            <TextInput value={value.headline} onChange={(e) => setValue({ ...value, headline: e.target.value })} />
          </Field>
          <Field label="Body text">
            <TextArea rows={3} value={value.body} onChange={(e) => setValue({ ...value, body: e.target.value })} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Primary button label">
              <TextInput
                value={value.primaryCta.label}
                onChange={(e) => setValue({ ...value, primaryCta: { ...value.primaryCta, label: e.target.value } })}
              />
            </Field>
            <Field label="Primary button link">
              <TextInput
                value={value.primaryCta.href}
                onChange={(e) => setValue({ ...value, primaryCta: { ...value.primaryCta, href: e.target.value } })}
              />
            </Field>
            <Field label="Secondary button label">
              <TextInput
                value={value.secondaryCta.label}
                onChange={(e) =>
                  setValue({ ...value, secondaryCta: { ...value.secondaryCta, label: e.target.value } })
                }
              />
            </Field>
            <Field label="Secondary button link">
              <TextInput
                value={value.secondaryCta.href}
                onChange={(e) =>
                  setValue({ ...value, secondaryCta: { ...value.secondaryCta, href: e.target.value } })
                }
              />
            </Field>
          </div>
        </>
      )}
    </SectionForm>
  );
}
