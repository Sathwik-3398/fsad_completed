import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Hub from './models/Hub.js';
import DeliveryPartner from './models/DeliveryPartner.js';
import HubInventory from './models/HubInventory.js';
import Order from './models/Order.js';
import Subscription from './models/Subscription.js';
import Coupon from './models/Coupon.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Hub.deleteMany({});
    await DeliveryPartner.deleteMany({});
    await HubInventory.deleteMany({});
    await Order.deleteMany({});
    await Subscription.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // ============== HUBS/OUTLETS ==============
    const hubs = await Hub.insertMany([
      {
        id: 'HUB-001',
        name: 'Sri Geetha Dairy - Hyderabad Central',
        address: 'Nadergul, Hyderabad',
        serviceArea: 'Hyderabad City Center',
        contactNumber: '6301123113',
        status: 'ACTIVE',
        lat: 17.385044,
        lng: 78.486671
      },
      {
        id: 'HUB-002',
        name: 'Sri Geetha Dairy - Secunderabad',
        address: 'Secunderabad, Hyderabad',
        serviceArea: 'Secunderabad Market',
        contactNumber: '6301123114',
        status: 'ACTIVE',
        lat: 17.371916,
        lng: 78.524149
      },
      {
        id: 'HUB-003',
        name: 'Sri Geetha Dairy - Banjara Hills',
        address: 'Road No 1, Banjara Hills, Hyderabad',
        serviceArea: 'Banjara Hills & Surroundings',
        contactNumber: '6301123115',
        status: 'ACTIVE',
        lat: 17.398893,
        lng: 78.457919
      }
    ]);
    console.log('✅ Created 3 Hubs');

    // ============== PRODUCTS ==============
    const products = await Product.insertMany([
      {
        id: 'PROD-001',
        name: 'Fresh Cow Milk',
        category: 'Milk',
        price: 55,
        originalPrice: 65,
        quantity: '1L',
        description: 'Fresh, pure cow milk delivered daily',
        isSubscriptionAvailable: true,
        status: 'ACTIVE',
        images: []
      },
      {
        id: 'PROD-002',
        name: 'Buffalo Milk',
        category: 'Milk',
        price: 45,
        originalPrice: 55,
        quantity: '1L',
        description: 'Rich and creamy buffalo milk',
        isSubscriptionAvailable: true,
        status: 'ACTIVE',
        images: []
      },
      {
        id: 'PROD-003',
        name: 'Paneer (250g)',
        category: 'Dairy',
        price: 200,
        originalPrice: 250,
        quantity: '250g',
        description: 'Homemade fresh paneer',
        isSubscriptionAvailable: false,
        status: 'ACTIVE',
        images: []
      },
      {
        id: 'PROD-004',
        name: 'Curd (500g)',
        category: 'Dairy',
        price: 35,
        originalPrice: 45,
        quantity: '500g',
        description: 'Thick and creamy curd',
        isSubscriptionAvailable: true,
        status: 'ACTIVE',
        images: []
      },
      {
        id: 'PROD-005',
        name: 'Ghee (200ml)',
        category: 'Ghee',
        price: 500,
        originalPrice: 600,
        quantity: '200ml',
        description: 'Pure cow ghee',
        isSubscriptionAvailable: false,
        status: 'ACTIVE',
        images: []
      },
      {
        id: 'PROD-006',
        name: 'Butter (100g)',
        category: 'Dairy',
        price: 150,
        originalPrice: 180,
        quantity: '100g',
        description: 'Fresh butter',
        isSubscriptionAvailable: false,
        status: 'ACTIVE',
        images: []
      },
      {
        id: 'PROD-007',
        name: 'Yogurt (400g)',
        category: 'Dairy',
        price: 40,
        originalPrice: 50,
        quantity: '400g',
        description: 'Greek yogurt style',
        isSubscriptionAvailable: true,
        status: 'ACTIVE',
        images: []
      },
      {
        id: 'PROD-008',
        name: 'Flavored Milk - Chocolate',
        category: 'Milk',
        price: 65,
        originalPrice: 75,
        quantity: '1L',
        description: 'Chocolate flavored milk',
        isSubscriptionAvailable: true,
        status: 'ACTIVE',
        images: []
      }
    ]);
    console.log('✅ Created 8 Products');

    // ============== HUB INVENTORY ==============
    const inventoryData = [];
    for (const hub of hubs) {
      for (const product of products) {
        inventoryData.push({
          id: `HINV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          hubId: hub.id,
          productId: product.id,
          stock: Math.floor(Math.random() * 500) + 50,
          lastRestocked: new Date()
        });
      }
    }
    await HubInventory.insertMany(inventoryData);
    console.log('✅ Created Hub Inventory');

    // ============== CUSTOMERS ==============
    const customers = await User.insertMany([
      {
        id: 'USR-CUST-001',
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '9876543210',
        password: '$2b$10$hashedpassword1',
        role: 'CUSTOMER',
        walletBalance: 500,
        lastLogin: new Date()
      },
      {
        id: 'USR-CUST-002',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876543211',
        password: '$2b$10$hashedpassword2',
        role: 'CUSTOMER',
        walletBalance: 1000,
        lastLogin: new Date()
      },
      {
        id: 'USR-CUST-003',
        name: 'Amit Singh',
        email: 'amit@example.com',
        phone: '9876543212',
        password: '$2b$10$hashedpassword3',
        role: 'CUSTOMER',
        walletBalance: 750,
        lastLogin: new Date()
      },
      {
        id: 'USR-CUST-004',
        name: 'Neha Patel',
        email: 'neha@example.com',
        phone: '9876543213',
        password: '$2b$10$hashedpassword4',
        role: 'CUSTOMER',
        walletBalance: 300,
        lastLogin: new Date()
      },
      {
        id: 'USR-CUST-005',
        name: 'Vikram Reddy',
        email: 'vikram@example.com',
        phone: '9876543214',
        password: '$2b$10$hashedpassword5',
        role: 'CUSTOMER',
        walletBalance: 2000,
        lastLogin: new Date()
      }
    ]);
    console.log('✅ Created 5 Customers');

    // ============== ADMIN ==============
    const admin = await User.insertMany([
      {
        id: 'USR-ADMIN-001',
        name: 'Admin User',
        email: 'admin@geethadairy.com',
        phone: '9000000000',
        password: '$2b$10$hashedadminpassword',
        role: 'ADMIN',
        walletBalance: 0,
        lastLogin: new Date()
      }
    ]);
    console.log('✅ Created 1 Admin');

    // ============== DELIVERY PARTNERS ==============
    const deliveryPartners = await DeliveryPartner.insertMany([
      {
        id: 'DP-001',
        hubId: 'HUB-001',
        username: 'delivery_ravi',
        name: 'Ravi Kumar',
        phone: '7765432100',
        email: 'ravi@delivery.com',
        password: '$2b$10$hashedpassword1',
        vehicleType: 'BIKE',
        vehicleNumber: 'TG-09-AB-1001',
        status: 'ACTIVE',
        currentLocation: { lat: 17.385044, lng: 78.486671 },
        ratingsCount: 45,
        ratingsSum: 225,
        isVerified: true
      },
      {
        id: 'DP-002',
        hubId: 'HUB-001',
        username: 'delivery_mohan',
        name: 'Mohan Reddy',
        phone: '7765432101',
        email: 'mohan@delivery.com',
        password: '$2b$10$hashedpassword2',
        vehicleType: 'SCOOTER',
        vehicleNumber: 'TG-09-AB-1002',
        status: 'ACTIVE',
        currentLocation: { lat: 17.390000, lng: 78.490000 },
        ratingsCount: 38,
        ratingsSum: 190,
        isVerified: true
      },
      {
        id: 'DP-003',
        hubId: 'HUB-002',
        username: 'delivery_rajesh',
        name: 'Rajesh Kumar',
        phone: '7765432102',
        email: 'rajesh@delivery.com',
        password: '$2b$10$hashedpassword3',
        vehicleType: 'CAR',
        vehicleNumber: 'TG-09-AB-1003',
        status: 'ACTIVE',
        currentLocation: { lat: 17.371916, lng: 78.524149 },
        ratingsCount: 52,
        ratingsSum: 260,
        isVerified: true
      },
      {
        id: 'DP-004',
        hubId: 'HUB-002',
        username: 'delivery_suresh',
        name: 'Suresh Singh',
        phone: '7765432103',
        email: 'suresh@delivery.com',
        password: '$2b$10$hashedpassword4',
        vehicleType: 'BIKE',
        vehicleNumber: 'TG-09-AB-1004',
        status: 'ACTIVE',
        currentLocation: { lat: 17.375000, lng: 78.530000 },
        ratingsCount: 42,
        ratingsSum: 210,
        isVerified: true
      },
      {
        id: 'DP-005',
        hubId: 'HUB-003',
        username: 'delivery_anita',
        name: 'Anita Sharma',
        phone: '7765432104',
        email: 'anita@delivery.com',
        password: '$2b$10$hashedpassword5',
        vehicleType: 'SCOOTER',
        vehicleNumber: 'TG-09-AB-1005',
        status: 'ACTIVE',
        currentLocation: { lat: 17.398893, lng: 78.457919 },
        ratingsCount: 48,
        ratingsSum: 240,
        isVerified: true
      }
    ]);
    console.log('✅ Created 5 Delivery Partners');

    // ============== ORDERS ==============
    const orders = [];
    const orderStatuses = ['ordered', 'confirmed', 'packed', 'picked_up', 'in_transit', 'delivered'];
    const paymentMethods = ['WALLET', 'UPI', 'COD'];

    for (let i = 0; i < 15; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomHub = hubs[Math.floor(Math.random() * hubs.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomDeliveryPartner = deliveryPartners[Math.floor(Math.random() * deliveryPartners.length)];

      orders.push({
        id: `ORD-${Date.now()}-${i}`,
        userId: randomCustomer.id,
        outletId: randomHub.id,
        items: [
          {
            productId: randomProduct.id,
            name: randomProduct.name,
            quantity: Math.floor(Math.random() * 5) + 1,
            price: randomProduct.price
          }
        ],
        total: randomProduct.price * (Math.floor(Math.random() * 5) + 1),
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        deliveryAddress: 'Customer Address, Hyderabad',
        paymentStatus: 'PAID',
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        orderType: 'ADHOC',
        wantsInvoice: Math.random() > 0.5,
        assignedDeliveryPartner: randomDeliveryPartner.id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    await Order.insertMany(orders);
    console.log('✅ Created 15 Orders');

    // ============== SUBSCRIPTIONS ==============
    const subscriptions = [];
    const frequencies = ['DAILY', 'ALTERNATE', 'WEEKLY'];

    for (let i = 0; i < 10; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomHub = hubs[Math.floor(Math.random() * hubs.length)];
      const subscriptionProducts = products.filter(p => p.isSubscriptionAvailable);
      const randomProduct = subscriptionProducts[Math.floor(Math.random() * subscriptionProducts.length)];

      subscriptions.push({
        id: `SUB-${Date.now()}-${i}`,
        userId: randomCustomer.id,
        hubId: randomHub.id,
        productId: randomProduct.id,
        quantity: Math.floor(Math.random() * 3) + 1,
        frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        billingDay: Math.floor(Math.random() * 28) + 1,
        fixedDay: true
      });
    }
    await Subscription.insertMany(subscriptions);
    console.log('✅ Created 10 Subscriptions');

    // ============== COUPONS ==============
    const coupons = await Coupon.insertMany([
      {
        id: 'CPN-001',
        code: 'WELCOME50',
        discountType: 'PERCENT',
        value: 50,
        minOrder: 100,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        usageCount: 12,
        maxUsage: 100
      },
      {
        id: 'CPN-002',
        code: 'FLAT200',
        discountType: 'FIXED',
        value: 200,
        minOrder: 500,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        usageCount: 8,
        maxUsage: 50
      },
      {
        id: 'CPN-003',
        code: 'SUMMER30',
        discountType: 'PERCENT',
        value: 30,
        minOrder: 0,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        usageCount: 35,
        maxUsage: 200
      },
      {
        id: 'CPN-004',
        code: 'FLAT100',
        discountType: 'FIXED',
        value: 100,
        minOrder: 300,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        usageCount: 22,
        maxUsage: 100
      }
    ]);
    console.log('✅ Created 4 Coupons');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Hubs: ${hubs.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Delivery Partners: ${deliveryPartners.length}`);
    console.log(`- Orders: ${orders.length}`);
    console.log(`- Subscriptions: ${subscriptions.length}`);
    console.log(`- Coupons: ${coupons.length}`);
    console.log(`- Hub Inventory Records: ${inventoryData.length}`);

    console.log('\n🔐 Test Credentials:');
    console.log('\nADMIN:');
    console.log('- Email: admin@geethadairy.com');
    console.log('- Phone: 9000000000');
    console.log('- Password: (use as set during registration)');

    console.log('\nCUSTOMERS (examples):');
    customers.slice(0, 3).forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} - ${c.email} - ${c.phone}`);
    });

    console.log('\nDELIVERY PARTNERS (examples):');
    deliveryPartners.slice(0, 3).forEach((dp, i) => {
      console.log(`${i + 1}. ${dp.name} - ${dp.email} - ${dp.phone}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
