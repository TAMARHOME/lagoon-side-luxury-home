import { useState } from "react";
import { useSite } from "./ListingContext";
import { SectionHeading } from "./SectionHeading";
import { OrientationToggle, VideoPlayer, type Orientation } from "./VideoPlayer";

/** Video walkthrough of the featured property. */
export function VideoTour() {
  const { featured, site } = useSite();
  const [orientation, setOrientation] = useState<Orientation>(featured.video.orientation);

  if (!site.video.show) return null;
  return (
    <section id="tour" className="relative px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={site.video.eyebrow ? `${site.video.eyebrow} · ${featured.shortLocation}` : featured.shortLocation}
            title={site.video.title}
          />
          <OrientationToggle value={orientation} onChange={setOrientation} className="self-start md:self-auto" />
        </div>

        <div className="mt-12">
          <VideoPlayer
            key={featured.id}
            url={featured.video.url}
            duration={featured.video.duration}
            orientation={orientation}
            poster={featured.photos[0]?.src ?? featured.coverSrc}
            title={featured.plainTitle}
            whatsappUrl={featured.interestUrl}
          />
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-muted-foreground md:text-base">{site.video.caption}</p>
      </div>
    </section>
  );
}
