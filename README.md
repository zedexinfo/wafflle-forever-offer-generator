# 🧇 Waffle Forever - Random Offer Generator

A modern, responsive Next.js web application that generates random offers for the "Waffle Forever" food service. Users can register with email or phone number, verify via OTP, and receive exciting offers with a 24-hour cooldown system.

## 🎯 Features

### Core Functionality
- **Random Offer Generation**: Users can spin for random offers from a pre-selected pool
- **Dual Registration**: Support for both email and phone number registration
- **OTP Verification**: Secure verification system with 6-digit OTPs
- **24-Hour Cooldown**: Prevents spam and maintains fairness with daily limits
- **Animated Spinning**: Engaging 3-second spinning animation for offer generation

### Offers Available
1. 🧇 Free Chocolate Waffle
2. 🥞 Free Pancake
3. 🥤 Free Cooler
4. 🧇 Free Waffle Stick
5. ☕ Free Cold Coffee
6. 🍀 Better luck Next Time
7. 🎯 You'll get it next time
8. 💪 It's okay, everyone experiences setbacks sometimes

### Technical Features
- **Modern UI/UX**: Clean, food-themed design with smooth animations
- **Mobile Responsive**: Optimized for mobile phones, tablets, and desktop
- **Real-time Validation**: Input validation and error handling
- **Redis Integration**: Scalable data storage with @vercel/kv
- **TypeScript**: Full type safety throughout the application
- **Framer Motion**: Smooth animations and transitions

## 🛠 Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Redis (via @vercel/kv)
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Redis instance (optional for development - uses mock store)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wafflle-forever-offer-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 📱 User Flow

1. **Contact Entry**: User chooses email or phone and enters their contact information
2. **OTP Verification**: User receives a 6-digit OTP and verifies their contact
3. **Offer Generation**: User clicks the spin button to generate a random offer
4. **Result Display**: User sees their offer result (win/lose) with appropriate messaging
5. **Cooldown**: User must wait 24 hours before generating another offer

## 🎨 Design Features

### Visual Design
- **Food Theme**: Orange and warm color palette reflecting the waffle/food service
- **Animated Elements**: Smooth transitions and hover effects
- **Modern Card Design**: Rounded corners, shadows, and clean typography
- **Emoji Integration**: Food-related emojis to enhance the visual experience

### Responsive Design
- **Mobile-First**: Optimized for mobile devices (375px and up)
- **Tablet Support**: Perfect layout for tablet devices
- **Desktop Ready**: Scales beautifully to larger screens

### Animations
- **Spin Animation**: Engaging rotation animation during offer generation
- **Page Transitions**: Smooth slide animations between steps
- **Bounce Effects**: Delightful micro-interactions on buttons and results
- **Loading States**: Clear loading indicators for all async operations

## 🔧 API Endpoints

### `/api/send-otp`
- **Method**: POST
- **Purpose**: Send OTP to email or phone
- **Body**: `{ contact: string, method: 'email' | 'phone' }`
- **Response**: `{ success: boolean, message: string, otp?: string }`

### `/api/verify-otp`
- **Method**: POST
- **Purpose**: Verify the OTP and check cooldown
- **Body**: `{ contact: string, otp: string }`
- **Response**: `{ success: boolean, message?: string, hoursLeft?: number }`

### `/api/generate-offer`
- **Method**: POST
- **Purpose**: Generate random offer and set cooldown
- **Body**: `{ contact: string }`
- **Response**: `{ success: boolean, offer?: Offer, message: string }`

## 💾 Data Storage

### Redis Keys
- `otp:{contact}` - Stores OTP with 10-minute expiry
- `cooldown:{contact}` - Stores last offer timestamp with 24-hour expiry
- `history:{contact}` - Stores user's last 10 offers

### Mock Storage
For development without Redis, the application uses an in-memory mock store that mimics Redis functionality.

## 🎲 Offer Algorithm

The random offer generation uses weighted probabilities:
- **40% chance**: Winning offers (Free items)
- **60% chance**: Consolation messages (Better luck next time)

This ensures a balanced experience while maintaining excitement.

## 🔒 Security Features

- **OTP Expiry**: OTPs expire after 10 minutes
- **Rate Limiting**: 24-hour cooldown prevents abuse
- **Input Validation**: Strict validation for email and phone formats
- **Error Handling**: Comprehensive error messages without exposing system details

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project to Vercel
3. Set up Vercel KV Redis store:
   - Go to your Vercel dashboard
   - Navigate to Storage tab
   - Create a new KV store
   - Copy connection details to environment variables

4. Deploy automatically with Vercel

### Environment Variables for Production

```bash
# Redis Configuration (Vercel KV)
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token

# Optional: Email service configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📈 Performance

- **Build Size**: ~141KB initial load
- **Core Web Vitals**: Optimized for excellent scores
- **Mobile Performance**: Fast loading on mobile networks
- **Caching**: Aggressive caching for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- Built with Next.js and modern React patterns
- Inspired by modern food service apps and gaming UX
- Icons by Lucide React
- Animations powered by Framer Motion

---

**Enjoy spinning for amazing offers at Waffle Forever!** 🧇✨
