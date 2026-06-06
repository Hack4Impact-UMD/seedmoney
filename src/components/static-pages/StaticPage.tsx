import type { ReactNode } from "react";
import styles from "./StaticPage.module.css";

type StaticPageProps = {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  wide?: boolean;
};

export function StaticPage({
  eyebrow,
  title,
  subtitle,
  children,
  wide = false,
}: StaticPageProps) {
  return (
    <article className={`${styles.page} ${wide ? styles.wide : ""}`}>
      <header className={styles.header}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      </header>
      <div className={styles.legalContent}>{children}</div>
    </article>
  );
}

export function DraftNote({ children }: { children: ReactNode }) {
  return <div className={styles.draftNote}>{children}</div>;
}

export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function StaticHtmlPage({
  html,
  wide = false,
}: {
  html: string;
  wide?: boolean;
}) {
  return (
    <article
      className={`${styles.htmlPage} ${wide ? styles.wide : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
