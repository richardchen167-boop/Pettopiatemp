import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response("Server configuration error", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const body = await req.json();
    const { petId, itemId, itemPrice, itemType, itemName, itemEmoji } = body;

    if (!petId || !itemId || !itemPrice || !itemType || !itemName || !itemEmoji) {
      return new Response("Missing required fields", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id, coins, user_id")
      .eq("id", petId)
      .maybeSingle();

    if (petError || !pet) {
      return new Response("Pet not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    if (pet.user_id !== user.id) {
      return new Response("Unauthorized: Pet does not belong to user", {
        status: 403,
        headers: corsHeaders,
      });
    }

    if (pet.coins < itemPrice) {
      return new Response("Insufficient coins", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: shopItem, error: shopError } = await supabase
      .from("shop_items")
      .select("id, price")
      .eq("id", itemId)
      .maybeSingle();

    if (shopError || !shopItem) {
      return new Response("Item not found in shop", {
        status: 404,
        headers: corsHeaders,
      });
    }

    if (shopItem.price !== itemPrice) {
      return new Response("Price mismatch: Item price has changed", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (itemType === "furniture" || itemType === "decor") {
      const { error: insertError } = await supabase
        .from("house_inventory")
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_name: itemName,
          item_type: itemType,
          item_emoji: itemEmoji,
          quantity: 1,
          placed: false,
        });

      if (insertError) {
        return new Response("Failed to add item to inventory", {
          status: 500,
          headers: corsHeaders,
        });
      }
    } else {
      const { data: existingItem } = await supabase
        .from("accessory_inventory")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("item_id", itemId)
        .maybeSingle();

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("accessory_inventory")
          .update({
            quantity: existingItem.quantity + 1,
          })
          .eq("id", existingItem.id);

        if (updateError) {
          return new Response("Failed to update inventory", {
            status: 500,
            headers: corsHeaders,
          });
        }
      } else {
        const { error: insertError } = await supabase
          .from("accessory_inventory")
          .insert({
            user_id: user.id,
            item_id: itemId,
            item_name: itemName,
            item_type: itemType,
            item_emoji: itemEmoji,
            quantity: 1,
          });

        if (insertError) {
          return new Response("Failed to add item to inventory", {
            status: 500,
            headers: corsHeaders,
          });
        }
      }
    }

    const { error: updateError } = await supabase
      .from("pets")
      .update({
        coins: pet.coins - itemPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", petId);

    if (updateError) {
      return new Response("Failed to deduct coins", {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
