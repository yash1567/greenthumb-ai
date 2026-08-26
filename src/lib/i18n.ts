import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      landing: {
        title: "KrushiMitra",
      },
      appshell: {
        smartFarming: "Smart Farming AI",
        proTips: "Farming Tip of the Day",
        tipText: "Soil testing every 6 months increases fertilizer efficiency by up to 30%.",
      },
      nav: {
        dashboard: "Dashboard",
        soilAnalyzer: "Soil Health",
        cropRecommendation: "Crop Advisor",
        pestDetection: "Pest & Disease",
        weather: "Weather",
        history: "History & Reports",
      },
      dashboard: {
        goodMorning: "Welcome Back",
        heroTitle: "Smart Farming, Simplified",
        heroDesc: "Monitor crop health, analyze soil nutrients, and view live weather insights for your farm.",
        analyzeNewSample: "Analyze Soil",
        temp: "Temperature",
        humidity: "Humidity",
        rainfall: "Rainfall",
        wind: "Wind Speed",
        recentActivity: "Recent Farm Activity",
        viewAll: "View All",
        recommendedCrops: "Recommended Crops",
        alerts: "Active Alerts",
      },
      soil: {
        title: "Soil Health Analyzer",
        desc: "Input N-P-K soil parameters for instant crop suitability analysis.",
      },
      crops: {
        title: "Crop Recommendation Engine",
        desc: "AI-powered crop selection based on season, soil, and market demand.",
      },
      pest: {
        title: "Pest & Disease Detection",
        desc: "Identify crop diseases early using leaf scan image analysis.",
      },
      weather: {
        title: "Weather & Advisory",
        desc: "Hyper-local weather forecasts and crop protection advisories.",
      },
      history: {
        title: "Farm History & Logs",
        desc: "Track past soil tests, crop recommendations, and pest scans.",
      },
    },
  },
  mr: {
    translation: {
      landing: {
        title: "कृषिमित्र",
      },
      appshell: {
        smartFarming: "स्मार्ट शेती एआय",
        proTips: "आजची शेती टीप",
        tipText: "दर ६ महिन्यांनी मातीचे परीक्षण केल्यास खतांची कार्यक्षमता ३०% पर्यंत वाढते.",
      },
      nav: {
        dashboard: "डॅशबोर्ड",
        soilAnalyzer: "माती आरोग्य",
        cropRecommendation: "पिक सल्लागार",
        pestDetection: "कीड व रोग निदान",
        weather: "हवामान",
        history: "इतिहास आणि अहवाल",
      },
      dashboard: {
        goodMorning: "पुन्हा स्वागत आहे",
        heroTitle: "स्मार्ट शेती, सोपी पद्धत",
        heroDesc: "पिकांच्या आरोग्याचे निरीक्षण करा, मातीतील घटकांचे विश्लेषण करा आणि थेट हवामानाची माहिती मिळवा.",
        analyzeNewSample: "माती परीक्षण करा",
        temp: "तापमान",
        humidity: "आर्द्रता",
        rainfall: "पाऊस",
        wind: "वारा वेग",
        recentActivity: "नुकत्याच झालेल्या शेती हालचाली",
        viewAll: "सर्व पहा",
        recommendedCrops: "शिफारस केलेली पिके",
        alerts: "महत्वाच्या सूचना",
      },
      soil: {
        title: "माती आरोग्य विश्लेषक",
        desc: "पिकांच्या योग्यतेसाठी मातीतील एन-पी-के घटकांची तपासणी करा.",
      },
      crops: {
        title: "पिक शिफारस इंजिन",
        desc: "हंगाम आणि जमिनीनुसार योग्य पिकांची निवड करा.",
      },
      pest: {
        title: "कीड आणि रोग ओळख",
        desc: "पानांचे फोटो काढून पिकांवरील रोगांचे वेळेवर निदान करा.",
      },
      weather: {
        title: "हवामान अंदाज",
        desc: "स्थानिक हवामान अंदाज आणि पीक संरक्षण सल्ला.",
      },
      history: {
        title: "शेती इतिहास आणि नोंदी",
        desc: "मागील माती चाचण्या आणि पिकांच्या नोंदी पहा.",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  parseMissingKeyHandler: (key: string) => {
    // If a key like "nav.dashboard" is missing, extract "dashboard" -> "Dashboard"
    const parts = key.split(".");
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
  },
});

export default i18n;
