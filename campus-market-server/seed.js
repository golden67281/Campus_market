import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

async function seed() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123', salt);
  const gandhinagarHash = await bcrypt.hash('gandhinagar', salt);
  const ahmedabadHash = await bcrypt.hash('ahmedabad', salt);

  const users = [
    {
      _id: 'u_aarav',
      name: 'Aarav Shah',
      username: 'aaravshah',
      mobile: '9876543210',
      email: 'aarav@gmail.com',
      collegeEmail: 'aarav@iitgn.ac.in',
      collegeEmailVerified: true,
      college: 'IIT Gandhinagar',
      city: 'Gandhinagar',
      year: 'Final Year',
      department: 'Computer Science and Engineering',
      area: 'IIT Campus, Palaj, Gandhinagar',
      lat: 23.2156,
      lng: 72.6369,
      avatar: null,
      whatsapp: '9876543210',
      showWhatsapp: true,
      password: passwordHash,
      securityQuestion: 'In what city were you born?',
      securityAnswer: gandhinagarHash,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u_priya',
      name: 'Priya Sharma',
      username: 'priyasharma',
      mobile: '9123456789',
      email: 'priya@gmail.com',
      collegeEmail: 'priya@gu.ac.in',
      collegeEmailVerified: true,
      college: 'Gujarat University',
      city: 'Ahmedabad',
      year: '1st Year',
      department: 'B.Tech IT',
      area: 'Navrangpura, Ahmedabad',
      lat: 23.0366,
      lng: 72.5611,
      avatar: null,
      whatsapp: '9123456789',
      showWhatsapp: true,
      password: passwordHash,
      securityQuestion: 'In what city were you born?',
      securityAnswer: ahmedabadHash,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u_arjun',
      name: 'Arjun Mehta',
      username: 'arjunmehta',
      mobile: '9988776655',
      email: 'arjun@gmail.com',
      collegeEmail: null,
      collegeEmailVerified: false,
      college: 'IIT Gandhinagar',
      city: 'Gandhinagar',
      year: '3rd Year',
      department: 'Mechanical Engineering',
      area: 'IIT Campus, Palaj, Gandhinagar',
      lat: 23.2156,
      lng: 72.6369,
      avatar: null,
      whatsapp: '9988776655',
      showWhatsapp: false,
      password: passwordHash,
      securityQuestion: 'In what city were you born?',
      securityAnswer: gandhinagarHash,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];

  const products = [
    {
      _id: 'p_drawing_set',
      seller: users[0], // populated object for frontend display compatibility
      sellerId: 'u_aarav',
      title: 'Engineering Drawing Set',
      category: 'books',
      subCategory: 'Lab Items',
      condition: 'Like New',
      price: 250,
      isNegotiable: true,
      isFree: false,
      description: 'Barely used, all instruments intact. Purchased in August 2024. Includes compass set, drafter, and T-square.',
      images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'],
      tags: ['drawing', 'engineering', 'first year'],
      location: 'IIT Campus, Palaj, Gandhinagar',
      meetingSpot: 'College canteen, near main gate',
      lat: 23.2156,
      lng: 72.6369,
      college: 'IIT Gandhinagar',
      city: 'Gandhinagar',
      status: 'active',
      views: 12,
      wishlistCount: 1,
      interestCount: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
    },
    {
      _id: 'p_calculus_book',
      seller: users[0],
      sellerId: 'u_aarav',
      title: 'Calculus Thomas Finney Eleventh Edition',
      category: 'books',
      subCategory: 'Textbooks',
      condition: 'Good',
      price: 300,
      isNegotiable: false,
      isFree: false,
      description: 'Thomas Finney Calculus book in good condition. Minor markings on some pages, but completely readable.',
      images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600'],
      tags: ['calculus', 'maths', 'textbook'],
      location: 'IIT Campus, Palaj, Gandhinagar',
      meetingSpot: 'Library reception',
      lat: 23.2156,
      lng: 72.6369,
      college: 'IIT Gandhinagar',
      city: 'Gandhinagar',
      status: 'active',
      views: 24,
      wishlistCount: 2,
      interestCount: 1,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
    },
    {
      _id: 'p_headphones',
      seller: users[1],
      sellerId: 'u_priya',
      title: 'Noise Cancelling Headphones',
      category: 'electronics',
      subCategory: 'Headphones',
      condition: 'Good',
      price: 1500,
      isNegotiable: true,
      isFree: false,
      description: 'Boat Rockerz wireless noise cancelling headphones. 15 hours battery backup, Bluetooth 5.0.',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'],
      tags: ['boat', 'headphones', 'music'],
      location: 'Navrangpura, Ahmedabad',
      meetingSpot: 'Main university gate',
      lat: 23.0366,
      lng: 72.5611,
      college: 'Gujarat University',
      city: 'Ahmedabad',
      status: 'active',
      views: 45,
      wishlistCount: 4,
      interestCount: 0,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
    },
    {
      _id: 'p_study_table',
      seller: users[2],
      sellerId: 'u_arjun',
      title: 'Wooden Study Table and Chair',
      category: 'furniture',
      subCategory: 'Table',
      condition: 'Good',
      price: 1200,
      isNegotiable: true,
      isFree: false,
      description: 'Solid wood study table with a drawer. Perfect for hostel rooms. Comes with a matching wooden chair.',
      images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600'],
      tags: ['hostel', 'table', 'chair', 'furniture'],
      location: 'IIT Campus, Palaj, Gandhinagar',
      meetingSpot: 'Hostel Block B common room',
      lat: 23.2156,
      lng: 72.6369,
      college: 'IIT Gandhinagar',
      city: 'Gandhinagar',
      status: 'active',
      views: 8,
      wishlistCount: 0,
      interestCount: 0,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
    }
  ];

  const interests = [
    {
      _id: 'i_seed_interest',
      productId: 'p_calculus_book',
      buyerId: 'u_priya',
      buyerName: 'Priya Sharma',
      buyerPhone: '9123456789',
      buyerArea: 'Navrangpura, Ahmedabad',
      message: 'Hi Aarav, is this calculus book still available?',
      contactRevealed: true,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
    }
  ];

  const wishlist = [
    {
      _id: 'w_seed_1',
      userId: 'u_priya',
      productId: 'p_drawing_set',
      savedAt: new Date().toISOString()
    }
  ];

  const notifications = [
    {
      _id: 'n_seed_1',
      userId: 'u_aarav',
      type: 'buyer_interest',
      title: 'Priya Sharma expressed interest',
      body: 'Hi Aarav, is this calculus book still available?',
      relatedProductId: 'p_calculus_book',
      relatedUserId: 'u_priya',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  ];

  await fs.writeFile(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2), 'utf8');
  await fs.writeFile(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2), 'utf8');
  await fs.writeFile(path.join(DATA_DIR, 'interests.json'), JSON.stringify(interests, null, 2), 'utf8');
  await fs.writeFile(path.join(DATA_DIR, 'wishlist.json'), JSON.stringify(wishlist, null, 2), 'utf8');
  await fs.writeFile(path.join(DATA_DIR, 'notifications.json'), JSON.stringify(notifications, null, 2), 'utf8');
  await fs.writeFile(path.join(DATA_DIR, 'reports.json'), '[]', 'utf8');
  await fs.writeFile(path.join(DATA_DIR, 'drafts.json'), '[]', 'utf8');

  console.log('Database successfully seeded with initial mock data! ✅');
}

seed().catch(console.error);
