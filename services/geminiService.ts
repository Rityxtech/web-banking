
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { APP_CONFIG } from '../config';
import { Account, Transaction } from "../types";

export const createFinancialChat = (accounts: Account[], transactions: Transaction[]): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const accountSummary = accounts.map(a => 
    `${a.name} (${a.type}): $${a.balance.toFixed(2)} (Account #: ${a.accountNumber})`
  ).join('\n');

  const transactionSummary = transactions.slice(0, 10).map(t => 
    `${t.date.split('T')[0]}: ${t.description} - $${Math.abs(t.amount)} (${t.type}) [Status: ${t.status}]`
  ).join('\n');

  const systemInstruction = `
    You are {APP_CONFIG.BRAND_NAME}, the advanced AI Financial Strategist for {APP_CONFIG.BANK_NAME}. 
    You have full access to the user's account context and the bank's operational rules.

    APP CORE RULES:
    1. KYC TIERS: 
       - Tier 1: Basic account. Daily limit is $5,000.
       - Tier 2: Verified account. Daily limit increased to $50,000. 
       - Rejection: If KYC is rejected, users must re-upload clear documents.
    2. CARDS:
       - Users can have multiple virtual cards.
       - Default cards can be replaced for a $5 fee (automatic debit).
       - Cards can be frozen/unfrozen in the Wallet tab.
    3. TRANSFERS:
       - Internal transfers are instant.
       - External transfers to banks like Chase, BoA, etc., take 1-2 business days.
    4. BILL PAY:
       - Minimum: $3.00, Maximum: $50.00 per transaction.
    5. INVESTMENTS:
       - Support for Stocks (NVDA, AAPL) and Crypto (BTC, ETH).
       - Portfolio value is calculated in real-time.

    USER CONTEXT:
    Accounts:
    ${accountSummary}

    Recent History:
    ${transactionSummary}

    GOAL:
    - Provide concise, professional financial insights.
    - If asked about limits, mention their Tier 1/2 status.
    - If asked about a "rejected" KYC, tell them to visit the Verification tab to re-upload.
    - Keep responses under 80 words. Be proactive but polite.
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });
};

export const sendMessageToAssistant = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm experiencing a temporary disconnect from the {APP_CONFIG.BRAND_NAME} mainframe. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The AI core is currently under maintenance. Please contact human support if your request is urgent.";
  }
};
