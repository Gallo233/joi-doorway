export type ProjectSection = {
  heading: string;
  body: string[];
  code?: string;
};

export type ProjectFigure = {
  src: string;
  alt: string;
  caption: string;
};

export type ProjectCase = {
  slug: string;
  title: string;
  date: string;
  years: string;
  kind: string;
  repo: string;
  summary: string;
  dimensions: string;
  characterCount: string;
  figures: ProjectFigure[];
  sections: ProjectSection[];
};

export const projects: ProjectCase[] = [
  {
    slug: "joi",
    title: "Joi",
    date: "July 2026",
    years: "2026",
    kind: "Desktop companion",
    repo: "https://github.com/Gallo233/Joi",
    dimensions: "local agent / Windows shell",
    characterCount: "planner, memory, tools",
    summary:
      "Joi is the core desktop companion: a local multimodal agent with planner, memory, policy gates, tool registry, screen watching, Codex/browser/game/MCP adapters, and a character-fronted shell.",
    figures: [
      {
        src: "/assets/joi-app-v3.png",
        alt: "Joi App character reference",
        caption: "Joi App keeps amber eyes and the desktop outfit, with no side braid.",
      },
      {
        src: "/assets/project-thumbs/joi-autopilot-thumb.png",
        alt: "Local agent loop thumbnail",
        caption: "The desktop line is designed as a practical local command surface.",
      },
    ],
    sections: [
      {
        heading: "Role",
        body: [
          "Joi is not just a chat window. She is the home base for local work: watching context, choosing tools, planning steps, and asking for approval before risky actions.",
          "The character layer matters because the product is meant to feel like a real working partner, not a detached operations dashboard.",
        ],
      },
      {
        heading: "Architecture",
        body: [
          "The current direction centers on a Windows-first shell with a policy gate, persistent memory, and adapter boundaries for Codex, browsers, games, and MCP tools.",
          "The interface should stay warm and ordinary even when the internal capabilities are complex.",
        ],
        code: "planner -> policy gate -> tool registry -> action adapter -> review\nmemory -> context -> character shell -> user approval",
      },
    ],
  },
  {
    slug: "joi-map",
    title: "Joi Map",
    date: "July 2026",
    years: "2026",
    kind: "World-facing guide",
    repo: "https://github.com/Gallo233/aiguide-ios",
    dimensions: "SwiftUI / MapKit / voice",
    characterCount: "location, vision, itinerary",
    summary:
      "Joi Map turns Joi into an on-site guide: location-aware narration, nearby recommendations, photo recognition, itinerary planning, search, localization, voice, and map-style paths.",
    figures: [
      {
        src: "/assets/joi-map-v3.png",
        alt: "Joi Map character reference",
        caption: "The side braid and coral ribbon are the Map-only identity marker.",
      },
      {
        src: "/assets/joi-map-main-ui.png",
        alt: "Joi Map interface reference",
        caption: "The map surface should feel like a companion moving with you through a place.",
      },
    ],
    sections: [
      {
        heading: "Field Presence",
        body: [
          "Joi Map is the version of Joi that steps toward the physical world. She does not just show locations; she explains where you are and why a place might matter.",
          "The design language should feel sunny and useful, never like a sci-fi navigation cockpit.",
        ],
      },
      {
        heading: "Core Loop",
        body: [
          "Locate, understand, narrate, recommend, and remember. The iOS MVP explores how MapKit, camera input, voice, and itinerary states can become one companion flow.",
        ],
      },
    ],
  },
  {
    slug: "doorway",
    title: "Joi Doorway",
    date: "July 2026",
    years: "2026",
    kind: "Personal site entrance",
    repo: "https://github.com/Gallo233/joi-doorway",
    dimensions: "Next.js / video / gesture",
    characterCount: "phone, knock, peephole, handle",
    summary:
      "Joi Doorway is the ritual entrance for the personal site: tap Joi Map, hear three knocks, approach the peephole, watch the generated doorway video, then drag the original video handle pixels to enter.",
    figures: [
      {
        src: "/assets/door-handle-final-frame.png",
        alt: "Door handle final frame",
        caption: "The handle interaction is cut from the final video frame so the seam stays invisible.",
      },
      {
        src: "/assets/doorway-bg.png",
        alt: "Door approach frame",
        caption: "The front-door sequence keeps the experience warm and domestic.",
      },
    ],
    sections: [
      {
        heading: "Interaction Contract",
        body: [
          "The entrance should feel like a small game performance rather than a portfolio preloader. Every transition has to earn the next one.",
          "The important seam is the video-to-handle handoff: the user should feel that the filmed handle became interactive, not that a random 3D prop appeared.",
        ],
      },
      {
        heading: "Current State",
        body: [
          "The first pass now runs inside a Next.js shell while preserving the original phone, peephole, video, and pixel-handle state machine.",
        ],
      },
    ],
  },
  {
    slug: "autopilot",
    title: "Joi Autopilot",
    date: "July 2026",
    years: "2026",
    kind: "Build loop control",
    repo: "https://github.com/Gallo233/joi-autopilot-control-center",
    dimensions: "Codex / worktrees / approval",
    characterCount: "design, develop, test, review",
    summary:
      "Joi Autopilot is a local control center for design-to-develop-to-test-to-review loops, keeping the user in charge at the commit boundary.",
    figures: [
      {
        src: "/assets/project-thumbs/joi-autopilot-thumb.png",
        alt: "Joi Autopilot thumbnail",
        caption: "A control center for running product work without losing human taste.",
      },
    ],
    sections: [
      {
        heading: "Why It Exists",
        body: [
          "As the Joi ecosystem grows, building it also needs a companion. Autopilot is the tool for orchestrating local branches, agents, tests, reviews, and handoffs.",
        ],
      },
      {
        heading: "Boundary",
        body: [
          "Automation can draft, test, and compare, but commit-level approval should remain human. That boundary is part of the product philosophy.",
        ],
        code: "brief -> plan -> worktree -> implementation -> test -> review -> approval",
      },
    ],
  },
  {
    slug: "quant-ai",
    title: "quant-ai",
    date: "July 2026",
    years: "2026",
    kind: "Market analysis assistant",
    repo: "https://github.com/Gallo233/quant-ai",
    dimensions: "FastAPI / Vue / LLM",
    characterCount: "market data, indicators, backtests",
    summary:
      "quant-ai explores an analytical side of the ecosystem: market data, indicators, LLM commentary, strategy generation, and backtesting.",
    figures: [
      {
        src: "/assets/project-thumbs/quant-ai-thumb.png",
        alt: "quant-ai dashboard thumbnail",
        caption: "A finance surface for turning signals into reviewable analysis.",
      },
    ],
    sections: [
      {
        heading: "Product Shape",
        body: [
          "This project is less character-first and more tool-first, but it still belongs in All Joi because it explores how AI reasoning can sit beside structured data.",
        ],
      },
      {
        heading: "Loop",
        body: [
          "Pull market data, compute indicators, ask the model to explain context, generate strategy candidates, then backtest and compare.",
        ],
      },
    ],
  },
  {
    slug: "sitianjian",
    title: "司天监夜话",
    date: "July 2026",
    years: "2026",
    kind: "Story-world experiment",
    repo: "https://github.com/Gallo233/sitianjian",
    dimensions: "Godot / Dialogic / bilingual",
    characterCount: "visual novel, time messages",
    summary:
      "司天监夜话 is a bilingual visual novel experiment around ancient-China time messages, divination, changing fate, and emotional story-world building.",
    figures: [
      {
        src: "/assets/project-thumbs/sitianjian-thumb.png",
        alt: "司天监夜话 thumbnail",
        caption: "The story layer keeps Joi from becoming only a utility stack.",
      },
    ],
    sections: [
      {
        heading: "Story Layer",
        body: [
          "All Joi needs a world, not only tools. This project explores tone, pacing, dialogue, and a time-message mechanic that can carry character emotion.",
        ],
      },
      {
        heading: "Why It Belongs Here",
        body: [
          "The same companion idea can appear as software, map guide, build assistant, or story presence. 司天监夜话 holds the mythic edge of that idea.",
        ],
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
