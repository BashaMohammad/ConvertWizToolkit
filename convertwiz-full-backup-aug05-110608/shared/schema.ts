import { pgTable, text, integer, timestamp, boolean, jsonb, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - Enhanced with more tracking fields
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firebaseUid: varchar('firebase_uid', { length: 128 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  plan: varchar('plan', { length: 50 }).default('free').notNull(),
  dailyUsageCount: integer('daily_usage_count').default(0).notNull(),
  totalConversions: integer('total_conversions').default(0).notNull(),
  lastConversionDate: timestamp('last_conversion_date'),
  subscriptionDate: timestamp('subscription_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  userAgent: text('user_agent'),
  lastLoginAt: timestamp('last_login_at'),
  timezone: varchar('timezone', { length: 50 }),
  preferences: jsonb('preferences').default('{}').notNull()
});

// Conversion logs table - Track all conversions
export const conversionLogs = pgTable('conversion_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  toolName: varchar('tool_name', { length: 100 }).notNull(),
  sessionId: varchar('session_id', { length: 128 }),
  fileSize: integer('file_size'), // in bytes
  conversionTime: integer('conversion_time'), // in milliseconds
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Short URLs table - Track all shortened URLs
export const shortUrls = pgTable('short_urls', {
  id: serial('id').primaryKey(),
  shortCode: varchar('short_code', { length: 10 }).unique().notNull(),
  originalUrl: text('original_url').notNull(),
  userId: integer('user_id').references(() => users.id),
  clicks: integer('clicks').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at'), // NULL means never expires
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastClickedAt: timestamp('last_clicked_at')
});

// User analytics table - Store detailed analytics
export const userAnalytics = pgTable('user_analytics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  date: timestamp('date').defaultNow().notNull(),
  toolsUsed: jsonb('tools_used').default('{}').notNull(), // {toolName: count}
  sessionsCount: integer('sessions_count').default(1).notNull(),
  totalTimeSpent: integer('total_time_spent').default(0).notNull(), // in seconds
  deviceType: varchar('device_type', { length: 50 }),
  browserName: varchar('browser_name', { length: 50 }),
  countryCode: varchar('country_code', { length: 2 }),
  referrerDomain: varchar('referrer_domain', { length: 255 })
});

// Subscription history table - Track plan changes
export const subscriptionHistory = pgTable('subscription_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  fromPlan: varchar('from_plan', { length: 50 }),
  toPlan: varchar('to_plan', { length: 50 }).notNull(),
  amount: integer('amount'), // in cents
  currency: varchar('currency', { length: 3 }).default('INR'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  isSuccessful: boolean('is_successful').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  conversionLogs: many(conversionLogs),
  shortUrls: many(shortUrls),
  analytics: many(userAnalytics),
  subscriptionHistory: many(subscriptionHistory)
}));

export const conversionLogsRelations = relations(conversionLogs, ({ one }) => ({
  user: one(users, {
    fields: [conversionLogs.userId],
    references: [users.id]
  })
}));

export const shortUrlsRelations = relations(shortUrls, ({ one }) => ({
  user: one(users, {
    fields: [shortUrls.userId],
    references: [users.id]
  })
}));

export const userAnalyticsRelations = relations(userAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [userAnalytics.userId],
    references: [users.id]
  })
}));

export const subscriptionHistoryRelations = relations(subscriptionHistory, ({ one }) => ({
  user: one(users, {
    fields: [subscriptionHistory.userId],
    references: [users.id]
  })
}));

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ConversionLog = typeof conversionLogs.$inferSelect;
export type InsertConversionLog = typeof conversionLogs.$inferInsert;
export type ShortUrl = typeof shortUrls.$inferSelect;
export type InsertShortUrl = typeof shortUrls.$inferInsert;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = typeof userAnalytics.$inferInsert;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type InsertSubscriptionHistory = typeof subscriptionHistory.$inferInsert;