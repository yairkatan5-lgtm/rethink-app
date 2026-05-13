const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageBreak, ExternalHyperlink, LevelFormat
} = require('docx');
const fs = require('fs');

// ── Helpers ──
const pt = (n) => n * 2; // half-points
const dxa = (inches) => Math.round(inches * 1440);

const BLUE = "1F4E79";
const LIGHT_BLUE = "2E75B6";
const LS = { line: 360, lineRule: "auto" }; // 1.5 line spacing (360 = 1.5 × 240 twips)
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function heading(text) {
  return new Paragraph({
    spacing: { before: 240, after: 120, ...LS },
    children: [new TextRun({ text, bold: true, size: pt(14), font: "Times New Roman", color: "1F4E79" })]
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 0, after: 120, ...LS },
    alignment: opts.justify ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
    children: [new TextRun({ text, size: pt(12), font: "Times New Roman" })]
  });
}

function bodyBold(label, rest) {
  return new Paragraph({
    spacing: { before: 80, after: 80, ...LS },
    children: [
      new TextRun({ text: label, bold: true, size: pt(12), font: "Times New Roman" }),
      new TextRun({ text: rest, size: pt(12), font: "Times New Roman" })
    ]
  });
}

function numbered(num, label, text) {
  return new Paragraph({
    spacing: { before: 80, after: 80, ...LS },
    indent: { left: dxa(0.25) },
    children: [
      new TextRun({ text: `${num}. `, bold: true, size: pt(12), font: "Times New Roman" }),
      new TextRun({ text: label, bold: true, size: pt(12), font: "Times New Roman" }),
      new TextRun({ text: ` ${text}`, size: pt(12), font: "Times New Roman" })
    ]
  });
}

function reference(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60, ...LS },
    indent: { left: dxa(0.5), hanging: dxa(0.5) },
    children: [new TextRun({ text, size: pt(12), font: "Times New Roman" })]
  });
}

function spacer() {
  return new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun("")] });
}

// ── COM-B table ──
function comBTable() {
  const cellStyle = (fill, text, bold) => new TableCell({
    borders,
    width: { size: dxa(2.8), type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: bold || false, size: pt(11), font: "Times New Roman" })] })]
  });

  const wideCell = (fill, text, bold) => new TableCell({
    borders,
    width: { size: dxa(5.96), type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: bold || false, size: pt(11), font: "Times New Roman" })] })]
  });

  return new Table({
    width: { size: dxa(8.76), type: WidthType.DXA },
    columnWidths: [dxa(2.8), dxa(5.96)],
    rows: [
      new TableRow({ children: [
        cellStyle("2E75B6", "COM-B Component", true),
        cellStyle("2E75B6", "Behavioral Barrier", true),
      ]}),
      new TableRow({ children: [
        cellStyle("DEEAF1", "Capability (Psychological)"),
        wideCell(null, "Users lack real-time awareness of spending patterns relative to their baseline. Individual transactions feel inconsequential, making it hard to connect them to aggregate financial outcomes.")
      ]}),
      new TableRow({ children: [
        cellStyle("DEEAF1", "Opportunity (Physical)"),
        wideCell(null, "Frictionless UX removes natural decision points. One-tap checkout, saved credentials, and 24/7 availability eliminate the pauses that cash or card-swipe once provided.")
      ]}),
      new TableRow({ children: [
        cellStyle("DEEAF1", "Motivation (Automatic)"),
        wideCell(null, "Present bias causes users to overweight immediate rewards over future wellbeing. Dopamine responses to desired items override rational deliberation.")
      ]}),
    ]
  });
}

// ── APEASE table ──
function apeaseTable() {
  const hdr = (text) => new TableCell({
    borders,
    width: { size: dxa(1.46), type: WidthType.DXA },
    shading: { fill: "2E75B6", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: pt(11), font: "Times New Roman", color: "FFFFFF" })] })]
  });
  const scoreCell = (text) => new TableCell({
    borders,
    width: { size: dxa(0.8), type: WidthType.DXA },
    shading: { fill: "E2EFDA", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, size: pt(11), font: "Times New Roman", color: "375623" })] })]
  });
  const ratCell = (text) => new TableCell({
    borders,
    width: { size: dxa(6.5), type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: pt(11), font: "Times New Roman" })] })]
  });

  const rows = [
    ["Affordability", "High", "Software-only; no physical infrastructure required."],
    ["Practicability", "High", "Implementable as mobile overlay via iOS/Android payment SDKs."],
    ["Effectiveness", "High", "Temporal friction robustly reduces impulsive choice (Frederick et al., 2002)."],
    ["Acceptability", "High", "Opt-in; user retains full control and may override at any point."],
    ["Side-effects", "Low", "No coercion; friction applies only to discretionary purchases."],
    ["Equity", "High", "Applicable across all income levels; requires only a smartphone."],
  ];

  return new Table({
    width: { size: dxa(8.76), type: WidthType.DXA },
    columnWidths: [dxa(1.46), dxa(0.8), dxa(6.5)],
    rows: [
      new TableRow({ children: [hdr("Criterion"), hdr("Score"), hdr("Rationale")] }),
      ...rows.map(([c, s, r]) => new TableRow({ children: [
        new TableCell({ borders, width: { size: dxa(1.46), type: WidthType.DXA }, shading: { fill: "DEEAF1", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: c, bold: true, size: pt(11), font: "Times New Roman" })] })] }),
        scoreCell(s),
        ratCell(r)
      ]}))
    ]
  });
}

// ── Document ──
const doc = new Document({
  numbering: {
    config: [
      { reference: "nums", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: dxa(0.5), hanging: dxa(0.25) } } } }] }
    ]
  },
  styles: {
    default: { document: { run: { font: "Times New Roman", size: pt(12) } } }
  },
  sections: [
    // ── COVER PAGE ──
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: dxa(1), right: dxa(1), bottom: dxa(1), left: dxa(1) }
        }
      },
      children: [
        new Paragraph({ spacing: { before: dxa(1.5), after: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Rethink", bold: true, size: pt(32), font: "Times New Roman", color: BLUE })] }),
        new Paragraph({ spacing: { before: 0, after: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "AI-Powered Payment Friction", bold: true, size: pt(20), font: "Times New Roman", color: LIGHT_BLUE })] }),
        spacer(),
        new Paragraph({ spacing: { before: 160, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Product Requirements Document", size: pt(14), font: "Times New Roman" })] }),
        spacer(),
        spacer(),
        new Paragraph({ spacing: { before: 160, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Course: Behavioral Economics From Theory to Practice", size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Instructors: Dr. Yossi Hasson & Mr. Tomer Toueg", size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Reichman University — Tiomkin School of Economics", size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Baruch Ivcher School of Psychology", size: pt(12), font: "Times New Roman" })] }),
        spacer(),
        spacer(),
        new Paragraph({ spacing: { before: 160, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Students:", bold: true, size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Yoav Aviram  |  ID: 316522721", size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Yair Katan  |  ID: 313559692", size: pt(12), font: "Times New Roman" })] }),
        spacer(),
        new Paragraph({ spacing: { before: 160, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "May 2026", size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ]
    },

    // ── MAIN DOCUMENT ──
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: dxa(1), right: dxa(1), bottom: dxa(1), left: dxa(1) }
        }
      },
      children: [
        // Problem Definition
        heading("Problem Definition"),
        new Paragraph({
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({ text: "Domain: ", bold: true, size: pt(12), font: "Times New Roman" }),
            new TextRun({ text: "Financial Behavior", italics: true, size: pt(12), font: "Times New Roman" })
          ]
        }),
        body("Digital payments have systematically eliminated the \"pain of paying\" — the psychological discomfort that cash transactions once provided as a natural brake on spending. One-tap checkout, stored payment credentials, and invisible micro-transactions have removed all friction from the purchase moment. Research shows consumers spend significantly more when paying digitally versus with cash (Prelec & Loewenstein, 1998), and impulsive online purchases account for the majority of e-commerce volume. The behavioral challenge is that the architecture of digital commerce is designed to minimize deliberation, exploiting present bias and making the long-term cost of a purchase invisible at the moment of decision. Rethink addresses this by reintroducing targeted, AI-personalized friction before digital payment completion.", { justify: true }),
        spacer(),

        // Target Users
        heading("Target Users"),
        body("Rethink targets any individual who makes digital payments — with a primary focus on adults aged 18-40 who use mobile wallets, app-based checkout, or online shopping regularly. This group is most exposed to frictionless payment UX and most susceptible to impulse spending driven by digital design patterns. The solution is universally applicable: whether the user overspends on fashion, food delivery, or subscriptions, the AI layer adapts the intervention to their specific pattern.", { justify: true }),
        spacer(),

        // COM-B
        heading("Behavioral Diagnosis (COM-B)"),
        body("Using the COM-B model (Michie et al., 2011), three behavioral barriers explain why impulsive digital spending persists:", { justify: true }),
        spacer(),
        comBTable(),
        spacer(),
        body("Capability — Psychological: Users lack real-time awareness of spending patterns relative to their own baseline or budget. The individual transaction feels small and inconsequential, making it difficult to connect it to aggregate financial outcomes.", { justify: true }),
        body("Opportunity — Physical: The environment is structured to remove friction. One-tap checkout, saved credentials, and seamless UX eliminate the natural pause that cash or card-swipe once provided. Twenty-four-hour access to shopping means the opportunity to spend is constant and unrestricted.", { justify: true }),
        body("Motivation — Automatic: Present bias (Laibson, 1997) causes users to overweight the immediate reward of a purchase relative to future financial wellbeing. The dopamine response to a desirable item overrides deliberative reasoning. Emotional states (stress, boredom) further amplify automatic motivational responses, bypassing reflective decision-making.", { justify: true }),
        spacer(),

        // BCW
        heading("Intervention Design (BCW)"),
        body("Applying the Behaviour Change Wheel (Michie et al., 2011), three candidate interventions were identified:"),
        spacer(),
        numbered(1, "Environmental Restructuring —", "Introduce a mandatory temporal pause (delay) before payment completion. This directly modifies the opportunity dimension by adding friction to an otherwise frictionless environment. The pause creates a decision window that did not previously exist."),
        numbered(2, "Education / Enablement —", "Display personalized spending context during the delay window. This addresses the capability barrier by surfacing information the user possesses but cannot access in the moment: how this purchase compares to their weekly average, how much of their category budget remains, and the cumulative cost of similar purchases."),
        numbered(3, "Persuasion —", "AI-generated framing of the purchase decision. Rather than generic warnings, the AI produces a personalized, data-driven message tailored to the user's own behavioral pattern (e.g., \"You returned a similar item last month\" or \"This is equivalent to 3 hours of your work\"). This activates reflective motivation to counterbalance automatic impulses."),
        spacer(),

        // APEASE
        heading("Decision Rationale (APEASE)"),
        body("The selected intervention combines Environmental Restructuring (temporal friction) with AI-driven Education and Persuasion. Evaluated using the APEASE framework:"),
        spacer(),
        apeaseTable(),
        spacer(),
        spacer(),

        // AI Functionality
        heading("AI Functionality"),
        body("The AI layer is the core differentiator of Rethink. It performs two functions:"),
        spacer(),
        numbered(1, "Dynamic Delay Calibration:", "The AI determines the duration of the pause based on multiple real-time signals — purchase amount, spending category (discretionary vs. essential), spending velocity, deviation from the user's historical baseline, and time of day. A small, routine grocery purchase triggers a 10-second pause. A large, uncharacteristic discretionary purchase triggers a 24-hour hold. This personalization ensures the intervention is proportional and relevant, not uniformly disruptive."),
        numbered(2, "Personalized Insight Generation:", "During the delay window, the AI surfaces 1-2 data-driven insights drawn from the user's own transaction history. Examples include budget utilization (\"85% of your monthly shopping budget used\"), behavioral patterns (\"4th delivery order this week\"), social comparison (\"spending 2.3x your weekly average\"), and loss framing (\"equivalent to 2.5 hours of work\"). The AI selects the framing most likely to be effective for that user's pattern, learning from which messages correlate with reconsideration decisions."),
        spacer(),

        // User Flow
        heading("User Flow / Experience"),
        body("The behavioral intervention is embedded at the highest-stakes moment — the payment decision itself:"),
        spacer(),
        ...[
          ["1.", "The user initiates a digital payment (in-app, mobile wallet, or browser checkout)."],
          ["2.", "The Rethink overlay appears immediately, intercepting the payment confirmation."],
          ["3.", "A countdown timer displays the AI-determined delay duration, alongside a personalized insight card."],
          ["4.", "The user is presented with three options: Complete Payment (available after delay), Save to 24-Hour Wishlist, or Cancel."],
          ["5.", "If the user saves to the wishlist, a re-evaluation prompt is sent after 24 hours — by which time the immediate impulse has typically dissipated."],
          ["6.", "The user's decision is logged and fed back into the AI model, continuously improving calibration and messaging for future interventions."],
        ].map(([n, t]) => new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: dxa(0.25) },
          children: [
            new TextRun({ text: `${n} `, bold: true, size: pt(12), font: "Times New Roman" }),
            new TextRun({ text: t, size: pt(12), font: "Times New Roman" })
          ]
        })),
        spacer(),
        body("The flow is designed so the behavioral intervention feels like a helpful assistant, not a blocker — maintaining user autonomy while systematically engaging reflective processing at the critical moment.", { justify: true }),
        spacer(),

        // Success Metrics
        heading("Success Metrics"),
        body("Following the Test, Learn, Adapt framework, Rethink's effectiveness will be evaluated through:"),
        spacer(),
        bodyBold("Primary Metric — Reconsideration Rate: ", "The percentage of triggered delay sessions where the user defers or cancels rather than completes the payment immediately. Target: >=20% reconsideration rate within 60 days of onboarding."),
        bodyBold("Secondary Metric — Financial Wellbeing Score: ", "Monthly user-reported satisfaction with spending behavior (1-10 scale). Target: statistically significant improvement at 90 days."),
        bodyBold("Behavioral Metric — Spending Trend: ", "Aggregate discretionary spending change in connected accounts over a 90-day intervention period versus a matched control group."),
        bodyBold("Experimental Design — A/B Test: ", "8-week randomized trial comparing the full Rethink intervention (delay + AI insight) against: a control condition (no friction) and a partial condition (delay only, no AI personalization). This design isolates the contribution of the AI layer."),
        bodyBold("Adaptation: ", "Insights from A/B testing will inform monthly model updates — adjusting delay thresholds, refining insight framing, and personalizing trigger conditions based on cohort-level response patterns."),
        spacer(),

        // References (new page)
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          spacing: { before: 0, after: 240 },
          children: [new TextRun({ text: "References", bold: true, size: pt(14), font: "Times New Roman" })]
        }),
        reference("Ayal, S., Celse, J., & Hochman, G. (2019). Crafting messages to fight dishonesty. Journal of Economic Behavior & Organization, 160, 240-250."),
        reference("Frederick, S., Loewenstein, G., & O'Donoghue, T. (2002). Time discounting and time preference: A critical review. Journal of Economic Literature, 40(2), 351-401."),
        reference("Laibson, D. (1997). Golden eggs and hyperbolic discounting. Quarterly Journal of Economics, 112(2), 443-478."),
        reference("Michie, S., van Stralen, M. M., & West, R. (2011). The behaviour change wheel: A new method for characterising and designing behaviour change interventions. Implementation Science, 6(1), 42."),
        reference("Prelec, D., & Loewenstein, G. (1998). The red and the black: Mental accounting of savings and debt. Marketing Science, 17(1), 4-28."),

        // Appendix (new page)
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          spacing: { before: 0, after: 240 },
          children: [new TextRun({ text: "Appendix A — Prototype Links", bold: true, size: pt(14), font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 80, ...LS },
          children: [new TextRun({ text: "Deliverable 1 — Interactive AI Prototype (Gemini Gem):", bold: true, size: pt(12), font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 160, ...LS },
          children: [
            new ExternalHyperlink({
              link: "https://gemini.google.com/gem/1WwqGORaWVksUwKFTtLhQpZyno7uWGF_K?usp=sharing",
              children: [new TextRun({ text: "https://gemini.google.com/gem/1WwqGORaWVksUwKFTtLhQpZyno7uWGF_K?usp=sharing", style: "Hyperlink", size: pt(12), font: "Times New Roman" })]
            })
          ]
        }),
        body("The Rethink AI Gem is a working behavioral-economics AI built on Google Gemini. It receives a purchase description, identifies the behavioral archetype (Impulsive / Emotional / Cumulative / Aligned), applies the appropriate intervention logic (Future-Self Bridge, Trigger Nudge, Loss Frame, or Affirmation), and returns a personalised delay recommendation with an AI-generated insight — exactly as the real app would. No account required; accessible via the link above."),
        spacer(),
        new Paragraph({
          spacing: { before: 0, after: 80, ...LS },
          children: [new TextRun({ text: "Deliverable 2 — Interactive Mockup Website:", bold: true, size: pt(12), font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 160, ...LS },
          children: [
            new ExternalHyperlink({
              link: "https://yairkatan5-lgtm.github.io/rethink-app/",
              children: [new TextRun({ text: "https://yairkatan5-lgtm.github.io/rethink-app/", style: "Hyperlink", size: pt(12), font: "Times New Roman" })]
            })
          ]
        }),
        body("A fully animated product mockup website demonstrating all sections of the Rethink app: animated phone mockup with live countdown timer, four behavioral archetype scenarios (Impulsive / Emotional / Cumulative / Aligned) with personalised AI insights, the four-pillar behavioral science framework (Loss Aversion, Mental Accounting, Future-Self Continuity, Present Bias), COM-B diagnosis, user flow, and the full product narrative."),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:\\Users\\יאיר\\Downloads\\יאיר אישי\\AGENT\\rethink-app\\Rethink_PRD_316522721_313559692.docx", buffer);
  console.log("Done: Rethink_PRD.docx created successfully");
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
