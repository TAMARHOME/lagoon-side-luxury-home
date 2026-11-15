import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_AGENT_PHOTO } from "@/lib/listing-assets";
import type { Agent } from "@/lib/listing-content";
import { Field, Section } from "./form-parts";
import { PhotoField } from "./PhotoField";

export function AgentPanel({ agent, errors, onChange }: { agent: Agent; errors: Record<string, string>; onChange: (patch: Partial<Agent>) => void }) {
  return (
    <Section n="01" title="Agent profile" description="Shown in the host section and used for every WhatsApp booking on the website.">
      <div className="grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
        <PhotoField
          kind="agent"
          label="Profile photo"
          value={agent.photo}
          fallbackSrc={DEFAULT_AGENT_PHOTO}
          onChange={(photo) => onChange({ photo })}
          onClear={agent.photo ? () => onChange({ photo: null }) : undefined}
          clearLabel="Use original"
          error={errors["photo"]}
          aspect="aspect-[4/5]"
        />
        <div className="grid content-start gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="agent-name" label="Agent name" error={errors["name"]}>
              <Input id="agent-name" value={agent.name} onChange={(e) => onChange({ name: e.target.value })} />
            </Field>
            <Field id="agent-role" label="Job title" error={errors["role"]} hint="e.g. Lead Property Consultant">
              <Input id="agent-role" value={agent.role} onChange={(e) => onChange({ role: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="agency" label="Agency name" error={errors["agencyName"]} hint="Shown on the host card and in the copyright line">
              <Input id="agency" value={agent.agencyName} onChange={(e) => onChange({ agencyName: e.target.value })} />
            </Field>
            <Field id="wa" label="WhatsApp number" error={errors["whatsappNumber"]} hint="Country code first, digits only, e.g. 2348012345678">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+</span>
                <Input
                  id="wa"
                  inputMode="tel"
                  className="pl-7"
                  value={agent.whatsappNumber}
                  onChange={(e) => onChange({ whatsappNumber: e.target.value.replace(/[^\d]/g, "") })}
                />
              </div>
            </Field>
          </div>
          <Field id="agent-bio" label="Bio" error={errors["bio"]}>
            <Textarea id="agent-bio" rows={4} value={agent.bio} onChange={(e) => onChange({ bio: e.target.value })} />
          </Field>
        </div>
      </div>
    </Section>
  );
}
