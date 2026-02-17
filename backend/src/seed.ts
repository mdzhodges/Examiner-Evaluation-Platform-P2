import fetch from "node-fetch";

const API_BASE_URL = "http://localhost:5000"; // adjust if needed

type RepresentativeAnswerPayload = {
  question_id: number;
  question_text: string;
  cluster_id: string;
  representative_answer_text: string;
  cluster_frequency: number;
  model_contributions: {
    model_count: number;
    run_count: number;
  };
};

const data: RepresentativeAnswerPayload[] = [
  {
    question_id: 1,
    question_text:
      "Which CAD/CAM technology can be recommended for the production of an interim implant-supported fixed dental prosthesis?",
    cluster_id: "q1_cluster_1",
    representative_answer_text:
      "A suitable technique should balance efficiency, predictable short-term performance, and compatibility with the intended restoration. Methods that offer consistent dimensional form and smooth surface characteristics may help streamline the fabrication process. The final choice may depend on workflow preferences and available resources.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 2,
    question_text:
      "Which CAD/CAM technology can be recommended for the production of a definitive implant-supported fixed dental prosthesis?",
    cluster_id: "q2_cluster_1",
    representative_answer_text:
      "For definitive restorations, approaches that provide stable structural outcomes and precise adaptation are often desirable. Systems that maintain accuracy throughout fabrication may support long-term reliability. The decision generally reflects material capability, equipment availability, and overall restorative planning.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 3,
    question_text: "When should the implant abutment be selected?",
    cluster_id: "q3_cluster_1",
    representative_answer_text:
      "Selection is typically coordinated with broader treatment planning to support predictable restorative outcomes. Timing should allow proper visualization of intended contours and anticipated tissue response. The final determination depends on planning objectives and the sequencing of procedural steps.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 4,
    question_text:
      "Which titanium base abutment shoulder height should be selected for bone-level conical-connection implants?",
    cluster_id: "q4_cluster_1",
    representative_answer_text:
      "A height that enables a smooth emergence contour and sufficient integration within the restorative plan is generally preferred. Consideration of surrounding structures and design constraints helps ensure compatibility. The final value varies according to prosthetic and anatomical requirements.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 5,
    question_text:
      "Which factors contribute to retention of suprastructures to the titanium base abutments?",
    cluster_id: "q5_cluster_1",
    representative_answer_text:
      "Retention may be influenced by dimensional features, surface interactions, and how components interface during assembly. Design geometry, connection characteristics, and bonding strategy collectively shape the overall stability. The exact outcome depends on the interplay of restorative elements.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 6,
    question_text:
      "Can titanium base abutments be used for all single implant crowns?",
    cluster_id: "q6_cluster_1",
    representative_answer_text:
      "These components function well in many common scenarios, though certain configurations may call for alternative solutions. Anatomical complexity or specific contour requirements sometimes lead to different selections. Final decisions align with the anticipated functional and esthetic goals.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 7,
    question_text:
      "What prosthetic design is recommended to treat multiple missing teeth in posterior edentulous sites with a fixed implant restoration?",
    cluster_id: "q7_cluster_1",
    representative_answer_text:
      "Designs should distribute functional demands appropriately while supporting restorative form. Approaches may vary depending on spacing, access, and biomechanical considerations. The ideal configuration accommodates patient-specific restorative planning.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 8,
    question_text:
      "How many implants are needed to support a fixed restoration to replace at least three missing teeth in the posterior area?",
    cluster_id: "q8_cluster_1",
    representative_answer_text:
      "The number of units needed generally depends on mechanical demands, spatial limitations, and overall treatment goals. A configuration that maintains stability while avoiding unnecessary procedures is typically preferred. The final plan reflects structural requirements and restorative intent.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 9,
    question_text:
      "What is the restorative material of choice for posterior multi-unit fixed implant-supported restorations?",
    cluster_id: "q9_cluster_1",
    representative_answer_text:
      "Materials with reliable durability, controlled fracture resistance, and acceptable long-term behavior are often selected for posterior regions. The choice typically reflects mechanical demands and expected functional loading. Additional factors include workflow compatibility and esthetic preference.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 10,
    question_text:
      "In fully edentulous patients, can a CIFDP or an IOD be recommended to provide optimal stability and comfort?",
    cluster_id: "q10_cluster_1",
    representative_answer_text:
      "Either option may provide supportive function depending on individual needs and prosthetic space considerations. Comfort, maintenance requirements, and anticipated daily use all influence the decision. The final choice often reflects patient expectations and restorative planning objectives.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 11,
    question_text: "What is the ideal attachment for a mandibular IOD?",
    cluster_id: "q11_cluster_1",
    representative_answer_text:
      "Attachments should be selected to provide controlled movement, reliable retention, and ease of daily handling. The appropriate design may vary depending on maintenance expectations and functional preferences. The final choice aligns with user comfort and restorative goals.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 12,
    question_text:
      "With respect to oral function, should implant-retained/supported prostheses be considered the best treatment option in completely edentulous patients?",
    cluster_id: "q12_cluster_1",
    representative_answer_text:
      "These prostheses often support improved function in many cases, though suitability depends on individual variables. Daily performance, comfort, and adaptability all play a role in determining the ideal option. Treatment goals and patient needs guide the final selection.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 13,
    question_text:
      "In edentulous patients, does implant treatment reduce alveolar bone resorption compared to complete denture treatment?",
    cluster_id: "q13_cluster_1",
    representative_answer_text:
      "Some therapeutic approaches may help maintain structural integrity over time, although individual outcomes vary. Biomechanical forces, tissue response, and maintenance practices all influence longer-term changes. Monitoring and regular evaluation remain important regardless of method.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 14,
    question_text:
      "When tooth replacement is indicated in partially edentulous patients, can iFDPs be recommended over RDPs?",
    cluster_id: "q14_cluster_1",
    representative_answer_text:
      "Selection between these options typically reflects comfort, stability, and long-term treatment goals. Each approach presents specific advantages depending on patient priorities. Final choice considers restorative needs and overall oral health objectives.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  },
  {
    question_id: 15,
    question_text:
      "What must be considered when using zirconia for implant-supported multi-unit fixed dental prostheses?",
    cluster_id: "q15_cluster_1",
    representative_answer_text:
      "Considerations include functional expectations, manufacturing characteristics, and desired esthetic qualities. Different options may vary in structural and optical behavior. Proper coordination ensures the choice aligns with restorative objectives and patient preferences.",
    cluster_frequency: 1000,
    model_contributions: {
      model_count: 4,
      run_count: 1000
    }
  }
];

async function seed() {
  for (const entry of data) {
    const response = await fetch(`${API_BASE_URL}/examiner/addAnswer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Failed to insert:", entry.question_id, err);
      process.exit(1);
    }

    console.log(`Inserted representative answer for Q${entry.question_id}`);
  }

  console.log("Seeding complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
