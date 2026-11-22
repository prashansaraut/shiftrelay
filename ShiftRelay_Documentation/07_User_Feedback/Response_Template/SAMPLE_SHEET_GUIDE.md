# ShiftRelay — User Feedback Collection Template & Data Dictionary Guide

This guide describes the standardized schema for collecting real user evaluation data for ShiftRelay.

---

## 1. Evaluation Collection Notice

This questionnaire and CSV template serve as a standardized collection instrument for human user evaluation. In strict adherence to project integrity standards, no synthetic or fabricated participant rows are included.

---

## 2. Column Definitions & Data Dictionary

| Column Name | Data Type | Permitted Values / Format | Description |
|:---|:---|:---|:---|
| `Participant_ID` | String | `USR-001` to `USR-999` | Anonymized identifier for each evaluator. |
| `Submission_Timestamp` | ISO 8601 | `YYYY-MM-DDTHH:MM:SSZ` | Exact time when evaluation was recorded. |
| `Evaluator_Role` | Enum | Frontend, Full-Stack, Ops Lead, Designer, Mentor | Background domain of the evaluator. |
| `Device_Type` | Enum | Desktop, Laptop, Tablet, Foldable, Smartphone | Screen hardware used during testing. |
| `Browser` | Enum | Chrome, Firefox, Safari, Edge | User agent environment. |
| `Q05_Purpose_Clarity` | Integer (1-5) | 1 = Unclear, 5 = Crystal Clear | Rating of landing page clarity. |
| `Q06_Visual_Polish` | Integer (1-5) | 1 = Poor, 5 = Enterprise Grade | Layout, spacing, typography quality. |
| `Q07_Problem_Solution` | Integer (1-5) | 1 = Confusing, 5 = Evident | Comprehension of problem/solution. |
| `Q08_Demo_Flow` | Integer (1-5) | 1 = Clunky, 5 = Seamless | Usability of 5-milestone demo. |
| `Q09_Conflict_Realism` | Integer (1-5) | 1 = Ineffective, 5 = Highly Realistic | Mid-flight collision demonstration. |
| `Q10_ID_Preservation` | Integer (1-5) | 1 = Hard to follow, 5 = Exceptional | Understanding of preserved record IDs. |
| `Q11_Workspace_Nav` | Integer (1-5) | 1 = Slow/Cluttered, 5 = Intuitive | Ease of routing through modules. |
| `Q12_Role_Switcher` | Integer (1-5) | 1 = Unhelpful, 5 = Highly Useful | Simulated demo role switcher utility. |
| `Q13_Carry_Forward` | Integer (1-5) | 1 = Unnoticeable, 5 = Prominent | Visibility of carried aging flags. |
| `Q14_Incident_Protocol`| Integer (1-5) | 1 = Too strict, 5 = Great Governance | Mandatory resolution note rule. |
| `Q15_Dark_Theme` | Integer (1-5) | 1 = Low Contrast, 5 = Flawless | Contrast and readability in dark mode. |
| `Q16_Mobile_Responsive`| Integer (1-5) | 1 = Broken, 5 = Fully Responsive | Mobile drawer, cards, and touch layout. |
| `Q17_Strongest_Feature` | Free Text | Open text | Evaluator-cited standout capability. |
| `Q18_Areas_For_Improvement`| Free Text | Open text | Evaluator-cited friction points. |
| `Q19_Future_Recommendations`| Free Text | Open text | Evaluator suggestions for future iterations.|
| `Q20_Overall_Rating_10`| Integer (1-10) | 1 to 10 | Global satisfaction score. |

---

## 3. Data Collection Procedure

1. Distribute `FEEDBACK_QUESTIONNAIRE.md` (or Google Forms import via `google_forms_schema.json`) to peer evaluators.
2. Ensure participants test ShiftRelay across different devices (desktop, tablet, mobile).
3. Record incoming form results into `USER_FEEDBACK_COLLECTION_TEMPLATE.csv`.
4. Apply the formulas outlined in `FEEDBACK_ANALYSIS_FRAMEWORK.md` to compute statistical scores.