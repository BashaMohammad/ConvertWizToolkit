import { db } from './db';
import { users, conversionLogs, shortUrls, userAnalytics, type User, type InsertUser, type ConversionLog, type InsertConversionLog, type ShortUrl, type InsertShortUrl } from '../shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

// Enhanced storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Conversion tracking
  logConversion(log: InsertConversionLog): Promise<ConversionLog>;
  getUserConversions(userId: number, limit?: number): Promise<ConversionLog[]>;
  getDailyUsage(userId: number, date: Date): Promise<number>;
  
  // Short URL operations
  createShortUrl(shortUrl: InsertShortUrl): Promise<ShortUrl>;
  getShortUrl(shortCode: string): Promise<ShortUrl | undefined>;
  incrementUrlClicks(shortCode: string): Promise<void>;
  getUserShortUrls(userId: number): Promise<ShortUrl[]>;
  
  // Analytics
  getUserAnalytics(userId: number): Promise<any>;
  getTotalUsers(): Promise<number>;
  getTotalConversions(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Conversion tracking
  async logConversion(log: InsertConversionLog): Promise<ConversionLog> {
    const [conversionLog] = await db
      .insert(conversionLogs)
      .values(log)
      .returning();
    
    // Update user's total conversions
    if (log.userId && log.success) {
      await db
        .update(users)
        .set({ 
          totalConversions: sql`${users.totalConversions} + 1`,
          lastConversionDate: new Date()
        })
        .where(eq(users.id, log.userId));
    }
    
    return conversionLog;
  }

  async getUserConversions(userId: number, limit: number = 50): Promise<ConversionLog[]> {
    return await db
      .select()
      .from(conversionLogs)
      .where(eq(conversionLogs.userId, userId))
      .orderBy(desc(conversionLogs.createdAt))
      .limit(limit);
  }

  async getDailyUsage(userId: number, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversionLogs)
      .where(
        and(
          eq(conversionLogs.userId, userId),
          eq(conversionLogs.success, true),
          gte(conversionLogs.createdAt, startOfDay),
          sql`${conversionLogs.createdAt} <= ${endOfDay}`
        )
      );

    return result?.count || 0;
  }

  // Short URL operations
  async createShortUrl(shortUrl: InsertShortUrl): Promise<ShortUrl> {
    const [url] = await db
      .insert(shortUrls)
      .values(shortUrl)
      .returning();
    return url;
  }

  async getShortUrl(shortCode: string): Promise<ShortUrl | undefined> {
    const [url] = await db
      .select()
      .from(shortUrls)
      .where(and(
        eq(shortUrls.shortCode, shortCode),
        eq(shortUrls.isActive, true)
      ));
    return url || undefined;
  }

  async incrementUrlClicks(shortCode: string): Promise<void> {
    await db
      .update(shortUrls)
      .set({ 
        clicks: sql`${shortUrls.clicks} + 1`,
        lastClickedAt: new Date()
      })
      .where(eq(shortUrls.shortCode, shortCode));
  }

  async getUserShortUrls(userId: number): Promise<ShortUrl[]> {
    return await db
      .select()
      .from(shortUrls)
      .where(eq(shortUrls.userId, userId))
      .orderBy(desc(shortUrls.createdAt));
  }

  // Analytics
  async getUserAnalytics(userId: number): Promise<any> {
    // Get user's conversion statistics
    const conversionStats = await db
      .select({
        toolName: conversionLogs.toolName,
        count: sql<number>`count(*)`,
        lastUsed: sql<Date>`max(${conversionLogs.createdAt})`
      })
      .from(conversionLogs)
      .where(and(
        eq(conversionLogs.userId, userId),
        eq(conversionLogs.success, true)
      ))
      .groupBy(conversionLogs.toolName)
      .orderBy(desc(sql`count(*)`));

    // Get short URL statistics
    const urlStats = await db
      .select({
        totalUrls: sql<number>`count(*)`,
        totalClicks: sql<number>`sum(${shortUrls.clicks})`
      })
      .from(shortUrls)
      .where(eq(shortUrls.userId, userId));

    return {
      conversionStats,
      urlStats: urlStats[0] || { totalUrls: 0, totalClicks: 0 }
    };
  }

  async getTotalUsers(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isActive, true));
    return result?.count || 0;
  }

  async getTotalConversions(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversionLogs)
      .where(eq(conversionLogs.success, true));
    return result?.count || 0;
  }
}

export const storage = new DatabaseStorage();