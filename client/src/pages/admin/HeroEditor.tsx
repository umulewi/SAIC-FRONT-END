import { SectionForm } from "../../components/admin/SectionForm";
import { Field, TextInput, TextArea } from "../../components/admin/Field";
import { ImageField } from "../../components/admin/ImageField";
import { VideoField } from "../../components/admin/VideoField";

export function HeroEditor() {
  return (
    <SectionForm sectionKey="hero" title="Hero Section" description="The first thing visitors see on your homepage.">
      {(value, setValue) => (
        <>
          <Field label="Eyebrow badge">
            <TextInput value={value.eyebrow} onChange={(e) => setValue({ ...value, eyebrow: e.target.value })} />
          </Field>
          <Field label="Headline">
            <TextInput value={value.headline} onChange={(e) => setValue({ ...value, headline: e.target.value })} />
          </Field>
          <Field label="Subheadline">
            <TextArea
              rows={3}
              value={value.subheadline}
              onChange={(e) => setValue({ ...value, subheadline: e.target.value })}
            />
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
          <ImageField label="Hero image" value={value.image} onChange={(url) => setValue({ ...value, image: url })} />
          <VideoField label="Hero video (optional)" value={value.video} onChange={(url) => setValue({ ...value, video: url })} />
        </>
      )}
    </SectionForm>
  );
}
