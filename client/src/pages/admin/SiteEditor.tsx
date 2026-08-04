import { SectionForm } from "../../components/admin/SectionForm";
import { Field, TextInput } from "../../components/admin/Field";
import { ListField } from "../../components/admin/ListField";

const socialPlatforms = ["facebook", "twitter", "instagram", "youtube"];

export function SiteEditor() {
  return (
    <SectionForm
      sectionKey="site"
      title="Site Settings"
      description="Global settings: branding, navigation, and social links."
    >
      {(value, setValue) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Organization short name">
              <TextInput value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} />
            </Field>
            <Field label="Logo text">
              <TextInput value={value.logoText} onChange={(e) => setValue({ ...value, logoText: e.target.value })} />
            </Field>
          </div>
          <Field label="Full organization name">
            <TextInput value={value.fullName} onChange={(e) => setValue({ ...value, fullName: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <TextInput value={value.tagline} onChange={(e) => setValue({ ...value, tagline: e.target.value })} />
          </Field>

          <ListField
            label="Navigation menu"
            items={value.nav}
            onChange={(nav) => setValue({ ...value, nav })}
            keys={[
              { key: "label", placeholder: "Label" },
              { key: "href", placeholder: "/path" },
            ]}
            emptyItem={{ label: "", href: "" }}
          />

          <Field label="Social media links">
            <div className="grid gap-3 sm:grid-cols-2">
              {socialPlatforms.map((platform) => (
                <TextInput
                  key={platform}
                  placeholder={`https://${platform}.com/...`}
                  value={value.social[platform] ?? ""}
                  onChange={(e) => setValue({ ...value, social: { ...value.social, [platform]: e.target.value } })}
                />
              ))}
            </div>
          </Field>
        </>
      )}
    </SectionForm>
  );
}
