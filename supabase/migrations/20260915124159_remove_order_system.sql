-- This store is WhatsApp-only ordering: there is no online payment and no
-- in-app order management, so an Order/OrderItem record was never needed.
-- Drops the order system entirely (tables, RPCs, and the status enum).
drop function if exists public.create_order(jsonb, uuid, jsonb);
drop function if exists public.generate_order_number();
drop table if exists public.order_items;
drop table if exists public.orders;
drop type if exists public.order_status;
