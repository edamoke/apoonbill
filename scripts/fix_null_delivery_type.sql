UPDATE orders 
SET delivery_type = CASE 
    WHEN order_type = 'delivery' THEN 'delivery'
    WHEN order_type = 'pickup' THEN 'takeaway'
    WHEN order_type = 'dine_in' THEN 'dine_in'
    WHEN order_type = 'takeaway' THEN 'takeaway'
    ELSE 'delivery'
END
WHERE delivery_type IS NULL;
