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

export type OfferStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "negotiating"
  | "accepted"
  | "rejected"
  | "expired"
  | "withdrawn";

export type OfferItemType = "cash" | "product" | "commission" | "affiliate" | "other";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export type ApplicationStatus =
  | "pending"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type ButtonStyle = "solid" | "outline" | "soft" | "shadow";
export type AccentColor =
  | "teal"
  | "purple"
  | "rose"
  | "amber"
  | "blue"
  | "slate"
  | "emerald";
export type FontChoice = "default" | "cairo" | "tajawal" | "almarai";

export type StoreProductType =
  | "digital_download"
  | "course"
  | "coaching_call"
  | "membership"
  | "payment_link";

export type StoreOrderStatus =
  | "pending"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type WalletTransactionType =
  | "sale"
  | "platform_fee"
  | "offer_payment"
  | "payout"
  | "refund"
  | "affiliate_commission"
  | "adjustment";

export type WalletStatus = "pending" | "cleared" | "paid_out" | "cancelled";

export type PayoutStatus = "requested" | "processing" | "paid" | "rejected";

export type NotificationType =
  | "offer_received"
  | "offer_accepted"
  | "offer_rejected"
  | "offer_withdrawn"
  | "campaign_invite"
  | "application_update"
  | "new_sale"
  | "payout_processed"
  | "verification_update"
  | "general";

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
  button_style: ButtonStyle;
  accent_color: AccentColor;
  font_choice: FontChoice;
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

type OfferRow = {
  id: string;
  campaign_id: string | null;
  company_organization_id: string;
  creator_organization_id: string;
  title: string | null;
  message: string | null;
  currency: string;
  total_estimated_value: number | null;
  status: OfferStatus;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

type OfferItemRow = {
  id: string;
  offer_id: string;
  type: OfferItemType;
  label: string | null;
  amount: number | null;
  percentage: number | null;
  quantity: number | null;
  description: string | null;
  metadata: Json;
  created_at: string;
}

type CampaignRow = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  budget: number | null;
  currency: string;
  status: CampaignStatus;
  starts_at: string | null;
  ends_at: string | null;
  settings: Json;
  created_at: string;
  updated_at: string;
}

type CampaignApplicationRow = {
  id: string;
  campaign_id: string;
  creator_organization_id: string;
  status: ApplicationStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
}

type StoreProductRow = {
  id: string;
  organization_id: string;
  type: StoreProductType;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  compare_at_price: number | null;
  digital_file_url: string | null;
  call_duration_minutes: number | null;
  payment_link_url: string | null;
  is_active: boolean;
  sort_order: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

type StoreOrderRow = {
  id: string;
  product_id: string;
  organization_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  amount: number;
  currency: string;
  status: StoreOrderStatus;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
}

type WalletTransactionRow = {
  id: string;
  organization_id: string;
  type: WalletTransactionType;
  amount: number;
  currency: string;
  status: WalletStatus;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  available_at: string | null;
  created_at: string;
}

type PayoutRequestRow = {
  id: string;
  organization_id: string;
  amount: number;
  currency: string;
  method: string;
  account_details: string;
  status: PayoutStatus;
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
}

type CampaignPostRow = {
  id: string;
  campaign_id: string;
  creator_organization_id: string;
  platform: string;
  post_url: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

type FanContactRow = {
  id: string;
  organization_id: string;
  email: string;
  name: string | null;
  source: string | null;
  created_at: string;
}

type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link_url: string | null;
  read_at: string | null;
  metadata: Json;
  created_at: string;
}

type AffiliateLinkRow = {
  id: string;
  program_id: string;
  creator_organization_id: string;
  code: string;
  destination_url: string;
  clicks_count: number;
  conversions_count: number;
  created_at: string;
  updated_at: string;
}

type VerificationRequestRow = {
  id: string;
  organization_id: string;
  submitted_by: string | null;
  status: "pending" | "approved" | "rejected";
  documents: Json;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

type SubscriptionRow = {
  id: string;
  organization_id: string;
  plan_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

type BookingSlotRow = {
  id: string;
  product_id: string;
  organization_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  order_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  meeting_link: string | null;
  created_at: string;
}

type ReferralRewardRow = {
  id: string;
  referrer_org_id: string;
  referred_user_id: string;
  reward_amount: number;
  currency: string;
  status: string;
  created_at: string;
}

type ContentDeliverableRow = {
  id: string;
  offer_id: string;
  campaign_post_id: string | null;
  creator_organization_id: string;
  title: string;
  content_url: string | null;
  description: string | null;
  status: string;
  feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
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
          button_style?: ButtonStyle;
          accent_color?: AccentColor;
          font_choice?: FontChoice;
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
      offers: TableDef<
        OfferRow,
        {
          id?: string;
          campaign_id?: string | null;
          company_organization_id: string;
          creator_organization_id: string;
          title?: string | null;
          message?: string | null;
          currency?: string;
          total_estimated_value?: number | null;
          status?: OfferStatus;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      offer_items: TableDef<
        OfferItemRow,
        {
          id?: string;
          offer_id: string;
          type: OfferItemType;
          label?: string | null;
          amount?: number | null;
          percentage?: number | null;
          quantity?: number | null;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
      campaigns: TableDef<
        CampaignRow,
        {
          id?: string;
          organization_id: string;
          title: string;
          description?: string | null;
          budget?: number | null;
          currency?: string;
          status?: CampaignStatus;
          starts_at?: string | null;
          ends_at?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      campaign_applications: TableDef<
        CampaignApplicationRow,
        {
          id?: string;
          campaign_id: string;
          creator_organization_id: string;
          status?: ApplicationStatus;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      store_products: TableDef<
        StoreProductRow,
        {
          id?: string;
          organization_id: string;
          type: StoreProductType;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          price: number;
          currency?: string;
          compare_at_price?: number | null;
          digital_file_url?: string | null;
          call_duration_minutes?: number | null;
          payment_link_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          sales_count?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      store_orders: TableDef<
        StoreOrderRow,
        {
          id?: string;
          product_id: string;
          organization_id: string;
          buyer_name: string;
          buyer_email: string;
          buyer_phone?: string | null;
          amount: number;
          currency?: string;
          status?: StoreOrderStatus;
          payment_reference?: string | null;
          notes?: string | null;
          created_at?: string;
        }
      >;
      wallet_transactions: TableDef<
        WalletTransactionRow,
        {
          id?: string;
          organization_id: string;
          type: WalletTransactionType;
          amount: number;
          currency?: string;
          status?: WalletStatus;
          description?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          available_at?: string | null;
          created_at?: string;
        }
      >;
      payout_requests: TableDef<
        PayoutRequestRow,
        {
          id?: string;
          organization_id: string;
          amount: number;
          currency?: string;
          method?: string;
          account_details: string;
          status?: PayoutStatus;
          admin_notes?: string | null;
          processed_at?: string | null;
          created_at?: string;
        }
      >;
      campaign_posts: TableDef<
        CampaignPostRow,
        {
          id?: string;
          campaign_id: string;
          creator_organization_id: string;
          platform: string;
          post_url: string;
          views?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          approved?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      affiliate_links: TableDef<
        AffiliateLinkRow,
        {
          id?: string;
          program_id: string;
          creator_organization_id: string;
          code: string;
          destination_url: string;
          clicks_count?: number;
          conversions_count?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      verification_requests: TableDef<
        VerificationRequestRow,
        {
          id?: string;
          organization_id: string;
          submitted_by?: string | null;
          status?: "pending" | "approved" | "rejected";
          documents?: Json;
          review_notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        }
      >;
      subscriptions: TableDef<
        SubscriptionRow,
        {
          id?: string;
          organization_id: string;
          plan_id: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        }
      >;
      booking_slots: TableDef<
        BookingSlotRow,
        {
          id?: string;
          product_id: string;
          organization_id: string;
          starts_at: string;
          ends_at: string;
          status?: string;
          order_id?: string | null;
          buyer_name?: string | null;
          buyer_email?: string | null;
          meeting_link?: string | null;
          created_at?: string;
        }
      >;
      referral_rewards: TableDef<
        ReferralRewardRow,
        {
          id?: string;
          referrer_org_id?: string | null;
          referred_user_id?: string | null;
          reward_amount?: number;
          currency?: string;
          status?: string;
          created_at?: string;
        }
      >;
      content_deliverables: TableDef<
        ContentDeliverableRow,
        {
          id?: string;
          offer_id: string;
          campaign_post_id?: string | null;
          creator_organization_id: string;
          title: string;
          content_url?: string | null;
          description?: string | null;
          status?: string;
          feedback?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        }
      >;
      fan_contacts: TableDef<
        FanContactRow,
        {
          id?: string;
          organization_id: string;
          email: string;
          name?: string | null;
          source?: string | null;
          created_at?: string;
        }
      >;
      notifications: TableDef<
        NotificationRow,
        {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          link_url?: string | null;
          read_at?: string | null;
          metadata?: Json;
          created_at?: string;
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
      increment_affiliate_click: {
        Args: { _link_id: string };
        Returns: undefined;
      };
    };
  };
}


/* ── Convenience aliases ────────────────────────────────────── */

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type CreatorProfile = Database["public"]["Tables"]["creator_profiles"]["Row"];
export type CompanyProfile = Database["public"]["Tables"]["company_profiles"]["Row"];
export type SocialAccount = Database["public"]["Tables"]["social_accounts"]["Row"];
export type BioPage = Database["public"]["Tables"]["bio_pages"]["Row"];
export type BioBlock = Database["public"]["Tables"]["bio_blocks"]["Row"];
export type Offer = Database["public"]["Tables"]["offers"]["Row"];
export type OfferItem = Database["public"]["Tables"]["offer_items"]["Row"];
export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignApplication = Database["public"]["Tables"]["campaign_applications"]["Row"];
export type StoreProduct = Database["public"]["Tables"]["store_products"]["Row"];
export type StoreOrder = Database["public"]["Tables"]["store_orders"]["Row"];
export type WalletTransaction = Database["public"]["Tables"]["wallet_transactions"]["Row"];
export type PayoutRequest = Database["public"]["Tables"]["payout_requests"]["Row"];
export type CampaignPost = Database["public"]["Tables"]["campaign_posts"]["Row"];
export type BookingSlot = Database["public"]["Tables"]["booking_slots"]["Row"];
export type ReferralReward = Database["public"]["Tables"]["referral_rewards"]["Row"];
export type ContentDeliverable = Database["public"]["Tables"]["content_deliverables"]["Row"];
export type AppNotification = Database["public"]["Tables"]["notifications"]["Row"];
export type FanContact = Database["public"]["Tables"]["fan_contacts"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

