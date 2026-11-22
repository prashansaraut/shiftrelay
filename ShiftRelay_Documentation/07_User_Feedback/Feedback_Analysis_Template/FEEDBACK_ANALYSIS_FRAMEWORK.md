# ShiftRelay — User Feedback Analysis Framework & Scoring Methodology

**Document Purpose:** Mathematical formulation, qualitative thematic coding methodology, and statistical scoring framework for ShiftRelay's user evaluation package.  
**Notice:** This document establishes the evaluation methodology and blank analytical framework for user evaluation sessions. No fabricated data is included.

---

## 1. Quantitative Statistical Formulas

### 1.1 Arithmetic Mean (Average Rating per Dimension)
For each evaluated question \( Q_j \) with \( N \) participant responses:
$$\bar{x}_j = \frac{1}{N} \sum_{i=1}^{N} x_{ij}$$

### 1.2 Sample Standard Deviation (Dispersion of Opinions)
$$s_j = \sqrt{\frac{1}{N - 1} \sum_{i=1}^{N} (x_{ij} - \bar{x}_j)^2}$$

### 1.3 System Usability Scale (SUS) Normalized Score
To convert the multi-attribute 1–5 Likert evaluation into a standard industry SUS equivalent (0 to 100):
$$SUS = \left( \frac{1}{K} \sum_{j=1}^{K} (\bar{x}_j - 1) \right) \times 25$$
Where \( K = 12 \) core usability criteria evaluated on a 1–5 scale.

### 1.4 Customer Satisfaction Index (CSAT %)
Calculates the proportion of respondents rating 4 or 5:
$$CSAT = \left( \frac{\text{Total Ratings of 4 and 5}}{\text{Total Evaluated Ratings}} \right) \times 100\%$$

---

## 2. Evaluation Scorecard Framework

The table below defines the evaluation criteria and target benchmarks for user testing sessions:

| Usability Dimension | Target Benchmark | Actual Mean (\(\bar{x}\)) | Std Dev (\(s\)) | CSAT % | Evaluation Status |
|:---|:---|:---:|:---:|:---:|:---:|
| **Q05: Operational Purpose Clarity** | \( \ge 4.20 \) | - | - | - | Uncollected |
| **Q06: Visual Polish & Hierarchy** | \( \ge 4.00 \) | - | - | - | Uncollected |
| **Q07: Problem vs Solution Contrast** | \( \ge 4.10 \) | - | - | - | Uncollected |
| **Q08: Interactive Demo Usability** | \( \ge 4.30 \) | - | - | - | Uncollected |
| **Q09: Conflict Interception Realism** | \( \ge 4.25 \) | - | - | - | Uncollected |
| **Q10: ID Preservation & Continuity** | \( \ge 4.40 \) | - | - | - | Uncollected |
| **Q11: Workspace Navigation Speed** | \( \ge 4.50 \) | - | - | - | Uncollected |
| **Q12: Simulated Role Switcher** | \( \ge 4.30 \) | - | - | - | Uncollected |
| **Q13: Carry-Forward Aging Indicators** | \( \ge 4.20 \) | - | - | - | Uncollected |
| **Q14: Incident Mandatory Notes Protocol** | \( \ge 4.15 \) | - | - | - | Uncollected |
| **Q15: Dark Theme Readability** | \( \ge 4.20 \) | - | - | - | Uncollected |
| **Q16: Mobile & Tablet Responsiveness** | \( \ge 4.00 \) | - | - | - | Uncollected |
| **Composite SUS Usability Score** | **\( \ge 80.0 \) (Grade A)**| - | - | - | Uncollected |
| **Q20: Overall System Rating (1-10)** | **\( \ge 8.5 / 10 \)** | - | - | - | Uncollected |

---

## 3. Qualitative Thematic Analysis Framework

Open-ended comments collected from Q17, Q18, and Q19 are categorized using inductive thematic coding into three operational buckets:

1. **Category A: Functional Capabilities & Continuity Engine**
   - Observations regarding preserved ticket IDs, rollover counters, and concurrency protection.
2. **Category B: Interface Design, Contrast & Theming**
   - Comments regarding typography, dark mode contrast, padding, and visual hierarchy.
3. **Category C: Responsive Layouts & Touch Interaction**
   - Observations regarding mobile drawers, touch tap targets, foldable screens, and iPad views.

---

## 4. Evaluation Execution Protocol

1. Conduct user evaluation sessions with participants.
2. Ensure participants represent multiple device categories (desktop, tablet, smartphone).
3. Populate `USER_FEEDBACK_COLLECTION_TEMPLATE.csv` with responses.
4. Run standard statistical aggregation using the formulas in Section 1.
5. Record summary values into the final Week 5 internship documentation report.