import sgClient from '@sendgrid/client';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgClient.setApiKey(apiKey);
}

interface SendGridStats {
  opens: number;
  clicks: number;
  unique_opens: number;
 unique_clicks: number;
  delivered: number;
  bounces: number;
  blocks: number;
  spam_reports: number;
}

export async function getSendGridStats(startDate: string, endDate: string): Promise<SendGridStats> {
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY non impostata');
  }

  try {
    const request = {
      method: 'GET' as const,
      url: '/v3/stats',
      qs: {
        start_date: startDate,
        end_date: endDate,
        aggregated_by: 'day'
      }
    };

    const [response] = await sgClient.request(request);
    
    // Processa i dati di SendGrid
    const stats = response.body as any[];
    
    if (!stats || stats.length === 0) {
      return {
        opens: 0,
        clicks: 0,
        unique_opens: 0,
        unique_clicks: 0,
        delivered: 0,
        bounces: 0,
        blocks: 0,
        spam_reports: 0
      };
    }

    // Somma tutte le statistiche
    const totalStats = stats.reduce((acc, day) => {
      return {
        opens: acc.opens + (day.stats[0]?.metrics?.opens || 0),
        clicks: acc.clicks + (day.stats[0]?.metrics?.clicks || 0),
        unique_opens: acc.unique_opens + (day.stats[0]?.metrics?.unique_opens || 0),
        unique_clicks: acc.unique_clicks + (day.stats[0]?.metrics?.unique_clicks || 0),
        delivered: acc.delivered + (day.stats[0]?.metrics?.delivered || 0),
        bounces: acc.bounces + (day.stats[0]?.metrics?.bounces || 0),
        blocks: acc.blocks + (day.stats[0]?.metrics?.blocks || 0),
        spam_reports: acc.spam_reports + (day.stats[0]?.metrics?.spam_reports || 0)
      };
    }, {
      opens: 0,
      clicks: 0,
      unique_opens: 0,
      unique_clicks: 0,
      delivered: 0,
      bounces: 0,
      blocks: 0,
      spam_reports: 0
    });

    return totalStats;
  } catch (error) {
    console.error('Error fetching SendGrid stats:', error);
    throw new Error('Errore nel recupero delle statistiche SendGrid');
  }
}

export async function getCampaignStats(campaignId: number, startDate: string, endDate: string) {
  try {
    const stats = await getSendGridStats(startDate, endDate);
    
    // Calcola i tassi
    const openRate = stats.delivered > 0 ? (stats.unique_opens / stats.delivered) * 100 : 0;
    const clickRate = stats.delivered > 0 ? (stats.unique_clicks / stats.delivered) * 100 : 0;
    
    return {
      open_rate: Math.round(openRate * 100) / 100,
      click_rate: Math.round(clickRate * 100) / 100,
      total_clicks: stats.clicks,
      total_opens: stats.opens,
      unique_opens: stats.unique_opens,
      unique_clicks: stats.unique_clicks,
      delivered: stats.delivered,
      bounces: stats.bounces,
      blocks: stats.blocks,
      spam_reports: stats.spam_reports
    };
  } catch (error) {
    console.error('Error getting campaign stats:', error);
    throw error;
  }
}


