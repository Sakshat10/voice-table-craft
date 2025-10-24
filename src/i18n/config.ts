import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appTitle: "Voice Table Creator",
      appDescription: "Create and fill tables using voice commands",
      startListening: "Start Listening",
      stopListening: "Stop Listening",
      exportCSV: "Export CSV",
      clearTable: "Clear Table",
      transcript: "Transcript",
      listening: "Listening...",
      notListening: "Click to start voice recognition",
      tableEmpty: "No table created yet. Try saying: 'Create a table with 3 columns named Name, Age, City'",
      exampleCommands: "Example Commands",
      exampleCreate: "Create a table with 5 columns named Name, Age, City, Email, Salary",
      exampleAdd: "Add a row: John, 25, Delhi, john@gmail.com, 30000",
      browserNotSupported: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      error: "Error",
      success: "Success",
      tableExported: "Table exported successfully!",
      rowAdded: "Row added successfully!",
      tableCreated: "Table created with {{count}} columns",
    }
  },
  ar: {
    translation: {
      appTitle: "منشئ الجداول الصوتية",
      appDescription: "إنشاء وملء الجداول باستخدام الأوامر الصوتية",
      startListening: "ابدأ الاستماع",
      stopListening: "أوقف الاستماع",
      exportCSV: "تصدير CSV",
      clearTable: "مسح الجدول",
      transcript: "النص المكتوب",
      listening: "جاري الاستماع...",
      notListening: "انقر لبدء التعرف على الصوت",
      tableEmpty: "لم يتم إنشاء جدول بعد. حاول أن تقول: 'إنشاء جدول بـ 3 أعمدة بأسماء الاسم، العمر، المدينة'",
      exampleCommands: "أمثلة الأوامر",
      exampleCreate: "إنشاء جدول بـ 5 أعمدة بأسماء الاسم، العمر، المدينة، البريد الإلكتروني، الراتب",
      exampleAdd: "إضافة صف: أحمد، 25، الرياض، ahmed@gmail.com، 30000",
      browserNotSupported: "التعرف على الكلام غير مدعوم في متصفحك. يرجى استخدام Chrome أو Edge.",
      error: "خطأ",
      success: "نجح",
      tableExported: "تم تصدير الجدول بنجاح!",
      rowAdded: "تمت إضافة الصف بنجاح!",
      tableCreated: "تم إنشاء الجدول بـ {{count}} أعمدة",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
