export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrganizationType = "creator" | "company" | "agency";

export type MemberRole =
  | "owner"
  | "company_manager"
  | "marketing_manager"
  | "employee"
  | "admin";

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "x"
  | "website";

/**
 * Bio block types are intentionally open-ended (text + app-level Zod
 * validation) so new block kinds can ship without a migration.
 */
export type BioBlockType =
  | "link"
  | "social"
  | "text"
  | "image"
  | "video"
  | "brand"
  | "affiliate"
  | "discount"
  | "campaign"
  | "heading"
  | (string & {});

export type AnalyticsEventType =
  | "bio_page_view"
  | "link_click"
  | "social_click"
  | "affiliate_click"
  | "campaign_conversion";

/* ── supabase-js structural helpers ─────────────────────────── */

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}

/** Minimal supabase-js v2-compatible table definition. */
type TableDef<Row extends object, Ins extends object> = {
  Row: Row;
  Insert: Ins;
  Update: Partial<Ins>;
  Relationships: Relationship[];
};

/* ── Rows / Inserts ─────────────────────────────────────────── */

type ProfileRow = {
  id: string;
  is_admin: boolean;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  language: string;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

type OrganizationMemberRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

type CreatorProfileRow = {
  id: string;
  organization_id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  gender: string | null;
  date_of_birth: string | null;
  verified: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

type CompanyProfileRow = {
  id: string;
  organization_id: string;
  industry: string | null;
  description: string | null;
  website: string | null;
  city: string | null;
  verified: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

type CategoryRow = {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

type CreatorCategoryRow = {
  creator_profile_id: string;
  category_id: string;
  created_at: string;
}

type SocialAccountRow = {
  id: string;
  organization_id: string;
  platform: SocialPlatform;
  username: string | null;
  url: string;
  followers_count: number;
  engagement_rate: number | null;
  average_views: number | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

type BioPageRow = {
  id: string;
  organization_id: string;
  slug: string;
  title: string;
  description: string | null;
  avatar_url: string | null;
  theme: string;
  background: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

type BioBlockRow = {
  id: string;
  bio_page_id: string;
  type: BioBlockType;
  title: string | null;
  content: string | null;
  url: string | null;
  image_url: string | null;
  position: number;
  visible: boolean;
  settings: Json;
  created_at: string;
  updated_at: string;
}

type AnalyticsEventRow = {
  id: string;
  event_type: AnalyticsEventType;
  bio_page_id: string | null;
  bio_block_id: string | null;
  organization_id: string | null;
  visitor_id: string | null;
  referrer: string | null;
  country: string | null;
  metadata: Json;
  created_at: string;
}

/* ── Database ───────────────────────────────────────────────── */

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<
        ProfileRow,
        {
          is_admin?: boolean;
          id: string;
          full_name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          language?: string;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      organizations: TableDef<
        OrganizationRow,
        {
          id?: string;
          name: string;
          slug: string;
          type: OrganizationType;
          logo_url?: string | null;
          description?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      organization_members: TableDef<
        OrganizationMemberRow,
        {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: MemberRole;
          created_at?: string;
        }
      >;
      creator_profiles: TableDef<
        CreatorProfileRow,
        {
          id?: string;
          organization_id: string;
          display_name: string;
          bio?: string | null;
          city?: string | null;
          gender?: string | null;
          date_of_birth?: string | null;
          verified?: boolean;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      company_profiles: TableDef<
        CompanyProfileRow,
        {
          id?: string;
          organization_id: string;
          industry?: string | null;
          description?: string | null;
          website?: string | null;
          city?: string | null;
          verified?: boolean;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      categories: TableDef<
        CategoryRow,
        {
          id?: string;
          name_ar: string;
          name_en: string;
          slug: string;
          icon?: string | null;
          created_at?: string;
        }
      >;
      creator_categories: TableDef<
        CreatorCategoryRow,
        {
          creator_profile_id: string;
          category_id: string;
          created_at?: string;
        }
      >;
      social_accounts: TableDef<
        SocialAccountRow,
        {
          id?: string;
          organization_id: string;
          platform: SocialPlatform;
          username?: string | null;
          url: string;
          followers_count?: number;
          engagement_rate?: number | null;
          average_views?: number | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      bio_pages: TableDef<
        BioPageRow,
        {
          id?: string;
          organization_id: string;
          slug: string;
          title: string;
          description?: string | null;
          avatar_url?: string | null;
          theme?: string;
          background?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      bio_blocks: TableDef<
        BioBlockRow,
        {
          id?: string;
          bio_page_id: string;
          type: BioBlockType;
          title?: string | null;
          content?: string | null;
          url?: string | null;
          image_url?: string | null;
          position?: number;
          visible?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      analytics_events: TableDef<
        AnalyticsEventRow,
        {
          id?: string;
          event_type: AnalyticsEventType;
          bio_page_id?: string | null;
          bio_block_id?: string | null;
          organization_id?: string | null;
          visitor_id?: string | null;
          referrer?: string | null;
          country?: string | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      slug_available: {
        Args: { _slug: string };
        Returns: boolean;
      };
    };
  };
}

/* ── Convenience aliases ────────────────────────────────────── */

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Organization =
  Database["public"]["Tables"]["organizations"]["Row"];
export type CreatorProfile =
  Database["public"]["Tables"]["creator_profiles"]["Row"];
export type CompanyProfile =
  Database["public"]["Tables"]["company_profiles"]["Row"];
export type SocialAccount =
  Database["public"]["Tables"]["social_accounts"]["Row"];
export type BioPage = Database["public"]["Tables"]["bio_pages"]["Row"];
export type BioBlock = Database["public"]["Tables"]["bio_blocks"]["Row"];
