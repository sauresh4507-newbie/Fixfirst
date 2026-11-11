require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');

const seed = async () => {
  // Connect directly with longer timeout for seed script
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  console.log('MongoDB connected for seeding...');
  console.log('Seeding database...');

  // Clear existing data
  await User.deleteMany({});
  await VendorProfile.deleteMany({});

  // Create Admin
  const admin = await User.create({
    fullName: 'FixFirst Admin',
    email: 'admin@fixfirst.com',
    phone: '+91 9000000000',
    password: 'Admin@123456',
    role: 'admin',
  });
  console.log(`Admin created: ${admin.email}`);

  // Create customers one by one so pre-save hook fires
  const customer1 = await User.create({
    fullName: 'Arjun Sharma',
    email: 'arjun@example.com',
    phone: '+91 9876543210',
    password: 'Customer@123',
    role: 'customer',
  });
  const customer2 = await User.create({
    fullName: 'Priya Nair',
    email: 'priya@example.com',
    phone: '+91 9876543211',
    password: 'Customer@123',
    role: 'customer',
  });
  const customer3 = await User.create({
    fullName: 'Demo Customer',
    email: 'customer@fixfirst.com',
    phone: '+91 9876543219',
    password: 'password123',
    role: 'customer',
  });
  console.log(`3 customers created`);

  // Create vendors one by one so pre-save hook fires
  const vendor1 = await User.create({
    fullName: 'TechFix Solutions',
    email: 'techfix@example.com',
    phone: '+91 9876543212',
    password: 'Vendor@123456',
    role: 'vendor',
  });
  const vendor2 = await User.create({
    fullName: 'QuickRepair Hub',
    email: 'quickrepair@example.com',
    phone: '+91 9876543213',
    password: 'Vendor@123456',
    role: 'vendor',
  });
  const vendor3 = await User.create({
    fullName: 'FixFirst Vendor',
    email: 'vendor@fixfirst.com',
    phone: '+91 9876543218',
    password: 'password123',
    role: 'vendor',
  });

  await VendorProfile.create([
    {
      user: vendor1._id,
      businessName: 'TechFix Solutions',
      description: 'Expert repairs for smartphones and laptops with 5+ years of experience.',
      contactEmail: 'techfix@example.com',
      contactPhone: '+91 9876543212',
      address: { city: 'Mumbai', area: 'Andheri West', pinCode: '400053', state: 'Maharashtra' },
      serviceAreas: ['Mumbai', 'Andheri', 'Bandra', 'Juhu'],
      deviceCategories: ['Smartphone', 'Laptop', 'Tablet'],
      supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Dell', 'HP'],
      specializations: ['Screen Replacement', 'Battery Replacement', 'Data Recovery'],
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      rating: { average: 4.5, count: 48, total: 216 },
      totalRepairs: 48,
    },
    {
      user: vendor2._id,
      businessName: 'QuickRepair Hub',
      description: 'Fast, affordable and reliable device repair services. Same-day repairs available.',
      contactEmail: 'quickrepair@example.com',
      contactPhone: '+91 9876543213',
      address: { city: 'Bengaluru', area: 'Koramangala', pinCode: '560034', state: 'Karnataka' },
      serviceAreas: ['Bengaluru', 'Koramangala', 'HSR Layout', 'BTM Layout'],
      deviceCategories: ['Smartphone', 'Laptop', 'Desktop'],
      supportedBrands: ['Samsung', 'Xiaomi', 'Realme', 'Lenovo', 'Acer'],
      specializations: ['Water Damage Repair', 'Charging Port Fix', 'Software Issues'],
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      rating: { average: 4.2, count: 31, total: 130 },
      totalRepairs: 31,
    },
    {
      user: vendor3._id,
      businessName: 'FixFirst Vendor Hub',
      description: 'Official FixFirst Demo Vendor for repairs and troubleshooting.',
      contactEmail: 'vendor@fixfirst.com',
      contactPhone: '+91 9876543218',
      address: { city: 'Delhi', area: 'Connaught Place', pinCode: '110001', state: 'Delhi' },
      serviceAreas: ['Delhi', 'Noida', 'Gurugram'],
      deviceCategories: ['Smartphone', 'Laptop', 'Tablet'],
      supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Google'],
      specializations: ['Screen Replacement', 'Camera Fix', 'Battery Replacement'],
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      rating: { average: 4.8, count: 50, total: 240 },
      totalRepairs: 50,
    },
  ]);

  console.log(`2 vendors created with profiles`);
  console.log('\n✅ Database seeded successfully!');
  console.log(`\nTest accounts:`);
  console.log(`  Admin:    admin@fixfirst.com / Admin@123456`);
  console.log(`  Customer: arjun@example.com / Customer@123`);
  console.log(`  Vendor:   techfix@example.com / Vendor@123456`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
