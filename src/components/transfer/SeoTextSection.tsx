import SeoTextHeading from "./seo/SeoTextHeading";
import SeoTextColumns from "./seo/SeoTextColumns";
import SeoFaq from "./seo/SeoFaq";
import SeoQueries from "./seo/SeoQueries";

export default function SeoTextSection() {
  return (
    <section className="py-14 border-t border-border bg-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <SeoTextHeading />

        <SeoTextColumns />

        <SeoFaq />

        <SeoQueries />

      </div>
    </section>
  );
}
