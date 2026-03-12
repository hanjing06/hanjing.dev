'use client';

const tags = ["Embedded Systems", "PCB Design"];
const tools = ["KiCad",  "STM32", "Embedded C", "GPIO Control", "CAN", "UART"];

export default function SunstangPage(){
    return(
        <main className="min-h-screen">
            <section className="mx-auto max-w-[1100px] px-8 py-20 md:px-16">
            <a href="/projects"><div className="justify-start text-neutral-600">← back to projects</div></a>
            <img className="w-[550px] h-24 mt-[42px]" src="/SunstangLogo.png" />
            <div className="justify-start text-neutral-600 mt-[17px]">2026 · Sunstang Driver Controls</div>
            <div className="justify-start text-black text-3xl mt-[22px]">Sunstang VCU 2026
                <a href="https://github.com/hanjing06/Sunstang-VCU-2026.git" target="_blank"><img className="w-9 h-9 inline ml-[21px] mb-2" src="/github.png" /></a>
            </div>
            <div className="w-[1054px] h-12 justify-start text-stone-500 text-xl">Designing the vehicle control unit for a solar powered car.</div>
            <div className="flex flex-wrap gap-3">
            {tags.map((tags) => (
                <span className="bg-[#e0b24c] px-3 py-1 text-[14px] text-black">
                {tags}
                </span>
            ))}
            </div>
            <img className="w-[1081px] h-[608px] object-cover mt-[59px]" src="/SunstangThumbnail.jpeg" />
            <div className="justify-start text-black text-3xl mt-[30px]">Overview</div>
            <div className="w-[1081px] justify-start text-black text-xl mt-3">
                The Sunstang VCU 2026 is a custom-designed Vehicle Control Unit PCB developed in KiCad v6+. 
                The board integrates driver inputs, pedal interfaces, high-voltage enable logic, lighting control, safety interlocks, and vehicle state management into a centralized low-voltage control system. 
                The system is built around the STM32 Nucleo-F302R8 development board (ARM Cortex-M4, 3.3V logic). 
                This PCB acts as the hardware interface between the microcontroller (3.3V) and the vehicle’s 12V automotive systems.</div>
            <img className="w-[1047px] h-[812px] object-cover mt-[30px]" src="/SunstangHighLevel.png" />
            <div className="justify-start text-neutral-600 text-base">High-Level Diagram</div>
            <div className="justify-start text-black text-3xl mt-[30px]">Functional Responsibilites</div>
            <div className="grid grid-cols-3 mt-[18px] gap-35">
            <div className="whitespace-nowrap">
                1. Power &amp; HV Control
                <div className="indent-2 mt-2">• LV switch interface</div>
                <div className="indent-2">• HV switch interface</div>
                <div className="indent-2">• Pre-charge button input</div>
                <div className="indent-2">• Pre-charge contactor feedback</div>
                <div className="indent-2">• Main contactor feedback</div>
                <div className="indent-2">• HV active indication</div>
                <div className="indent-2">•  BMS interface signals</div></div>
            <div className="whitespace-nowrap">
                2. Driver Inputs
                <div className="indent-2 mt-2">• Accelerator pedal (ADC input)</div>
                <div className="indent-2">• Brake pedal (ADC/digital input)</div>
                <div className="indent-2">• Brake light trigger output</div></div>
            <div>
                3. Mode Control
                <div className="indent-2 mt-2">• Ready mode switch</div>
                <div className="indent-2">• Charge mode switch</div>
                <div className="indent-2">• Mode select (SPDT)</div>
                <div className="indent-2">• Gear selector (SPST)</div></div>
            </div>
            <div className="grid grid-cols-3 mt-[30px] gap-35">
            <div className="whitespace-nowrap">
                4. Lighting Control
                <div className="indent-2 mt-2">• Brake lights</div>
                <div className="indent-2">• Daytime running lights</div>
                <div className="indent-2">• Left turn signal</div>
                <div className="indent-2">• Right turn signal</div>
                <div className="indent-2">• Hazard lights</div>
                <div className="indent-2">• Rear signal outputs</div></div>
            <div className="whitespace-nowrap">
                5. Safety Inputs
                <div className="indent-2 mt-2">• HV active confirmation</div>
                <div className="indent-2">• Thermal shutdown</div>
                <div className="indent-2">• Pre-charge verification before <br/><div className="indent-5">main contactor closure</div></div></div>
            </div>
            <img className="w-[1076px] h-[806px] object-cover mt-[30px]" src="/SunstangSchematic.png" />
            <div className="justify-start text-neutral-600 text-base">PCB Schematic</div>
            <img className="w-[1084px] h-[752px] object-cover mt-[30px]" src="/SunstangPCB.png" />
            <div className="justify-start text-neutral-600 text-base">PCB Board</div>
            <img className="w-[1084px] h-[829px] object-cover mt-[30px]" src="/SunstangBoard.jpg" />
            <div className="justify-start text-neutral-600 text-base">PCB</div>
            <div className="justify-start text-black text-3xl mt-[44px]">A special thanks</div>
            <div className="w-[1081px] justify-start"><span className="text-black text-xl">I wanna give a special thank you to </span><a href="https://www.linkedin.com/in/xiuting-s/" className="underline text-[#C85A3F] transition duration-300 ease-in-out hover:text-[#f6d053]">Xiuting Shi</a><span className="text-black text-xl"> for teaching and mentoring me through the whole process. From explaining what a MOSFET is, to finalizing the design, thank you.</span></div>
            <div className="justify-start text-black text-3xl mt-[62px]">Tools &amp; Skills</div>
            <div className="flex flex-wrap gap-3 mt-[14px]">
            {tools.map((tags) => (
                <span className="bg-[#e0b24c] px-3 py-1 text-[14px] text-black">
                {tags}
                </span>
            ))}
            </div>
            </section>
        </main>
    )
}