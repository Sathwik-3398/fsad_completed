#!/bin/bash

# Start Backend
cd /Users/apple/Downloads/sri-geetha-dairy-milk-products/backend
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) on port 6011"

sleep 3

# Start Customer Portal (Python simple HTTP server)
cd /Users/apple/Downloads/sri-geetha-dairy-milk-products/portals/customer
python3 -m http.server 3001 > /tmp/customer.log 2>&1 &
CUSTOMER_PID=$!
echo "✅ Customer Portal started (PID: $CUSTOMER_PID) on port 3001"

sleep 2

# Start Admin Portal (Python simple HTTP server)
cd /Users/apple/Downloads/sri-geetha-dairy-milk-products/portals/admin
python3 -m http.server 3002 > /tmp/admin.log 2>&1 &
ADMIN_PID=$!
echo "✅ Admin Portal started (PID: $ADMIN_PID) on port 3002"

sleep 2

# Start Delivery Portal (Python simple HTTP server)
cd /Users/apple/Downloads/sri-geetha-dairy-milk-products/portals/delivery
python3 -m http.server 3003 > /tmp/delivery.log 2>&1 &
DELIVERY_PID=$!
echo "✅ Delivery Portal started (PID: $DELIVERY_PID) on port 3003"

sleep 3

echo ""
echo "🎉 ALL SERVICES RUNNING!"
echo ""
echo "✅ Backend: http://localhost:6011"
echo "✅ Customer: http://localhost:3001"
echo "✅ Admin: http://localhost:3002"
echo "✅ Delivery: http://localhost:3003"
echo ""
echo "Press Ctrl+C to stop all services"

wait $BACKEND_PID $CUSTOMER_PID $ADMIN_PID $DELIVERY_PID
