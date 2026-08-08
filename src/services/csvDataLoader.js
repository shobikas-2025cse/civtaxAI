import { parseCSV } from './csvParser';

// Pre-bundled CSV raw assets for instant zero-latency initialization
import citizensRaw from '../data/citizens.csv?raw';
import wardsRaw from '../data/wards.csv?raw';
import transactionsRaw from '../data/transactions.csv?raw';
import alertsRaw from '../data/alerts.csv?raw';
import leaderboardRaw from '../data/leaderboard.csv?raw';
import monthlyTrendRaw from '../data/monthly_trend.csv?raw';
import summaryRaw from '../data/summary.csv?raw';

class CSVDataLoader {
  constructor() {
    this.isLoaded = false;
    this.citizens = [];
    this.wards = [];
    this.transactions = [];
    this.alerts = [];
    this.leaderboard = [];
    this.monthlyTrend = [];
    this.summary = {};
    
    // Initialize immediately from pre-bundled dataset
    this.initializeFromBundled();
  }

  initializeFromBundled() {
    try {
      this.citizens = parseCSV(citizensRaw);
      this.wards = parseCSV(wardsRaw);
      this.transactions = parseCSV(transactionsRaw);
      this.alerts = parseCSV(alertsRaw);
      this.leaderboard = parseCSV(leaderboardRaw);
      this.monthlyTrend = parseCSV(monthlyTrendRaw);
      const summaryRows = parseCSV(summaryRaw);
      this.summary = summaryRows[0] || {};
      this.isLoaded = true;
    } catch (err) {
      console.warn('Failed to parse bundled CSV data, fallback initialized', err);
    }
  }

  // Support asynchronous reload from public /data directory if requested
  async loadFromPublicData() {
    try {
      const [cRes, wRes, tRes, aRes, lRes, mRes, sRes] = await Promise.all([
        fetch('/data/citizens.csv').then(r => r.text()),
        fetch('/data/wards.csv').then(r => r.text()),
        fetch('/data/transactions.csv').then(r => r.text()),
        fetch('/data/alerts.csv').then(r => r.text()),
        fetch('/data/leaderboard.csv').then(r => r.text()),
        fetch('/data/monthly_trend.csv').then(r => r.text()),
        fetch('/data/summary.csv').then(r => r.text())
      ]);

      this.citizens = parseCSV(cRes);
      this.wards = parseCSV(wRes);
      this.transactions = parseCSV(tRes);
      this.alerts = parseCSV(aRes);
      this.leaderboard = parseCSV(lRes);
      this.monthlyTrend = parseCSV(mRes);
      const summaryRows = parseCSV(sRes);
      this.summary = summaryRows[0] || {};
      this.isLoaded = true;
      return true;
    } catch (e) {
      console.info('Using bundled dataset (network fetch optional):', e.message);
      return false;
    }
  }

  getCitizens() {
    return this.citizens;
  }

  getCitizenById(id) {
    return this.citizens.find(c => c.Citizen_ID === id || c.id === id);
  }

  getCitizenByPhone(phone) {
    const cleanPhone = String(phone).replace(/\D/g, '');
    return this.citizens.find(c => {
      const p = String(c.Phone || '').replace(/\D/g, '');
      return p === cleanPhone || p.endsWith(cleanPhone) || cleanPhone.endsWith(p);
    });
  }

  getWards() {
    return this.wards;
  }

  getTransactions(citizenId = null) {
    if (!citizenId) return this.transactions;
    return this.transactions.filter(t => t.Citizen_ID === citizenId);
  }

  getAlerts(citizenId = null) {
    if (!citizenId) return this.alerts;
    return this.alerts.filter(a => a.Citizen_ID === citizenId);
  }

  getLeaderboard() {
    return this.leaderboard;
  }

  getMonthlyTrend() {
    return this.monthlyTrend;
  }

  getSummary() {
    return this.summary;
  }

  // Update in-memory citizen state (e.g. after a payment)
  updateCitizen(citizenId, updates) {
    const idx = this.citizens.findIndex(c => c.Citizen_ID === citizenId || c.id === citizenId);
    if (idx !== -1) {
      this.citizens[idx] = { ...this.citizens[idx], ...updates };
      return this.citizens[idx];
    }
    return null;
  }

  // Append new transaction in-memory
  addTransaction(txn) {
    this.transactions.unshift(txn);
  }
}

export const csvDataLoader = new CSVDataLoader();
