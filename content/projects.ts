import { pageMetadata } from '@/lib/metadata';

export type Project = {
  /** Folder name under `app/projects/` and `public/projects/`. */
  slug: string;
  /** Title shown on the projects index card. */
  title: string;
  /** One-line summary shown on the projects index card. */
  summary: string;
  /** Card image, usually `/projects/<slug>/cover.jpg`. */
  cover: string;
  /** Optional Tailwind `object-position` class for the card image. */
  coverPosition?: string;
  tags: string[];
  /** Tools and skills listed at the end of the write-up. */
  tools: string[];
  /** The write-up's overview, as plain paragraphs (printed by the desk terminal). */
  overview: string[];
  /** Browser title + search description for the project page. */
  seo: {
    title: string;
    description: string;
  };
};

/**
 * Every project on the site, in the order shown on /projects.
 * Adding an entry here updates the projects index, the sitemap, and the
 * page metadata (via `projectMetadata`).
 */
export const projects: Project[] = [
  {
    slug: 'ratatouille',
    title: 'Ratatouille',
    summary: 'Engineering a wearable that learns and teaches you how to cook.',
    cover: '/projects/ratatouille/cover.jpg',
    tags: ['Embedded Systems', 'Computer Vision', 'AI'],
    tools: ['ESP32', 'ESP32-S3', 'C++', 'Python', 'YOLO-World', 'OpenCV', 'PyTorch', 'Pipecat', 'Deepgram', 'Silero VAD', 'Claude API', 'FastAPI', 'React', 'KiCad', 'OpenSCAD', '3D Printing'],
    overview: [
      'Built at Hack Western 13 by a team of three, Ratatouille is a chest-worn cooking coach for anyone a written recipe gets in the way of: you talk to it, its camera watches your counter, and it points a red laser at the next ingredient. An ESP32 camera and an ESP32-S3 driving pan/tilt servos, the laser and a small display stream over Wi-Fi to a Python hub on a laptop, which runs object detection, the voice pipeline, and Claude as the coach.',
      'Ask "where’s the lime?" and a local intent router moves the laser before Claude has even answered, while Pipecat, Silero VAD and Deepgram stream speech both ways so replies land in about 1 to 1.5 s. Off-the-shelf YOLO-World found almost nothing in our cheap camera’s frames, so we fine-tuned it on a few hundred of our own, taking detection from near 0% to 90–100%.',
    ],
    seo: {
      title: 'Ratatouille',
      description: 'A chest-worn cooking coach that listens, sees your counter, and points a laser at the next ingredient.',
    },
  },
  {
    slug: 'sunstang-vcu-2026',
    title: 'Sunstang VCU 2026',
    summary: 'Designing the vehicle control unit for a solar powered car.',
    cover: '/projects/sunstang-vcu-2026/thumbnail.jpeg',
    tags: ['Embedded Systems', 'PCB Design', 'Hardware'],
    tools: ["KiCad", "STM32", "Embedded C", "GPIO Control", "CAN", "UART"],
    overview: [
      "The Sunstang VCU 2026 is a custom vehicle control unit PCB developed in KiCad. It brings driver inputs, pedal interfaces, high-voltage enable logic, lighting control, safety interlocks, and vehicle state management into one low-voltage control system.",
      "The board is built around the STM32 Nucleo-F302R8. Its central engineering challenge was not simply connecting signals to a microcontroller; it was creating a dependable boundary between sensitive 3.3V logic and the car's 12V electrical system. Every input and output had to be considered in terms of voltage level, failure behavior, connector access, and how it would be diagnosed once installed in the vehicle.",
    ],
    seo: {
      title: 'Sunstang VCU 2026',
      description:
        'Designing and routing a vehicle control unit PCB for the Sunstang solar car.',
    },
  },
  {
    slug: 'the-perfect-squat',
    title: 'The Perfect Squat',
    summary:
      'Developing a computer vision program that detects the bar path of your squat.',
    cover: '/projects/the-perfect-squat/cover.jpg',
    tags: ['Computer Vision', 'Machine Learning'],
    tools: ["OpenCV", "Python", "YOLOv8", "PyTorch", "NumPy", "RoboFlow", "Google Colab"],
    overview: [
      "The Perfect Squat is a passion project that Mats Leis and I started second semester of our second year. This came about when we were discussing a LinkedIn post we both saw exploring MediaPipe's pose model detection. It got us thinking about how we could utilize these tools in our everyday lives.",
      "That's when 'The Perfect Squat' came alive.",
      "A computer vision system that analyzes barbell trajectory during a squat using the YOLOv8 pose model and OpenCV to process videos.",
    ],
    seo: {
      title: 'The Perfect Squat',
      description:
        'Building a computer vision system that measures a barbell squat path.',
    },
  },
  {
    slug: 'moore-fsm-sequence-detector',
    title: 'Moore FSM: A Sequence Detector',
    summary:
      'Designing and implementing a digital logic sequence detector with a Moore FSM.',
    cover: '/projects/moore-fsm-sequence-detector/cover.jpg',
    coverPosition: 'object-top',
    tags: ['Digital Logic', 'FPGA', 'FSM Design'],
    tools: ["Altera Quartus", "DE10-Standard", "Moore FSM", "D Flip-Flops", "Karnaugh Maps", "Boolean Algebra", "Gate-Level Design", "FPGA Implementation", "Testing", "Debugging", "Verification", "Simulation"],
    overview: [
      "This project was a complete Moore finite state machine sequence detector for ECE2277A. The circuit reads one input bit at a time, turns the output on after detecting a target four-bit sequence, and keeps that output high until a second four-bit sequence turns it back off.",
      "The interesting part was not only making the detector function. The assignment required two state-assignment strategies, Boolean simplification, gate-cost comparison, a structural implementation in Quartus, and a simulation waveform that proved the selected design behaved correctly.",
    ],
    seo: {
      title: 'Moore FSM: A Sequence Detector',
      description:
        'Designing, optimizing, and implementing a Moore finite state machine sequence detector.',
    },
  },
];

export const projectHref = (slug: string) => `/projects/${slug}`;

export function getProject(slug: string): Project {
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) {
    throw new Error(`Unknown project slug "${slug}". Add it to content/projects.ts.`);
  }
  return project;
}

/** Metadata for `app/projects/<slug>/layout.tsx`. */
export function projectMetadata(slug: string) {
  const { seo } = getProject(slug);
  return pageMetadata({ ...seo, path: projectHref(slug) });
}
