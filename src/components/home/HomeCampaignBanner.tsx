import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HOME_IMAGES } from "@/lib/home-images";
import { STORE } from "@/lib/config";

export function HomeCampaignBanner() {
  const [first, ...rest] = STORE.tagline.replace(/\.$/, "").split(". ");

  return (
    <section className="relative min-h-[300px] overflow-hidden bg-ink sm:min-h-[380px] lg:min-h-[440px]">
      <Image
        src={HOME_IMAGES.campaign}
        alt=""
        fill
        loading="eager"
        sizes="100vw"
        className="object-cover object-[10%_52%] sm:object-[70%_46%]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink/45 via-transparent to-transparent" />

      <div className="container-app relative z-10 flex min-h-[300px] flex-col justify-end py-10 sm:min-h-[380px] lg:min-h-[440px] lg:py-14">
        <h2 className="max-w-lg font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[0.95]">
          {first}.
          {rest.length > 0 && (
            <>
              <br />
              {rest.join(". ")}.
            </>
          )}
        </h2>
        <p className="mt-3 max-w-sm text-sm text-white/75 sm:text-[15px]">
          Equipment built for your next game.
        </p>
        <Link
          href="#categories"
          className="group mt-6 inline-flex w-fit items-center gap-2 bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-accent"
        >
          Explore collection
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
