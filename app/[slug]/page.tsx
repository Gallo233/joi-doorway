import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "../../components/projectData";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {
      title: "All Joi",
    };
  }

  return {
    title: `${project.title} - All Joi`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const characters = project.summary.length + project.sections.flatMap((section) => section.body).join("").length;

  return (
    <main className="project-page">
      <div className="site-grid-overlay project-grid-overlay" aria-hidden="true" />
      <header className="project-detail-hud" aria-label="All Joi project navigation">
        <a className="brand" href="/?skipIntro=1" aria-label="All Joi home">
          <span className="brand-mark">J</span>
          <span>ALL JOI</span>
        </a>
        <nav aria-label="Project navigation">
          <a href="/?skipIntro=1#work">WORK</a>
          <a href="/?skipIntro=1#contact">CONTACT</a>
          <a href={project.repo} target="_blank" rel="noopener noreferrer">
            GITHUB
          </a>
        </nav>
      </header>

      <article className="project-article">
        <p className="project-kind">{project.kind}</p>
        <h1>{project.title}</h1>
        <div className="project-date-row">
          <span>{project.date}</span>
          <span>{project.years}</span>
        </div>
        <p className="project-summary">{project.summary}</p>

        <div className="project-figure-grid">
          {project.figures.map((figure) => (
            <figure key={figure.src}>
              <img src={figure.src} alt={figure.alt} />
              <figcaption>{figure.caption}</figcaption>
            </figure>
          ))}
        </div>

        <aside className="project-metadata" aria-label="Project metadata">
          <h2>Metadata</h2>
          <dl>
            <div>
              <dt>Last Updated</dt>
              <dd>{project.date}</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>{project.dimensions}</dd>
            </div>
            <div>
              <dt>Characters</dt>
              <dd>{characters}</dd>
            </div>
            <div>
              <dt>Links</dt>
              <dd>
                <a href="/?skipIntro=1">Home</a>
                <a href="/?skipIntro=1#work">Work</a>
                <a href={project.repo} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </dd>
            </div>
          </dl>
        </aside>

        <nav className="project-toc" aria-label="Page table of contents">
          {project.sections.map((section) => (
            <a key={section.heading} href={`#${slugify(section.heading)}`}>
              {section.heading}
            </a>
          ))}
        </nav>

        {project.sections.map((section) => (
          <section className="project-copy-section" id={slugify(section.heading)} key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.code ? (
              <pre>
                <code>{section.code}</code>
              </pre>
            ) : null}
          </section>
        ))}
      </article>

      <footer className="project-footer-hud" aria-hidden="true">
        <span>GMT+8 CN</span>
        <span>0720 X 0450 Y</span>
      </footer>
    </main>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
