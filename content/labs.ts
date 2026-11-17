/**
 * The "lab" behind each project on the 3D desk: what the side panel says
 * next to the thing you can play with. The overview and the tools come from
 * content/projects.ts; this adds how to use the model and a few questions
 * people tend to ask. Projects without an entry still open, with their
 * cover photo in place of a model.
 */
export type LabControl = { what: string; does: string };
export type LabQuestion = { q: string; a: string };
export type Lab = {
  slug: string;
  /** One line under the prompt, before the tabs. */
  intro: string;
  controls: LabControl[];
  questions: LabQuestion[];
};

export const labs: Lab[] = [
  {
    slug: 'sunstang-vcu-2026',
    intro: 'the real board, powered up. flip it on and run the start-up the driver goes through.',
    controls: [
      { what: 'LV switch', does: 'powers the low-voltage side: the Nucleo boots, the LCD comes on, the LV light lights.' },
      { what: 'HV switch', does: 'asks for high voltage. only counts with LV on; on its own it raises FAULT.' },
      { what: 'pre-charge', does: 'closes the pre-charge contactor (five blue LEDs), then the main contactor (five green). HVIL lights when the car is ready.' },
      { what: 'gear select', does: 'the rotary knob: N → D → R. drive and reverse only engage once HV is ready.' },
      { what: 'mode select', does: 'the toggle: READY or CHARGE.' },
      { what: 'left · hazard · right', does: 'latching lit buttons for the signals; hazard blinks both.' },
      { what: 'mouse', does: 'drag to turn the board over, scroll to zoom.' },
    ],
    questions: [
      { q: 'what does the VCU actually decide?', a: 'what the driver is asking for, whether the high-voltage system is ready, and which outputs may be enabled safely. everything else on the board exists to make those three questions answerable.' },
      { q: 'why pre-charge?', a: 'the motor controller holds a large capacitor bank. closing the main contactor straight onto it would be a near short. a resistor path charges it first (the blue LEDs), and only then does the main contactor close (the green ones).' },
      { q: 'why a Nucleo instead of a bare STM32?', a: 'the Nucleo-F302R8 brought the regulator, the programmer and a known-good layout for free, so the board could spend its risk budget on the 12V interfaces instead of the microcontroller.' },
      { q: 'what was the hardest part?', a: 'the boundary between 3.3V logic and the car’s 12V system: every input and output had to be thought through for voltage level, failure behaviour, connector access and how it would be diagnosed once installed.' },
      { q: 'what is the HVIL light?', a: 'the high-voltage interlock loop: a wire that runs through every HV connector. if any of them is unplugged the loop opens and HV is dropped. the light means the loop is closed.' },
    ],
  },
  {
    slug: 'moore-fsm-sequence-detector',
    intro: 'the DE10-Standard running the detector. feed it bits one clock at a time and watch the output latch.',
    controls: [
      { what: 'SW0', does: 'the input bit x (up = 1, down = 0).' },
      { what: 'KEY0', does: 'one clock edge: the machine reads x and moves to its next state.' },
      { what: 'KEY1', does: 'reset to S0.' },
      { what: 'keyboard', does: 'type 1 or 0 to set x and clock it in one go; r resets.' },
      { what: 'HEX0', does: 'the current state, S0–S7.' },
      { what: 'HEX5–HEX2', does: 'the last four bits you entered.' },
      { what: 'LEDR0', does: 'the output z. LEDR3–LEDR1 show the state bits.' },
    ],
    questions: [
      { q: 'which sequences?', a: 'from the lab’s student number: 1 0 1 0 turns z on, then 1 0 0 0 turns it off again. the detector is overlapping, so a stray bit does not always send you back to the start.' },
      { q: 'why a Moore machine?', a: 'in a Moore machine the output depends on the state alone, not on the input at that instant, so z is clean and changes only on a clock edge. the cost is more states: the "output on" half of the diagram is a second copy of the "output off" half.' },
      { q: 'how many flip-flops?', a: 'eight states need three D flip-flops. the state assignment that kept related states adjacent gave the cheaper next-state logic after the Karnaugh maps, so that is the one built in Quartus.' },
      { q: 'what did the waveform prove?', a: 'that z only rose after the full pattern had been clocked in, one state per edge, and stayed high until the second pattern. it was the bridge from the paper design to the FPGA.' },
    ],
  },
  {
    slug: 'the-perfect-squat',
    intro: 'the pipeline, replayed: pose keypoints, the tag on the bar, its path, and the velocity of every rep.',
    controls: [
      { what: 'space', does: 'pause and play the lifter.' },
      { what: 'overlays', does: 'toggle the skeleton, the bar path and the velocity chart at the bottom of the screen.' },
      { what: 'speed', does: 'slow the squat down to watch the phases, or speed it up.' },
    ],
    questions: [
      { q: 'what is being tracked?', a: 'two things: the lifter’s pose (YOLOv8 pose keypoints, drawn as the skeleton) and an ArUco marker taped to the end of the bar, which gives a precise point to follow frame by frame.' },
      { q: 'how is velocity measured?', a: 'the marker’s printed size is known, so pixels convert to millimetres. the distance it moves between frames, times the frame rate, is the bar speed. the sign of the vertical motion separates the descent from the drive up.' },
      { q: 'how are reps counted?', a: 'a rep is a descent followed by a rise past a rest threshold. sideways motion with little vertical change is treated as racking or unracking and ignored, so walking the bar out does not count.' },
      { q: 'why does bar path matter?', a: 'a good squat keeps the bar over the middle of the foot. the path drawn behind the marker makes any forward drift obvious, which is hard to see at full speed.' },
    ],
  },
];

export const getLab = (slug: string) => labs.find((lab) => lab.slug === slug);
