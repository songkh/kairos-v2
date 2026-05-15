/**
 * インメモリ Prisma モック（USE_MOCKS=true 専用）
 *
 * Supabase / PostgreSQL なしでローカル開発を可能にする。
 * 本番コードで絶対に使わないこと。
 */

import { randomUUID } from 'crypto';

type UserRole = 'USER' | 'COACH' | 'ADMIN';
type ActivityType = 'RUN' | 'WALK' | 'TRAIL_RUN' | 'VIRTUAL_RUN';
type ActivityPrivacy = 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';
type PaceCategory = '5K' | '10K' | 'HALF' | 'FULL';

interface MockUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lineUserId: string | null;
  appleUserId: string | null;
  googleUserId: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  homeLatitude: number | null;
  homeLongitude: number | null;
  paceBand: string | null;
}

interface MockActivity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  type: ActivityType;
  privacy: ActivityPrivacy;
  distanceM: number;
  durationSec: number;
  avgPaceSec: number;
  elevationGainM: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  startedAt: Date;
  finishedAt: Date;
  gpsTrack: unknown;
  title: string | null;
  description: string | null;
  isManual: boolean;
}

interface MockPaceRating {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  category: PaceCategory;
  rating: number;
  recentPaceSec: number | null;
}

function selectFields<T extends object>(obj: T, select: Partial<Record<keyof T, boolean>> | undefined): Partial<T> {
  if (!select) return obj;
  const result: Partial<T> = {};
  for (const key of Object.keys(select) as Array<keyof T>) {
    if (select[key]) result[key] = obj[key];
  }
  return result;
}

function applySelect<T extends object>(obj: T, select: unknown): unknown {
  if (!select) return obj;
  return selectFields(obj, select as Partial<Record<keyof T, boolean>>);
}

export class MockPrismaClient {
  private users: Map<string, MockUser> = new Map();
  private activities: Map<string, MockActivity> = new Map();
  private paceRatings: Map<string, MockPaceRating> = new Map();

  readonly user = {
    findUnique: async (args: {
      where: { id?: string; lineUserId?: string; appleUserId?: string; googleUserId?: string };
      select?: Record<string, boolean | object>;
    }) => {
      let user: MockUser | undefined;
      if (args.where.id) user = this.users.get(args.where.id);
      else if (args.where.lineUserId) user = [...this.users.values()].find(u => u.lineUserId === args.where.lineUserId);
      else if (args.where.appleUserId) user = [...this.users.values()].find(u => u.appleUserId === args.where.appleUserId);
      else if (args.where.googleUserId) user = [...this.users.values()].find(u => u.googleUserId === args.where.googleUserId);
      if (!user) return null;
      return applySelect(user, args.select);
    },

    upsert: async (args: {
      where: { lineUserId?: string; appleUserId?: string; googleUserId?: string };
      create: Partial<MockUser>;
      update: Partial<MockUser>;
      select?: Record<string, boolean>;
    }) => {
      let existing: MockUser | undefined;
      if (args.where.lineUserId) existing = [...this.users.values()].find(u => u.lineUserId === args.where.lineUserId);
      else if (args.where.appleUserId) existing = [...this.users.values()].find(u => u.appleUserId === args.where.appleUserId);
      else if (args.where.googleUserId) existing = [...this.users.values()].find(u => u.googleUserId === args.where.googleUserId);

      if (existing) {
        Object.assign(existing, args.update, { updatedAt: new Date() });
        this.users.set(existing.id, existing);
        return applySelect(existing, args.select);
      }

      const now = new Date();
      const user: MockUser = {
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        lineUserId: null,
        appleUserId: null,
        googleUserId: null,
        displayName: '',
        avatarUrl: null,
        bio: null,
        role: 'USER',
        homeLatitude: null,
        homeLongitude: null,
        paceBand: null,
        ...args.create,
      };
      this.users.set(user.id, user);
      return applySelect(user, args.select);
    },

    update: async (args: {
      where: { id: string };
      data: Partial<MockUser>;
      select?: Record<string, boolean>;
    }) => {
      const user = this.users.get(args.where.id);
      if (!user) throw new Error(`User not found: ${args.where.id}`);
      Object.assign(user, args.data, { updatedAt: new Date() });
      this.users.set(user.id, user);
      return applySelect(user, args.select);
    },

    delete: async (args: { where: { id: string } }) => {
      const user = this.users.get(args.where.id);
      if (!user) throw new Error(`User not found: ${args.where.id}`);
      this.users.delete(args.where.id);
      // カスケード削除
      for (const [id, act] of this.activities) {
        if (act.userId === args.where.id) this.activities.delete(id);
      }
      for (const [id, pr] of this.paceRatings) {
        if (pr.userId === args.where.id) this.paceRatings.delete(id);
      }
      return user;
    },
  };

  readonly activity = {
    create: async (args: {
      data: Partial<MockActivity> & { userId: string };
      select?: Record<string, boolean>;
    }) => {
      const now = new Date();
      const activity: MockActivity = {
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        type: 'RUN',
        privacy: 'PRIVATE',
        distanceM: 0,
        durationSec: 0,
        avgPaceSec: 0,
        elevationGainM: null,
        avgHeartRate: null,
        maxHeartRate: null,
        startedAt: now,
        finishedAt: now,
        gpsTrack: null,
        title: null,
        description: null,
        isManual: false,
        ...args.data,
      };
      this.activities.set(activity.id, activity);
      return applySelect(activity, args.select);
    },

    findMany: async (args: {
      where?: { userId?: string; startedAt?: { lt?: Date } };
      orderBy?: { startedAt?: 'asc' | 'desc' };
      take?: number;
      select?: Record<string, boolean>;
    }) => {
      let results = [...this.activities.values()];
      if (args.where?.userId) results = results.filter(a => a.userId === args.where!.userId);
      if (args.where?.startedAt?.lt) results = results.filter(a => a.startedAt < args.where!.startedAt!.lt!);
      if (args.orderBy?.startedAt === 'desc') results.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
      else if (args.orderBy?.startedAt === 'asc') results.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
      if (args.take) results = results.slice(0, args.take);
      return results.map(a => applySelect(a, args.select));
    },

    findUnique: async (args: {
      where: { id: string };
      select?: Record<string, boolean | object>;
    }) => {
      const activity = this.activities.get(args.where.id);
      if (!activity) return null;
      const result = applySelect(activity, args.select) as Record<string, unknown>;
      // user リレーション（select に user が含まれる場合）
      const selectObj = args.select as Record<string, unknown> | undefined;
      if (selectObj?.user) {
        const user = this.users.get(activity.userId);
        result['user'] = user ? applySelect(user, selectObj.user as Record<string, boolean>) : null;
      }
      return result;
    },

    update: async (args: {
      where: { id: string };
      data: Partial<MockActivity>;
      select?: Record<string, boolean>;
    }) => {
      const activity = this.activities.get(args.where.id);
      if (!activity) throw new Error(`Activity not found: ${args.where.id}`);
      Object.assign(activity, args.data, { updatedAt: new Date() });
      this.activities.set(activity.id, activity);
      return applySelect(activity, args.select);
    },

    delete: async (args: { where: { id: string } }) => {
      const activity = this.activities.get(args.where.id);
      if (!activity) throw new Error(`Activity not found: ${args.where.id}`);
      this.activities.delete(args.where.id);
      return activity;
    },
  };
}
