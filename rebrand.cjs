const fs = require('fs');
const path = require('path');

const files = [
  'components/FooterContent.tsx',
  'utils/emailTemplates.ts',
  'components/ProductPages.tsx',
  'components/HomePage.tsx',
  'components/Auth.tsx',
  'components/Accounts.tsx',
  'components/AiAssistant.tsx',
  'components/Support.tsx',
  'components/Dashboard.tsx',
  'components/PrivacyPolicy.tsx',
  'components/RequestMoney.tsx',
  'components/Services.tsx',
  'components/ui/GlobalLoader.tsx',
  'components/ui/HighYieldEnrollmentModal.tsx',
  'components/ui/Layout.tsx',
  'components/ui/DebugLogger.tsx',
  'utils/receipt.ts',
  'services/geminiService.ts',
];

const base = '/Users/rityxtech/Desktop/Web Projects/LennoxBank';

files.forEach(f => {
  const fp = path.join(base, f);
  if (!fs.existsSync(fp)) { console.log('SKIP (not found):', f); return; }
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;

  // Add APP_CONFIG import if not present and file has Lennox references
  if (/Lennox/i.test(content) && !/APP_CONFIG/.test(content)) {
    if (content.includes("import React")) {
      content = content.replace(/(import React.*?from.*?;)/, "$1\nimport { APP_CONFIG } from '../config';");
    } else if (content.includes("import ")) {
      content = content.replace(/(import .*?from .*?;)/, "$1\nimport { APP_CONFIG } from '../config';");
    }
  }

  // Replace patterns (order matters - longer first)
  content = content.replace(/Lennox Meridian Holdings/g, "{APP_CONFIG.COMPANY_NAME}");
  content = content.replace(/Lennox Invest LLC/g, "{APP_CONFIG.LEGAL_ENTITY}");
  content = content.replace(/Lennox Black/g, "{APP_CONFIG.PREMIUM_CARD_NAME}");
  content = content.replace(/Lennox Checking/g, "{APP_CONFIG.CHECKING_PRODUCT_NAME}");
  content = content.replace(/Lennox Elite/g, "{APP_CONFIG.SAVINGS_PRODUCT_NAME}");
  content = content.replace(/Lennox Invest/g, "{APP_CONFIG.INVEST_PRODUCT_NAME}");
  content = content.replace(/Lennox Bank/g, "{APP_CONFIG.BANK_NAME}");
  content = content.replace(/"Lennox"/g, '"{APP_CONFIG.BRAND_NAME}"');
  content = content.replace(/>Lennox</g, ">{APP_CONFIG.BRAND_NAME}<");
  content = content.replace(/'Lennox'/g, "'{APP_CONFIG.BRAND_NAME}'");
  content = content.replace(/`Lennox`/g, "`\${APP_CONFIG.BRAND_NAME}`");
  content = content.replace(/Lennox /g, "{APP_CONFIG.BRAND_NAME} ");
  content = content.replace(/ Lennox/g, " {APP_CONFIG.BRAND_NAME}");

  if (content !== original) {
    fs.writeFileSync(fp, content);
    console.log('UPDATED:', f);
  } else {
    console.log('NO CHANGE:', f);
  }
});
