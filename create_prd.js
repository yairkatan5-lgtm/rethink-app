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
    ["Effectiveness", "High", "Temporal friction reduces impulsive choice; supported by experimental evidence (Frederick et al., 2002)."],
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
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Reichman University, Tiomkin School of Economics", size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Baruch Ivcher School of Psychology", size: pt(12), font: "Times New Roman" })] }),
        spacer(),
        spacer(),
        new Paragraph({ spacing: { before: 160, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Students:", bold: true, size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Yoav Aviram  |  ID: 316522721", size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Yair Katan  |  ID: 313559692", size: pt(12), font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Meital Segev  |  ID: 318545282", size: pt(12), font: "Times New Roman" })] }),
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
        body("Digital payments have largely eliminated the \"pain of paying\" - the psychological discomfort that cash once provided as a natural spending brake. One-tap checkout and stored credentials mean there is no pause between impulse and purchase. Consumers spend more when paying digitally than with cash (Prelec & Loewenstein, 1998), and impulse purchases account for the majority of e-commerce volume. The problem is structural: digital commerce is built to minimize hesitation. Present bias means users discount future regret in favor of immediate reward, and the removal of physical payment friction leaves nothing to interrupt that pattern. Rethink re-introduces a deliberate pause before payment completion, with AI-generated context drawn from the user's own spending data.", { justify: true }),
        spacer(),

        // Target Users
        heading("Target Users"),
        body("The primary audience is adults aged 18-40 who regularly pay via mobile wallet, app checkout, or online shopping. This group faces the highest exposure to UX designed to reduce purchase hesitation. The approach is not category-specific: the AI adapts its intervention to the user's own behavioral history, regardless of what they are buying.", { justify: true }),
        spacer(),

        // COM-B
        heading("Behavioral Diagnosis (COM-B)"),
        body("Using the COM-B model (Michie et al., 2011), three behavioral barriers explain why impulsive digital spending persists:", { justify: true }),
        spacer(),
        comBTable(),
        spacer(),
        body("Capability - Psychological: Users typically lack real-time awareness of how a given purchase fits their spending pattern. Each transaction feels small in isolation; the cumulative effect is rarely visible until after the fact.", { justify: true }),
        body("Opportunity - Physical: The payment environment is built to eliminate hesitation. One-tap checkout and saved credentials remove the natural pause that physically handing over cash once imposed. Purchases are available at any hour, with no cooling-off period built into the experience.", { justify: true }),
        body("Motivation - Automatic: Present bias (Laibson, 1997) causes the immediate appeal of a purchase to outweigh its future cost. The dopamine response to a desired item tends to override slower, deliberate reasoning. Emotional states such as stress or boredom reinforce this by increasing impulsivity at the moment of purchase.", { justify: true }),
        spacer(),

        // BCW
        heading("Intervention Design (BCW)"),
        body("Drawing on the Behaviour Change Wheel (Michie et al., 2011), we considered three intervention approaches:"),
        spacer(),
        numbered(1, "Environmental Restructuring:", "A mandatory pause before payment completes. This adds friction to a frictionless environment, creating a decision window where none existed before."),
        numbered(2, "Education / Enablement:", "Show the user relevant spending data during the pause - how this purchase fits against their weekly average, remaining category budget, and running total. The information already exists in their transaction history; the problem is that it is not visible at the moment of purchase."),
        numbered(3, "Persuasion:", "Rather than a generic warning, the AI generates a message tied to the user's own history - for example, 'You returned a similar item last month' or 'At your salary, this is about 3 hours of work.' Personal data is more likely to shift a decision than an abstract caution."),
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
        body("The AI layer is what separates Rethink from a simple timer. It does two things:"),
        spacer(),
        numbered(1, "Dynamic Delay Calibration:", "The AI determines how long to pause based on purchase amount, spending category, velocity, deviation from the user's baseline, and time of day. A routine grocery purchase might get a 10-second pause. An out-of-pattern discretionary purchase gets a 24-hour hold. The delay is scaled to the situation, not applied uniformly across all transactions."),
        numbered(2, "Personalized Insight Generation:", "During the pause, the AI displays 1-2 pieces of context from the user's own transaction history - for example: 'You have used 85% of your shopping budget this month,' '4th delivery order this week,' or 'At your salary, this is about 2.5 hours of work.' The model tracks which message types are associated with a change in decision, and adjusts its framing over time."),
        spacer(),

        // User Flow
        heading("User Flow / Experience"),
        body("The intervention activates at the point of payment:"),
        spacer(),
        ...[
          ["1.", "The user initiates a digital payment (in-app, mobile wallet, or browser checkout)."],
          ["2.", "The Rethink overlay appears immediately, before payment confirmation."],
          ["3.", "A countdown timer shows the AI-determined delay, alongside a personalized insight card."],
          ["4.", "The user sees three options: Complete Payment (available after the delay), Save to 24-Hour Wishlist, or Cancel."],
          ["5.", "If saved to the wishlist, a re-evaluation prompt arrives after 24 hours - by which point the immediate impulse has usually passed."],
          ["6.", "The decision is logged and fed back into the AI model, improving calibration for that user's future interactions."],
        ].map(([n, t]) => new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: dxa(0.25) },
          children: [
            new TextRun({ text: `${n} `, bold: true, size: pt(12), font: "Times New Roman" }),
            new TextRun({ text: t, size: pt(12), font: "Times New Roman" })
          ]
        })),
        spacer(),
        body("The design preserves user choice throughout: payment is never blocked, only delayed. The goal is to give the reflective system time to catch up with the impulse, not to prevent the purchase.", { justify: true }),
        spacer(),

        // Success Metrics
        heading("Success Metrics"),
        body("Following the Test, Learn, Adapt framework, Rethink's effectiveness will be evaluated through:"),
        spacer(),
        bodyBold("Primary Metric - Reconsideration Rate: ", "The percentage of triggered delay sessions where the user defers or cancels rather than completes the payment immediately. Target: >=20% reconsideration rate within 60 days of onboarding."),
        bodyBold("Secondary Metric - Financial Wellbeing Score: ", "Monthly user-reported satisfaction with spending behavior (1-10 scale). Target: statistically significant improvement at 90 days."),
        bodyBold("Behavioral Metric - Spending Trend: ", "Aggregate discretionary spending change in connected accounts over a 90-day intervention period versus a matched control group."),
        bodyBold("Experimental Design - A/B Test: ", "8-week randomized trial comparing the full Rethink intervention (delay + AI insight) against: a control condition (no friction) and a partial condition (delay only, no AI personalization). This design isolates the contribution of the AI layer."),
        bodyBold("Adaptation: ", "A/B results will feed into monthly model updates, primarily threshold adjustments and message framing changes based on what actually shifted decisions."),
        spacer(),

        // References (new page)
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          spacing: { before: 0, after: 240 },
          children: [new TextRun({ text: "References", bold: true, size: pt(14), font: "Times New Roman" })]
        }),
        reference("Frederick, S., Loewenstein, G., & O'Donoghue, T. (2002). Time discounting and time preference: A critical review. Journal of Economic Literature, 40(2), 351-401."),
        reference("Laibson, D. (1997). Golden eggs and hyperbolic discounting. Quarterly Journal of Economics, 112(2), 443-478."),
        reference("Michie, S., van Stralen, M. M., & West, R. (2011). The behaviour change wheel: A new method for characterising and designing behaviour change interventions. Implementation Science, 6(1), 42."),
        reference("Prelec, D., & Loewenstein, G. (1998). The red and the black: Mental accounting of savings and debt. Marketing Science, 17(1), 4-28."),

        // Appendix (new page)
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          spacing: { before: 0, after: 240 },
          children: [new TextRun({ text: "Appendix A - Prototype Links", bold: true, size: pt(14), font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 80, ...LS },
          children: [new TextRun({ text: "Deliverable 1 - Interactive AI Prototype (Gemini Gem):", bold: true, size: pt(12), font: "Times New Roman" })]
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
        body("The Rethink AI Gem is a working behavioral-economics AI built on Google Gemini. It receives a purchase description, identifies the behavioral archetype (Impulsive / Emotional / Cumulative / Aligned), applies the appropriate intervention logic (Future-Self Bridge, Trigger Nudge, Loss Frame, or Affirmation), and returns a personalised delay recommendation with an AI-generated insight, exactly as the real app would. No account required; accessible via the link above."),
        spacer(),
        new Paragraph({
          spacing: { before: 0, after: 80, ...LS },
          children: [new TextRun({ text: "Deliverable 2 - Interactive Mockup Website:", bold: true, size: pt(12), font: "Times New Roman" })]
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
  fs.writeFileSync("C:\\Users\\יאיר\\Downloads\\יאיר אישי\\AGENT\\rethink-app\\Rethink_PRD_316522721_313559692_318545282.docx", buffer);
  console.log("Done: Rethink_PRD.docx created successfully");
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
