import { Exam, Question } from "./types";

export const APPS_SCRIPT_CODE = `function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;
  
  // Set CORS headers by returning JSON via ContentService
  if (action === "getExams") {
    var examSheet = sheet.getSheetByName("Exams");
    if (!examSheet) {
      return jsonResponse({ error: "Exams sheet not found. Please create a sheet named 'Exams'." });
    }
    
    var data = examSheet.getDataRange().getValues();
    var exams = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[1]) continue; // Skip rows with no name
      exams.push({
        slNo: Number(row[0]) || i,
        name: String(row[1]),
        tabName: String(row[2]),
        timeLimit: Number(row[3]) || 15,
        status: String(row[4]).toLowerCase() === "live" ? "live" : "draft"
      });
    }
    return jsonResponse({ exams: exams });
  }
  
  if (action === "getQuestions") {
    var tabName = e.parameter.tabName;
    if (!tabName) {
      return jsonResponse({ error: "Missing tabName parameter." });
    }
    
    var questionSheet = sheet.getSheetByName(tabName);
    if (!questionSheet) {
      return jsonResponse({ error: "Question sheet tab '" + tabName + "' not found." });
    }
    
    var data = questionSheet.getDataRange().getValues();
    var questions = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[1]) continue; // Skip rows with no question text
      questions.push({
        questionNo: row[0] || i,
        question: String(row[1]),
        optionA: String(row[2]),
        optionB: String(row[3]),
        optionC: String(row[4]),
        optionD: String(row[5]),
        correctAnswer: String(row[6]).trim().toLowerCase(),
        explanation: String(row[7] || ""),
        topic: String(row[8] || "")
      });
    }
    return jsonResponse({ questions: questions });
  }
  
  return jsonResponse({ error: "Invalid action. Use 'getExams' or 'getQuestions'." });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const DEFAULT_EXAMS: Exam[] = [];

export const DEFAULT_QUESTIONS: Record<string, Question[]> = {};



// font-extrabold 