import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getFeatured, type SiteContent, type SiteSettings } from "@/lib/listing-content";
import { resolveAgent, resolveProperty, type ResolvedAgent, type ResolvedProperty } from "@/lib/listing-assets";

type SiteValue = {
  content: SiteContent;
  site: SiteSettings;
  agent: ResolvedAgent;
  properties: ResolvedProperty[];
  featured: ResolvedProperty;
  openProperty: (id: string) => void;
};

const SiteCtx = createContext<SiteValue | null>(null);

export function SiteProvider({
  content,
  openProperty,
  children,
}: {
  content: SiteContent;
  openProperty: (id: string) => void;
  children: ReactNode;
}) {
  const value = useMemo(() => {
    const number = content.agent.whatsappNumber;
    const properties = content.properties.map((p) => resolveProperty(p, number, content.site.amenityText));
    const featuredId = getFeatured(content).id;
    return {
      content,
      site: content.site,
      agent: resolveAgent(content.agent, content.site.brand.enquiryMessage),
      properties,
      featured: properties.find((p) => p.id === featuredId) ?? properties[0]!,
      openProperty,
    };
  }, [content, openProperty]);
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite(): SiteValue {
  const value = useContext(SiteCtx);
  if (!value) throw new Error("useSite must be used inside <SiteProvider>");
  return value;
}
