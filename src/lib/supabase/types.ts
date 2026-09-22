export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          line1: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          line1: string
          phone: string
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          line1?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          color: string | null
          created_at: string
          id: string
          product_id: string
          quantity: number
          size: string | null
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          color?: string | null
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          size?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          color?: string | null
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          image_url: string | null
          is_active: boolean
          listing_blurb: string
          name: string
          seo_description: string | null
          seo_title: string | null
          short_name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          listing_blurb?: string
          name: string
          seo_description?: string | null
          seo_title?: string | null
          short_name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          listing_blurb?: string
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          short_name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          category_id: string | null
          created_at: string
          cta_href: string
          cta_label: string
          eyebrow: string
          id: string
          image_url_desktop: string
          image_url_mobile: string
          is_active: boolean
          sort_order: number
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          cta_href: string
          cta_label?: string
          eyebrow?: string
          id?: string
          image_url_desktop: string
          image_url_mobile: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          cta_href?: string
          cta_label?: string
          eyebrow?: string
          id?: string
          image_url_desktop?: string
          image_url_mobile?: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_banners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_categories: {
        Row: {
          category_id: string
          offer_id: string
        }
        Insert: {
          category_id: string
          offer_id: string
        }
        Update: {
          category_id?: string
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_categories_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_products: {
        Row: {
          offer_id: string
          product_id: string
        }
        Insert: {
          offer_id: string
          product_id: string
        }
        Update: {
          offer_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_products_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string
          description: string
          discount_percent: number
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          discount_percent: number
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_percent?: number
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          product_sku: string
          quantity: number
          size: string | null
          variant_id: string | null
        }
        Insert: {
          color?: string | null
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          product_sku: string
          quantity: number
          size?: string | null
          variant_id?: string | null
        }
        Update: {
          color?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          product_sku?: string
          quantity?: number
          size?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_city: string
          address_full_name: string
          address_id: string | null
          address_line1: string
          address_phone: string
          address_pincode: string
          address_state: string
          created_at: string
          discount: number
          id: string
          order_number: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          address_city: string
          address_full_name: string
          address_id?: string | null
          address_line1: string
          address_phone: string
          address_pincode: string
          address_state: string
          created_at?: string
          discount?: number
          id?: string
          order_number: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          address_city?: string
          address_full_name?: string
          address_id?: string | null
          address_line1?: string
          address_phone?: string
          address_pincode?: string
          address_state?: string
          created_at?: string
          discount?: number
          id?: string
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          mrp_override: number
          price_override: number
          product_id: string
          size: string
          sku: string
          stock: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          mrp_override: number
          price_override: number
          product_id: string
          size: string
          sku: string
          stock?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          mrp_override?: number
          price_override?: number
          product_id?: string
          size?: string
          sku?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          category_id: string
          colors: string[]
          created_at: string
          description: string
          highlights: string[]
          id: string
          is_active: boolean
          is_best_seller: boolean
          is_deal_of_the_day: boolean
          is_featured: boolean
          is_new_arrival: boolean
          mrp: number
          name: string
          price: number
          product_type: string
          rating: number
          review_count: number
          seo_description: string | null
          seo_title: string | null
          short_description: string
          sizes: string[]
          sku: string
          slug: string
          sold_count: number
          specifications: Json
          sport: string
          stock: number
          subcategory_id: string | null
          updated_at: string
        }
        Insert: {
          brand: string
          category_id: string
          colors?: string[]
          created_at?: string
          description?: string
          highlights?: string[]
          id?: string
          is_active?: boolean
          is_best_seller?: boolean
          is_deal_of_the_day?: boolean
          is_featured?: boolean
          is_new_arrival?: boolean
          mrp: number
          name: string
          price: number
          product_type: string
          rating?: number
          review_count?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string
          sizes?: string[]
          sku: string
          slug: string
          sold_count?: number
          specifications?: Json
          sport: string
          stock?: number
          subcategory_id?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string
          category_id?: string
          colors?: string[]
          created_at?: string
          description?: string
          highlights?: string[]
          id?: string
          is_active?: boolean
          is_best_seller?: boolean
          is_deal_of_the_day?: boolean
          is_featured?: boolean
          is_new_arrival?: boolean
          mrp?: number
          name?: string
          price?: number
          product_type?: string
          rating?: number
          review_count?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string
          sizes?: string[]
          sku?: string
          slug?: string
          sold_count?: number
          specifications?: Json
          sport?: string
          stock?: number
          subcategory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          comment: string
          created_at: string
          id: string
          is_approved: boolean
          is_verified: boolean
          product_id: string
          rating: number
          title: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          comment?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_verified?: boolean
          product_id: string
          rating: number
          title?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_verified?: boolean
          product_id?: string
          rating?: number
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          id: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          id?: string
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          id?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          wishlist_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          wishlist_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
        }
        Insert: {
          id?: string
          user_id: string
        }
        Update: {
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      best_active_offer_percent: {
        Args: { p_product_id: string }
        Returns: number
      }
      create_order: {
        Args: { p_address: Json; p_address_id: string; p_lines: Json }
        Returns: Json
      }
      generate_order_number: { Args: never; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
      merge_guest_cart: { Args: { p_items: Json }; Returns: undefined }
      refresh_product_rating: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      sync_product_variants: {
        Args: { p_product_id: string; p_variants: Json }
        Returns: undefined
      }
      update_order_status: {
        Args: {
          p_order_id: string
          p_status: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      order_status: "pending" | "confirmed" | "shipped" | "cancelled"
      user_role: "customer" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_status: ["pending", "confirmed", "shipped", "cancelled"],
      user_role: ["customer", "super_admin"],
    },
  },
} as const
