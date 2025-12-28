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
    const { tradeId } = body;

    if (!tradeId) {
      return new Response("Missing trade ID", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: trade, error: tradeError } = await supabase
      .from("trade_requests")
      .select("*")
      .eq("id", tradeId)
      .maybeSingle();

    if (tradeError || !trade) {
      return new Response("Trade not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    if (trade.recipient_id !== user.id) {
      return new Response("Only recipient can accept this trade", {
        status: 403,
        headers: corsHeaders,
      });
    }

    if (trade.status !== "pending") {
      return new Response("Trade is no longer pending", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: tradeItems, error: itemsError } = await supabase
      .from("trade_items")
      .select("*")
      .eq("trade_request_id", tradeId);

    if (itemsError || !tradeItems) {
      return new Response("Failed to fetch trade items", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const senderItems = tradeItems.filter((i) => i.sender_offering);
    const recipientItems = tradeItems.filter((i) => !i.sender_offering);

    for (const item of senderItems) {
      if (item.item_type === "pet") {
        const { error: petError } = await supabase
          .from("pets")
          .update({ user_id: trade.recipient_id })
          .eq("id", item.item_id);

        if (petError) throw petError;
      } else if (item.item_type === "furniture" || item.item_type === "decor") {
        const { error: transferError } = await supabase
          .from("house_inventory")
          .update({ user_id: trade.recipient_id })
          .eq("item_id", item.item_id)
          .eq("user_id", trade.sender_id)
          .limit(1);

        if (transferError) throw transferError;
      } else {
        const { data: accessoryItem } = await supabase
          .from("accessory_inventory")
          .select("*")
          .eq("item_id", item.item_id)
          .eq("user_id", trade.sender_id)
          .maybeSingle();

        if (accessoryItem) {
          const { error: updateError } = await supabase
            .from("accessory_inventory")
            .update({
              quantity: Math.max(0, accessoryItem.quantity - 1),
            })
            .eq("id", accessoryItem.id);

          if (updateError) throw updateError;

          const { data: recipientAccessory } = await supabase
            .from("accessory_inventory")
            .select("*")
            .eq("item_id", item.item_id)
            .eq("user_id", trade.recipient_id)
            .maybeSingle();

          if (recipientAccessory) {
            const { error: addError } = await supabase
              .from("accessory_inventory")
              .update({
                quantity: recipientAccessory.quantity + 1,
              })
              .eq("id", recipientAccessory.id);

            if (addError) throw addError;
          } else {
            const { error: insertError } = await supabase
              .from("accessory_inventory")
              .insert({
                user_id: trade.recipient_id,
                item_id: item.item_id,
                item_name: item.item_name,
                item_type: item.item_type,
                item_emoji: item.item_emoji,
                quantity: 1,
              });

            if (insertError) throw insertError;
          }
        }
      }
    }

    for (const item of recipientItems) {
      if (item.item_type === "pet") {
        const { error: petError } = await supabase
          .from("pets")
          .update({ user_id: trade.sender_id })
          .eq("id", item.item_id);

        if (petError) throw petError;
      } else if (item.item_type === "furniture" || item.item_type === "decor") {
        const { error: transferError } = await supabase
          .from("house_inventory")
          .update({ user_id: trade.sender_id })
          .eq("item_id", item.item_id)
          .eq("user_id", trade.recipient_id)
          .limit(1);

        if (transferError) throw transferError;
      } else {
        const { data: accessoryItem } = await supabase
          .from("accessory_inventory")
          .select("*")
          .eq("item_id", item.item_id)
          .eq("user_id", trade.recipient_id)
          .maybeSingle();

        if (accessoryItem) {
          const { error: updateError } = await supabase
            .from("accessory_inventory")
            .update({
              quantity: Math.max(0, accessoryItem.quantity - 1),
            })
            .eq("id", accessoryItem.id);

          if (updateError) throw updateError;

          const { data: senderAccessory } = await supabase
            .from("accessory_inventory")
            .select("*")
            .eq("item_id", item.item_id)
            .eq("user_id", trade.sender_id)
            .maybeSingle();

          if (senderAccessory) {
            const { error: addError } = await supabase
              .from("accessory_inventory")
              .update({
                quantity: senderAccessory.quantity + 1,
              })
              .eq("id", senderAccessory.id);

            if (addError) throw addError;
          } else {
            const { error: insertError } = await supabase
              .from("accessory_inventory")
              .insert({
                user_id: trade.sender_id,
                item_id: item.item_id,
                item_name: item.item_name,
                item_type: item.item_type,
                item_emoji: item.item_emoji,
                quantity: 1,
              });

            if (insertError) throw insertError;
          }
        }
      }
    }

    const { error: updateTradeError } = await supabase
      .from("trade_requests")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", tradeId);

    if (updateTradeError) throw updateTradeError;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Trade acceptance error:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});