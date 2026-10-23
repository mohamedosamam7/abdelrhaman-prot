import Link from "next/link";
import { Suspense } from "react";
import { ContactCTA } from "@/components/ContactCTA";
import { ArrowRight } from "@/components/Icons";
import { fullName, site } from "@/content/site";
import { ServiceContext } from "./ServiceContext";
import { pageMetadata } from "@/lib/metadata";
import styles from "./contact.module.css";

export const metadata = pageMetadata(
  "Contact",
  `Start a photography project with ${fullName}, ${site.location.city}. Message on Instagram or view more work on Behance.`,
);

export default function ContactPage() {
  return (
    <div className={`theme-dark ${styles.page}`}>
      <ContactCTA
        as="h1"
        details
        context={
          <Suspense fallback={null}>
            <ServiceContext className={styles.service} />
          </Suspense>
        }
        footer={
          <nav className={styles.back} aria-label="Continue browsing">
            <Link href="/work" className={styles.backLink}>
              See the work <ArrowRight size={15} />
            </Link>
            <Link href="/" className={styles.backLink}>
              Back to home <ArrowRight size={15} />
            </Link>
          </nav>
        }
      />
    </div>
  );
}
