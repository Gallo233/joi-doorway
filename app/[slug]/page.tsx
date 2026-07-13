import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "../../components/projectData";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const sitePath = (path: string) => `${basePath}${path}`;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Gallo" };
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main className="project-page">
      <header className="project-detail-nav">
        <a className="wordmark" href={sitePath("/")}>GALLO</a>
        <nav aria-label="Project navigation">
          <a href={sitePath("/#work")}>WORK</a>
          <a href={sitePath("/#about")}>ABOUT</a>
          <a href={project.repo} target="_blank" rel="noreferrer">GITHUB</a>
        </nav>
      </header>

      <article>
        <section className="project-detail-hero">
          <div className="project-detail-hero-top">
            <p className="project-detail-kicker">{project.index} / {project.kind}</p>
            <h1>{project.title}</h1>
          </div>

          <div className="project-detail-summary">
            <p>{project.summary}</p>
            <dl>
              <div><dt>PERIOD</dt><dd>{project.date}</dd></div>
              <div><dt>ROLE</dt><dd>{project.role}</dd></div>
              <div><dt>QUESTION</dt><dd>{project.question}</dd></div>
            </dl>
          </div>

          <figure className="project-detail-cover">
            <img src={sitePath(project.cover)} alt={`${project.title} main visual`} />
          </figure>
        </section>

        <div className="project-detail-body">
          {project.sections.map((section) => (
            <section className="project-detail-section" key={section.heading}>
              <div>
                <p className="project-detail-kicker">{section.heading}</p>
                <h2>{section.headingZh}</h2>
              </div>
              <div className="project-detail-section-copy">
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bodyZh.map((paragraph) => <p lang="zh-CN" key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}

          <div className="project-detail-gallery">
            {project.figures.map((figure) => (
              <figure key={figure.src}>
                <img src={sitePath(figure.src)} alt={figure.alt} />
                <figcaption>{figure.caption}</figcaption>
              </figure>
            ))}
          </div>

          <a className="project-next" href={sitePath(`/${project.nextSlug}`)}>
            <span>NEXT PROJECT</span>
            <strong>{project.nextTitle}</strong>
          </a>
        </div>
      </article>
    </main>
  );
}
