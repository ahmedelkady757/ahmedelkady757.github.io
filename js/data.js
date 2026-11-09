// Everything you would normally want to edit lives in this file.
// Text, links, colors, media paths. The rest of the site reads from here.

export const OWNER = {
  name: 'Ahmed Elkady',
  fullName: 'Ahmed Khaled Mahmoud',
  role: 'iOS Developer',
  location: 'Cairo, Egypt',
  email: 'ahmedelkady757@gmail.com',
  github: 'https://github.com/ahmedelkady757',
  linkedin: 'https://www.linkedin.com/in/ahmedelkady757/',
};

// The four "how an app gets built" chapters. The phone acts each one out.
export const BEATS = [
  {
    id: 'blank',
    screen: 'blank',
    kicker: 'Step 01 / The problem',
    title: ['It starts', 'blank'],
    body: 'An empty screen and one real problem. For Medsy, that problem was ten phone calls to find a single medicine.',
    bg: '#FBF8F1', fg: '#14110C', accent: '#C8553D', side: 'left', phone: '#9a948b',
  },
  {
    id: 'layers',
    screen: 'ui',
    kicker: 'Step 02 / The architecture',
    title: ['Split into', 'layers'],
    body: 'Presentation, domain, data. Clean Architecture, MVVM, MVP, VIPER or Coordinator, chosen for what the app needs, so one layer can change without breaking the rest.',
    bg: '#93A98F', fg: '#10210F', accent: '#FBF8F1', side: 'left', phone: '#9a948b',
  },
  {
    id: 'code',
    screen: 'code',
    kicker: 'Step 03 / The code',
    title: ['Written', 'native'],
    body: 'Swift, SwiftUI, UIKit and Objective-C on iOS. Kotlin, Java and Jetpack Compose on Android. Dart and Flutter when one codebase is the right call.',
    note: 'On screen: NetworkService.swift, from Top League.',
    bg: '#EFD28B', fg: '#241A05', accent: '#C8553D', side: 'left', phone: '#26262b',
  },
  {
    id: 'tests',
    screen: 'tests',
    kicker: 'Step 04 / The proof',
    title: ['Proven', 'by tests'],
    body: 'Services sit behind protocols, so a mock can stand in for the network. These are the 26 real test names from Top League, running against MockNetworkService.',
    bg: '#C8553D', fg: '#FFF4EA', accent: '#EFD28B', side: 'right', phone: '#3a2a24',
  },
];

// The eight flagship apps, in scroll order.
// media.type: 'video' plays on the phone, 'images' cycles through the screens.
// media.landscape turns the phone sideways.
export const PROJECTS = [
  {
    id: 'medsy',
    name: 'Medsy',
    kicker: 'Graduation project / ITI, 2026',
    tag: 'One request replaces ten calls.',
    body: 'Patients scan a prescription, nearby pharmacies answer with prices and alternatives, and the patient decides what to confirm. One master order tracks every pharmacy’s part of it, live.',
    role: 'One of four iOS developers, working with Android and backend teams on two apps: Medsy for patients and Medsy Pharmacy.',
    stack: ['SwiftUI', 'Swinject', 'Alamofire', 'Stripe', 'Lottie', 'AI search'],
    bg: '#CDEEDD', fg: '#083D31', accent: '#0E8F6E', phone: '#0E6B54',
    media: { type: 'video', src: 'assets/video/medsy.mp4', poster: 'assets/posters/medsy.webp', landscape: true },
    floats: [
      { src: 'assets/photos/medsy-team.webp', alt: 'The Medsy graduation team in front of the ITI backdrop' },
      { src: 'assets/photos/medsy-title.webp', alt: 'Medsy title slide reading One Request Replaces Ten Calls' },
    ],
    repo: 'https://github.com/ahmedelkady757/Medsy-iOS',
    icon: 'assets/icons/medsy.webp',
  },
  {
    id: 'pocketshop',
    name: 'PocketShop',
    kicker: 'JETS MobileX Challenge 2026 / Certificate of Achievement',
    tag: 'A full store, split into 15 Swift packages.',
    body: 'An iOS store on Shopify’s Storefront and Admin GraphQL APIs. Coordinators own navigation, packages own features, and an AI assistant handles chat, product comparison, image search and outfit suggestions.',
    role: 'Built by a team of four during the challenge, June 27 to July 9, 2026.',
    stack: ['SwiftUI', 'Swift Packages', 'Coordinator', 'GraphQL / Apollo', 'Swift Concurrency'],
    bg: '#CF2A4D', fg: '#FFF5EF', accent: '#FFD9A8', phone: '#1d1519',
    media: { type: 'images', screens: ['01', '02', '03', '04', '05'].map((n) => `assets/screens/pocketshop/${n}.webp`) },
    floats: [
      { src: 'assets/photos/cert-mobilex.webp', alt: 'Certificate of Achievement for the JETS MobileX Challenge 2026', zoom: true },
      { src: 'assets/screens/pocketshop/03.webp', alt: 'PocketShop AI-powered features screen', screen: true },
    ],
    repo: 'https://github.com/ahmedelkady757/Shopify',
    icon: 'assets/icons/pocketshop.webp',
  },
  {
    id: 'topleague',
    name: 'Top League',
    kicker: 'iOS / Team of two',
    tag: 'Four sports. Two languages. One network contract.',
    body: 'Leagues, teams, players and match details for football, basketball, cricket and tennis. Arabic and English switch at runtime with full RTL, and favorites stay available offline through Core Data.',
    role: 'Built with Sherry Ahmos at ITI, on a protocol-based network layer covered by 26 mock-backed tests.',
    stack: ['Swift', 'UIKit', 'MVP', 'Core Data', 'Alamofire', 'Lottie', 'XCTest'],
    bg: '#1737C4', fg: '#EEF2FF', accent: '#FFD84D', phone: '#0d1a66',
    media: { type: 'video', src: 'assets/video/topleague.mp4', poster: 'assets/posters/topleague.webp' },
    floats: [
      { src: 'assets/screens/topleague/02.webp', alt: 'Top League match details in Arabic', screen: true },
      { src: 'assets/screens/topleague/04.webp', alt: 'Top League player statistics', screen: true },
    ],
    repo: 'https://github.com/ahmedelkady757/Top-League',
    icon: 'assets/icons/topleague.webp',
  },
  {
    id: 'climaswift',
    name: 'ClimaSwift',
    kicker: 'iOS / SwiftUI',
    tag: 'The sky sets the theme.',
    body: 'Colors and backgrounds follow each city’s local time, from morning to night. Multi-city, hourly and three-day forecasts, with saved places in SwiftData.',
    role: 'A Clean Architecture core, wired with Swinject.',
    stack: ['SwiftUI', 'SwiftData', 'Clean Architecture', 'Swinject', 'Alamofire'],
    bg: '#FFB13D', fg: '#1C1A4E', accent: '#1C1A4E', phone: '#26245f',
    media: { type: 'images', screens: ['01', '02', '03', '04', '05', '06'].map((n) => `assets/screens/climaswift/${n}.webp`) },
    floats: [
      { src: 'assets/screens/climaswift/02.webp', alt: 'ClimaSwift daytime theme', screen: true },
      { src: 'assets/screens/climaswift/01.webp', alt: 'ClimaSwift night theme', screen: true },
    ],
    repo: 'https://github.com/ahmedelkady757/ClimaSwift',
    icon: 'assets/icons/climaswift.webp',
  },
  {
    id: 'tickety',
    name: 'Tickety',
    kicker: 'Flutter / iOS and Android',
    tag: 'Find it on the map. Book it in the app.',
    body: 'Event discovery on the Ticketmaster API, with an interactive map, Firebase sign-in through email, Google or Facebook, and favorites cached for offline use.',
    role: 'Clean Architecture with BLoC, one codebase for both platforms.',
    stack: ['Flutter', 'BLoC', 'GetIt', 'Dio', 'Hive', 'GoRouter', 'Google Maps'],
    bg: '#5B4DF0', fg: '#F4F2FF', accent: '#FFE27A', phone: '#2a2490',
    media: { type: 'images', screens: ['01', '02', '03', '04', '05'].map((n) => `assets/screens/tickety/${n}.webp`) },
    floats: [
      { src: 'assets/screens/tickety/05.webp', alt: 'Tickety interactive event map', screen: true },
      { src: 'assets/screens/tickety/02.webp', alt: 'Tickety home screen', screen: true },
    ],
    repo: 'https://github.com/ahmedelkady757/Tickety',
    icon: 'assets/icons/tickety.webp',
  },
  {
    id: 'risotto',
    name: 'Risotto',
    kicker: 'Android / Java',
    tag: 'What are we cooking today?',
    body: 'Recipes by category and country, debounced search, YouTube tutorials inside each meal, and a local vault that keeps favorites readable with no connection. English and Arabic, light and dark.',
    role: 'Built at ITI, MVP with reactive streams from end to end.',
    stack: ['Java', 'MVP', 'RxJava 3', 'Retrofit', 'Room', 'Firebase Auth', 'Glide'],
    bg: '#F26A1B', fg: '#2A1204', accent: '#FFF1DC', phone: '#3b1c07',
    media: { type: 'video', src: 'assets/video/risotto.mp4', poster: 'assets/posters/risotto.webp' },
    floats: [
      { src: 'assets/screens/risotto/03.webp', alt: 'Risotto categories grid', screen: true },
      { src: 'assets/screens/risotto/04.webp', alt: 'Risotto meal details', screen: true },
    ],
    repo: 'https://github.com/ahmedelkady757/Risotto',
    icon: 'assets/icons/risotto.webp',
  },
  {
    id: 'skynews',
    name: 'SkyNews',
    kicker: 'Kotlin Multiplatform',
    tag: 'One Kotlin codebase. Two native apps.',
    body: 'Compose Multiplatform shares all of the UI across Android and iOS. Headlines arrive through Ktor and NewsAPI, and saved articles stay readable offline through Room.',
    role: 'MVVM with Clean Architecture layers, shared across platforms.',
    stack: ['KMP', 'Compose Multiplatform', 'Ktor', 'Koin', 'Room', 'Coil 3'],
    bg: '#0B1330', fg: '#F5F1E6', accent: '#F5B325', phone: '#c8a24a',
    media: { type: 'images', screens: ['01', '02', '03', '04'].map((n) => `assets/screens/skynews/${n}.webp`) },
    floats: [
      { src: 'assets/screens/skynews/03.webp', alt: 'SkyNews article screen', screen: true },
      { src: 'assets/screens/skynews/02.webp', alt: 'SkyNews saved articles', screen: true },
    ],
    repo: 'https://github.com/ahmedelkady757/SkyNews',
    icon: 'assets/icons/skynews.webp',
  },
  {
    id: 'weatherbug',
    name: 'WeatherBug',
    kicker: 'Android / Jetpack Compose',
    tag: 'Forecasts offline. Alerts on your schedule.',
    body: 'Conditions from your location or any point on a Google Map, hourly and daily forecasts, custom alerts scheduled in the background, and full Arabic support with metric and imperial units.',
    role: 'MVVM with Clean Architecture principles.',
    stack: ['Kotlin', 'Compose', 'Coroutines / Flow', 'Koin', 'Room', 'DataStore', 'WorkManager'],
    bg: '#A9D94B', fg: '#12300B', accent: '#12300B', phone: '#2e5a18',
    media: { type: 'images', screens: ['01', '02', '03', '04', '05', '06'].map((n) => `assets/screens/weatherbug/${n}.webp`) },
    floats: [
      { src: 'assets/screens/weatherbug/04.webp', alt: 'WeatherBug map location picker', screen: true },
      { src: 'assets/screens/weatherbug/06.webp', alt: 'WeatherBug settings', screen: true },
    ],
    repo: 'https://github.com/ahmedelkady757/WeatherBug',
    icon: 'assets/icons/weatherbug.webp',
  },
];

// Smaller projects, shown as a list with hover previews.
export const ARCHIVE = [
  {
    id: 'todoist', name: 'Todoist', year: '2026', tech: 'iOS / Objective-C',
    note: 'My first iOS app. MVC, local notifications, QuickLook attachments and three-stage task flow.',
    video: 'assets/video/todoist.mp4', poster: 'assets/posters/todoist.webp',
    href: 'https://github.com/ahmedelkady757/Todoist',
  },
  {
    id: 'tictactoe', name: 'Tic Tac Toe Pro', year: '2026', tech: 'Desktop / JavaFX',
    note: 'Team project with AI difficulty levels, an online lobby, live challenges, match replay and a dedicated socket server.',
    video: 'assets/video/tictactoe.mp4', poster: 'assets/posters/tictactoe.webp', wide: true,
    href: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7415119600469716993/',
  },
  {
    id: 'toku', name: 'Toku', year: '2025', tech: 'Flutter',
    note: 'Japanese for beginners: numbers, family, colors and phrases, each with native audio.',
    poster: 'assets/screens/toku/02.webp',
    href: 'https://github.com/ahmedelkady757/toku',
  },
  {
    id: 'resto', name: 'Resto', year: '2023', tech: 'Flutter',
    note: 'Where it started. My first app: food delivery, built with Mohamed Sami.',
    video: 'assets/video/resto.mp4', poster: 'assets/posters/resto.webp',
    href: 'https://github.com/ahmedelkady757/restoapp',
  },
  {
    id: 'student', name: 'Student System', year: '2024', tech: 'Java SE',
    note: 'A desktop system for student data, built on core OOP and data structures.',
    poster: 'assets/photos/student-gpa.webp', noPeek: true,
    href: 'https://github.com/ahmedelkady757/StudentSystem',
  },
];

export const STATS = [
  { value: 3.59, decimals: 2, suffix: ' / 4', label: 'GPA, Excellent with Honors' },
  { value: 'A+', label: 'Graduation project, Minufiya University' },
  { value: 9, suffix: ' months', label: 'ITI Native Mobile diploma' },
  { value: 13, label: 'Projects on this page' },
];

export const JOURNEY = [
  {
    date: 'Aug 2023', title: 'First app', note: 'Resto, a Flutter food delivery app, built with Mohamed Sami.',
    image: 'assets/posters/resto.webp', tall: true,
  },
  {
    date: 'Jul 2025', title: 'BSc Computer Science', note: 'Minufiya University. Excellent with Honors, GPA 3.59 of 4, graduation project graded A+.',
    big: '3.59',
  },
  {
    date: 'Sep 2025', title: 'Accepted into ITI', note: 'Nine-month Professional Training Program, Intake 46, Native Mobile track.',
    image: 'assets/photos/iti-acceptance.webp', wide: true,
  },
  {
    date: 'Dec 2025', title: 'HackerRank certified', note: 'Java (Basic). Credential 0F3EAE9550B5.',
    big: 'Java', href: 'https://www.hackerrank.com/certificates/iframe/0f3eae9550b5',
  },
  {
    date: 'Jun 2026', title: 'On stage, in English', note: 'Final ITI presentation on the evolution of electric vehicles.',
    image: 'assets/photos/presenting.webp', tall: true,
  },
  {
    date: 'Jul 2026', title: 'JETS MobileX Challenge', note: 'Certificate of Achievement for PocketShop, at ITI Smart Village.',
    image: 'assets/photos/cert-mobilex.webp', wide: true, zoom: true,
  },
  {
    date: 'Aug 2026', title: 'Medsy, presented', note: 'Graduation project evaluations at ITI Smart Village, August 18 and 19.',
    image: 'assets/photos/medsy-team.webp', wide: true, zoom: true,
  },
  {
    date: 'Aug 2026', title: 'ITI graduate', note: 'Mobile Applications Development (Native). MAD 46, one last photo.',
    image: 'assets/photos/medsy-stage.webp', wide: true, zoom: true,
  },
];

export const TOOLKIT = [
  { label: 'iOS', items: ['Swift', 'SwiftUI', 'UIKit', 'Objective-C', 'Combine', 'Core Data', 'SwiftData', 'XCTest', 'VIPER', 'Coordinator'] },
  { label: 'Android', items: ['Kotlin', 'Java', 'Jetpack Compose', 'Coroutines', 'Flow', 'RxJava', 'Room', 'Hilt', 'WorkManager', 'Espresso'] },
  { label: 'Everywhere', items: ['Flutter', 'Dart', 'Kotlin Multiplatform', 'BLoC', 'Riverpod', 'Firebase', 'GraphQL', 'REST', 'Clean Architecture', 'Git'] },
];
