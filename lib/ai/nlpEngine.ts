import { AIIntentResult, LanguageType, PaymentStatus, Product, Customer } from '@/types';

// Multilingual product lexicon for Indian Kirana & MSME
const PRODUCT_KEYWORDS: Record<string, { standardName: string; defaultUnit: string; approxPrice: number }> = {
  // Rice / Chawal
  'chawal': { standardName: 'Basmati Rice Premium', defaultUnit: 'kg', approxPrice: 60 },
  'rice': { standardName: 'Basmati Rice Premium', defaultUnit: 'kg', approxPrice: 60 },
  'chaawal': { standardName: 'Basmati Rice Premium', defaultUnit: 'kg', approxPrice: 60 },
  'chaval': { standardName: 'Basmati Rice Premium', defaultUnit: 'kg', approxPrice: 60 },
  
  // Sugar / Chini
  'sugar': { standardName: 'Refined Sugar M-Grade', defaultUnit: 'kg', approxPrice: 46 },
  'chini': { standardName: 'Refined Sugar M-Grade', defaultUnit: 'kg', approxPrice: 46 },
  'cheeni': { standardName: 'Refined Sugar M-Grade', defaultUnit: 'kg', approxPrice: 46 },
  
  // Atta / Flour
  'atta': { standardName: 'Chakki Fresh Atta', defaultUnit: 'kg', approxPrice: 42 },
  'aata': { standardName: 'Chakki Fresh Atta', defaultUnit: 'kg', approxPrice: 42 },
  'flour': { standardName: 'Chakki Fresh Atta', defaultUnit: 'kg', approxPrice: 42 },
  'gehu': { standardName: 'Chakki Fresh Atta', defaultUnit: 'kg', approxPrice: 42 },
  
  // Oil / Tel
  'oil': { standardName: 'Fortune Mustard Oil Kacchi Ghani', defaultUnit: 'litre', approxPrice: 165 },
  'tel': { standardName: 'Fortune Mustard Oil Kacchi Ghani', defaultUnit: 'litre', approxPrice: 165 },
  'sarso': { standardName: 'Fortune Mustard Oil Kacchi Ghani', defaultUnit: 'litre', approxPrice: 165 },
  'mustard': { standardName: 'Fortune Mustard Oil Kacchi Ghani', defaultUnit: 'litre', approxPrice: 165 },
  
  // Dal / Pulses
  'dal': { standardName: 'Toor Dal Desi Unpolished', defaultUnit: 'kg', approxPrice: 170 },
  'daal': { standardName: 'Toor Dal Desi Unpolished', defaultUnit: 'kg', approxPrice: 170 },
  'toor': { standardName: 'Toor Dal Desi Unpolished', defaultUnit: 'kg', approxPrice: 170 },
  'arhar': { standardName: 'Toor Dal Desi Unpolished', defaultUnit: 'kg', approxPrice: 170 },
  
  // Salt / Namak
  'salt': { standardName: 'Tata Salt Vacuum Evaporated', defaultUnit: 'packet', approxPrice: 28 },
  'namak': { standardName: 'Tata Salt Vacuum Evaporated', defaultUnit: 'packet', approxPrice: 28 },
  
  // Butter / Makhan
  'butter': { standardName: 'Amul Butter 500g', defaultUnit: 'packet', approxPrice: 285 },
  'makkhan': { standardName: 'Amul Butter 500g', defaultUnit: 'packet', approxPrice: 285 },
  'makhan': { standardName: 'Amul Butter 500g', defaultUnit: 'packet', approxPrice: 285 },
  
  // Maggi / Noodles
  'maggi': { standardName: 'Maggi 2-Minute Masala Noodles', defaultUnit: 'packet', approxPrice: 14 },
  'noodles': { standardName: 'Maggi 2-Minute Masala Noodles', defaultUnit: 'packet', approxPrice: 14 },
};

export function detectLanguage(text: string): LanguageType {
  const hindiChars = /[\u0900-\u097F]/;
  if (hindiChars.test(text)) {
    return 'hi';
  }
  const hinglishMarkers = ['ko', 'ka', 'diya', 'liya', 'udhar', 'rupaye', 'rupay', 'mein', 'paise', 'bhejo', 'kitne', 'hain', 'dena', 'chahiye', 'aata', 'chawal', 'kilo', 'agle', 'hafte'];
  const lower = text.toLowerCase();
  const hasHinglish = hinglishMarkers.some(marker => new RegExp(`\\b${marker}\\b`, 'i').test(lower));
  return hasHinglish ? 'hinglish' : 'en';
}

export function parseBusinessIntent(
  rawInput: string,
  existingProducts: Product[] = [],
  existingCustomers: Customer[] = [],
  forceCloud = false
): AIIntentResult {
  const startTime = performance.now();
  const text = rawInput.trim();
  const lower = text.toLowerCase();
  const language = detectLanguage(text);

  let intent: AIIntentResult['intent'] = 'GENERAL_BUSINESS_QUERY';
  let confidence = 0.85;
  let isAmbiguous = false;
  let requiresConfirmation = false;
  const missingFields: string[] = [];

  const extracted: AIIntentResult['extractedEntities'] = {};

  // 1. Check for specific question queries first
  if (
    lower.includes('who owes') ||
    lower.includes('paise dene hain') ||
    lower.includes('kitne paise dene') ||
    lower.includes('pending payment') ||
    lower.includes('udhar kispe') ||
    lower.includes('kis kis ka baaki') ||
    lower.includes('who has pending') ||
    (lower.includes('owes') && lower.includes('money'))
  ) {
    intent = 'CHECK_RECEIVABLE';
    confidence = 0.98;
  } else if (
    lower.includes('running low') ||
    lower.includes('low stock') ||
    lower.includes('stock khatam') ||
    lower.includes('khatam hone wala') ||
    lower.includes('reorder') ||
    lower.includes('which products are running low') ||
    lower.includes('kam stock')
  ) {
    intent = 'CHECK_INVENTORY';
    confidence = 0.99;
  } else if (
    lower.includes('today sales') ||
    lower.includes("today's sales") ||
    lower.includes('aaj ki bikri') ||
    lower.includes('aaj kitna becha') ||
    lower.includes('show today')
  ) {
    intent = 'SALES_ANALYSIS';
    confidence = 0.96;
  } else if (
    lower.includes('this week') ||
    lower.includes('is hafte') ||
    lower.includes('sells the most') ||
    lower.includes('highest selling') ||
    lower.includes('top product') ||
    lower.includes('sabse zyada')
  ) {
    intent = 'BUSINESS_SUMMARY';
    confidence = 0.95;
  } else if (
    lower.includes('record purchase') ||
    lower.includes('kharida') ||
    lower.includes('purchase from') ||
    lower.includes('maal mangwaya') ||
    lower.includes('stock mangaya')
  ) {
    intent = 'CREATE_PURCHASE';
    confidence = 0.92;
  } else if (
    lower.includes('paise diye') ||
    lower.includes('ne paise jama') ||
    lower.includes('payment received') ||
    lower.includes('record payment') ||
    lower.includes('paise chukaye')
  ) {
    intent = 'RECORD_PAYMENT';
    confidence = 0.94;
  } else if (
    lower.includes('add') && lower.includes('to inventory') ||
    lower.includes('inventory badhao') ||
    lower.includes('stock add karo')
  ) {
    intent = 'UPDATE_INVENTORY';
    confidence = 0.91;
  } else if (
    // Sale patterns: "diya", "sold", "sale", "becha", "de diya", "pack kiya"
    lower.includes('diya') ||
    lower.includes('becha') ||
    lower.includes('sale') ||
    lower.includes('sell') ||
    lower.includes('sold') ||
    lower.includes('udhar') ||
    (lower.includes('ko') && (lower.includes('rupaye') || lower.includes('kilo') || lower.includes('mein')))
  ) {
    intent = 'CREATE_SALE';
    confidence = 0.95;
  }

  // --- ENTITY EXTRACTION LOGIC ---

  // A. Customer Extraction
  // Look for existing customers first
  for (const cust of existingCustomers) {
    const custFirst = cust.name.split(' ')[0].toLowerCase();
    if (lower.includes(custFirst)) {
      extracted.customerName = cust.name;
      break;
    }
  }

  // If not matched from catalog, extract from phrasing: "X ko", "to X", "X ne"
  if (!extracted.customerName) {
    const custMatchHinglish = text.match(/([A-Z\u0900-\u097F][a-zA-Z\u0900-\u097F]+)\s+(?:ko|ne|se)/i);
    const custMatchEnglish = text.match(/(?:to|from|for|customer)\s+([A-Z][a-zA-Z]+)/i);
    if (custMatchHinglish && custMatchHinglish[1]) {
      const candidate = custMatchHinglish[1].trim();
      const lowerCandidate = candidate.toLowerCase();
      const stopWords = ['aaj', 'kal', 'parso', 'shop', 'store', 'kirana', 'maine', 'humne'];
      if (!stopWords.includes(lowerCandidate)) {
        extracted.customerName = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    } else if (custMatchEnglish && custMatchEnglish[1]) {
      extracted.customerName = custMatchEnglish[1].trim();
    }
  }

  // B. Product Extraction
  // Check known keywords
  for (const [kw, details] of Object.entries(PRODUCT_KEYWORDS)) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(lower)) {
      // Find matching product in existing catalog if exists
      const match = existingProducts.find(p => 
        p.name.toLowerCase().includes(kw) || 
        (p.nameHindi && p.nameHindi.toLowerCase().includes(kw)) ||
        p.name === details.standardName
      );
      extracted.productName = match ? match.name : details.standardName;
      if (!extracted.unit) extracted.unit = details.defaultUnit;
      break;
    }
  }

  // Also check existing product catalog names directly
  if (!extracted.productName) {
    for (const prod of existingProducts) {
      const pNameLower = prod.name.toLowerCase();
      const words = pNameLower.split(' ');
      if (words.some(w => w.length > 3 && lower.includes(w))) {
        extracted.productName = prod.name;
        if (!extracted.unit) extracted.unit = prod.unit;
        break;
      }
    }
  }

  // C. Quantity & Unit Extraction
  // e.g. "5 kilo", "5kg", "5 kg", "2 packet", "10 litre", "50 gm", "20 units"
  const qtyMatch = text.match(/(\d+(?:\.\d+)?)\s*(kilo|kg|packet|pack|litre|liter|ltr|gm|g|pcs|piece|pieces|sack|kori|units?|bora)?/i);
  if (qtyMatch) {
    extracted.quantity = parseFloat(qtyMatch[1]);
    if (qtyMatch[2]) {
      const u = qtyMatch[2].toLowerCase();
      if (u.startsWith('kilo') || u === 'kg') extracted.unit = 'kg';
      else if (u.startsWith('pack')) extracted.unit = 'packet';
      else if (u.startsWith('lit') || u === 'ltr') extracted.unit = 'litre';
      else if (u.startsWith('piec') || u === 'pcs' || u.startsWith('unit')) extracted.unit = 'pcs';
      else if (u.startsWith('sack') || u === 'bora') extracted.unit = 'sack';
      else extracted.unit = u;
    }
  }

  // D. Amount Extraction
  // e.g. "600 rupaye", "₹600", "600 rs", "600 mein", "for 600", "600 rupees"
  const amountMatch = text.match(/(?:(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?))|(?:(\d+(?:\.\d+)?)\s*(?:rupaye|rupay|rupees|rs|ka|mein|ki|me))/i);
  if (amountMatch) {
    const val = amountMatch[1] || amountMatch[2];
    if (val && parseFloat(val) !== extracted.quantity) {
      extracted.amount = parseFloat(val);
    }
  }

  // Fallback: If numbers are found like "5 kilo rice 600", look for the second number
  if (!extracted.amount) {
    const numbers = text.match(/\b\d+\b/g);
    if (numbers && numbers.length > 1) {
      const candidates = numbers.map(Number).filter(n => n !== extracted.quantity);
      if (candidates.length > 0) {
        // Largest number or second number usually is amount
        extracted.amount = Math.max(...candidates);
      }
    }
  }

  // E. Payment Status & Due Date Extraction
  if (
    lower.includes('udhar') ||
    lower.includes('credit') ||
    lower.includes('agle hafte') ||
    lower.includes('baad mein') ||
    lower.includes('baad me') ||
    lower.includes('paise agle') ||
    lower.includes('likh lo')
  ) {
    extracted.paymentStatus = 'credit';
  } else if (
    lower.includes('gpay') ||
    lower.includes('phonepe') ||
    lower.includes('paytm') ||
    lower.includes('upi') ||
    lower.includes('online') ||
    lower.includes('scan')
  ) {
    extracted.paymentStatus = 'upi';
  } else if (
    lower.includes('cash') ||
    lower.includes('nakad') ||
    lower.includes('rokad')
  ) {
    extracted.paymentStatus = 'cash';
  } else {
    // Default to credit if due date is mentioned or cash if not specified
    if (lower.includes('agle hafte') || lower.includes('kal dega')) {
      extracted.paymentStatus = 'credit';
    } else {
      extracted.paymentStatus = 'cash';
    }
  }

  // Due Date calculation
  if (lower.includes('agle hafte') || lower.includes('next week')) {
    const d = new Date(Date.now() + 7 * 86400000);
    extracted.expectedPaymentDate = d.toISOString().split('T')[0];
  } else if (lower.includes('kal') || lower.includes('tomorrow')) {
    const d = new Date(Date.now() + 1 * 86400000);
    extracted.expectedPaymentDate = d.toISOString().split('T')[0];
  } else if (lower.includes('parso') || lower.includes('day after tomorrow')) {
    const d = new Date(Date.now() + 2 * 86400000);
    extracted.expectedPaymentDate = d.toISOString().split('T')[0];
  }

  // --- AMBIGUITY & VALIDATION CHECK ---
  // If intent is CREATE_SALE, we must have customer, product, quantity, and amount
  if (intent === 'CREATE_SALE') {
    if (!extracted.customerName) missingFields.push('Customer Name');
    if (!extracted.productName) missingFields.push('Product Name');
    if (!extracted.quantity) missingFields.push('Quantity');
    if (!extracted.amount) missingFields.push('Amount');

    // If any field is missing, require confirmation / edit
    if (missingFields.length > 0) {
      isAmbiguous = true;
      requiresConfirmation = true;
    } else {
      // Even complete transactions require 1-click confirmation as per Responsible AI workflow
      requiresConfirmation = true;
    }
  } else if (intent === 'CREATE_PURCHASE') {
    if (!extracted.productName) missingFields.push('Product Name');
    if (!extracted.quantity) missingFields.push('Quantity');
    if (!extracted.amount) missingFields.push('Amount');
    requiresConfirmation = true;
  } else if (intent === 'RECORD_PAYMENT') {
    if (!extracted.customerName) missingFields.push('Customer Name');
    if (!extracted.amount) missingFields.push('Amount');
    requiresConfirmation = true;
  }

  // --- RESPONSE GENERATION ---
  let suggestedResponse = '';
  if (intent === 'CREATE_SALE') {
    if (isAmbiguous) {
      suggestedResponse = `I understood the sale attempt, but some details are missing (${missingFields.join(', ')}). Please verify or fill them before recording.`;
    } else {
      suggestedResponse = `Understood: Sale of ${extracted.quantity} ${extracted.unit || 'unit'} ${extracted.productName} to ${extracted.customerName} for ₹${extracted.amount} (${extracted.paymentStatus === 'credit' ? 'Udhar / Credit' : 'Paid'}). Ready to record.`;
    }
  } else if (intent === 'CHECK_RECEIVABLE') {
    suggestedResponse = `Checking pending receivables and outstanding balances across your bahi-khata.`;
  } else if (intent === 'CHECK_INVENTORY') {
    suggestedResponse = `Checking inventory levels against reorder thresholds.`;
  } else if (intent === 'SALES_ANALYSIS') {
    suggestedResponse = `Analyzing today's sales transactions and revenue trends.`;
  } else if (intent === 'RECORD_PAYMENT') {
    suggestedResponse = `Payment detected: ₹${extracted.amount || '?'} from ${extracted.customerName || 'customer'}. Ready to update ledger.`;
  } else {
    suggestedResponse = `Query analyzed: "${text}". Retrieving relevant business intelligence.`;
  }

  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime) || 12;

  return {
    intent,
    confidence,
    detectedLanguage: language,
    isAmbiguous,
    requiresConfirmation,
    extractedEntities: extracted,
    missingFields,
    suggestedResponse,
    modelRouting: {
      model: forceCloud ? 'gemini-cloud' : 'local-lightweight',
      latencyMs: forceCloud ? 380 : latencyMs,
      estimatedTokens: Math.round(text.length * 1.3) + 120,
      confidenceScore: confidence,
    },
  };
}
