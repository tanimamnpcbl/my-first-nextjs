import { jsPDF } from "jspdf";
import { Exam, Question } from "../types";

export interface ScoreStats {
  obtainedMark: number;
  totalMark: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeTakenStr: string;
}

/**
 * Triggers native browser print dialog (which allows Save as PDF with full Bengali font support).
 * If window.print fails or is blocked (e.g. in certain mobile webviews), falls back to jsPDF text download.
 */
export function triggerExamPrintOrDownload(
  exam: Exam,
  username: string,
  questions: Question[],
  selectedAnswers: Record<number, string>,
  isSubmitted: boolean,
  scoreStats?: ScoreStats
): void {
  try {
    // 1. Primary Strategy: Trigger window.print() synchronously
    if (typeof window !== "undefined" && typeof window.print === "function") {
      window.print();
      return;
    }
  } catch (err) {
    console.warn("window.print() threw error, attempting fallback:", err);
  }

  // 2. Fallback Strategy: Generate downloadable PDF using jsPDF
  try {
    generateJsPDFDocument(exam, username, questions, selectedAnswers, isSubmitted, scoreStats);
  } catch (pdfErr) {
    console.error("PDF generation fallback failed:", pdfErr);
    alert("দুঃখিত, প্রিন্ট বা পিডিএফ ডাউনলোড করার সময় সমস্যা হয়েছে। ব্রাউজারের প্রিন্ট অপশন সক্রিয় আছে কিনা পরীক্ষা করুন।");
  }
}

/**
 * Fallback PDF generator using jsPDF
 */
function generateJsPDFDocument(
  exam: Exam,
  username: string,
  questions: Question[],
  selectedAnswers: Record<number, string>,
  isSubmitted: boolean,
  scoreStats?: ScoreStats
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Title
  doc.setFontSize(16);
  doc.text(`Exam Master BD - ${exam.name}`, 14, y);
  y += 8;

  // Metadata
  doc.setFontSize(10);
  doc.text(`Candidate: ${username || "Guest"} | Date: ${new Date().toLocaleDateString()}`, 14, y);
  y += 6;

  if (isSubmitted && scoreStats) {
    doc.text(
      `Obtained: ${scoreStats.obtainedMark.toFixed(2)} / ${scoreStats.totalMark} | Correct: ${scoreStats.correctCount} | Wrong: ${scoreStats.wrongCount} | Time: ${scoreStats.timeTakenStr}`,
      14,
      y
    );
    y += 8;
  }

  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Questions Loop
  questions.forEach((q, idx) => {
    const qNo = q.questionNo || (idx + 1);
    if (y > 270) {
      doc.addPage();
      y = 15;
    }

    doc.setFontSize(11);
    doc.text(`${qNo}. ${q.question}`, 14, y);
    y += 6;

    const opts = [
      `A) ${q.optionA}`,
      `B) ${q.optionB}`,
      `C) ${q.optionC}`,
      `D) ${q.optionD}`
    ];

    opts.forEach(opt => {
      if (y > 275) {
        doc.addPage();
        y = 15;
      }
      doc.setFontSize(9);
      doc.text(`   ${opt}`, 16, y);
      y += 5;
    });

    if (isSubmitted) {
      const userAns = (selectedAnswers[qNo] || "").toLowerCase().trim();
      const correctAns = (q.correctAnswer || "").toLowerCase().trim();
      doc.setFontSize(9);
      doc.text(`   Correct Answer: ${correctAns.toUpperCase()} | Your Choice: ${userAns ? userAns.toUpperCase() : "Skipped"}`, 16, y);
      y += 5;
      if (q.explanation) {
        doc.text(`   Explanation: ${q.explanation.slice(0, 90)}...`, 16, y);
        y += 5;
      }
    }

    y += 4;
  });

  const filename = `${exam.name.replace(/[^a-zA-Z0-9 Bengali]/g, "_")}_Result.pdf`;
  doc.save(filename);
}
