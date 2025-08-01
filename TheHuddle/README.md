# The Huddle: A Social Clubhouse for Sports Fans & Bettors  

**Status:** In Development  

## Concept  

The Huddle is a mobile-first social platform built for sports fans and bettors who are tired of juggling scattered group chats and faceless forums. It’s the clubhouse—one place where the banter, hot takes, and friendly wagers all live together.  

Think of it as *Reddit meets your betting group chat*—but without the noise, spam, or emphasis on the transaction. This is about the culture of sports fandom: celebrating wins, reliving “I told you so!” moments, and learning from the collective wisdom of the crew.  

## Core Features  

- **User Authentication:** Smooth sign-up/sign-in via email/password with persistent login. Profiles live in Firebase Auth + Firestore.  
- **Groups Done Right:**  
  - Public groups (e.g., *NFL Fans*) for broad banter.  
  - Private invite-only rooms for your inner circle.  
  - Join, leave, or create groups in real time—no refresh needed.  
- **Two Lanes for Content:**  
  - **Posts:** Persistent, threaded conversations for deep takes, analysis, and image uploads.  
  - **Chat:** Live, ephemeral conversations for game-day reactions—powered by `react-native-gifted-chat`.  
- **Personalized Profiles:** Every user has their own profile with display name, email, group count, and sign-out control.  
- **Main Feed:** Aggregates top posts from all joined groups into a single personalized feed.  
- **Protected, Smooth Navigation:**  
  - Authentication guard keeps secure screens locked down.  
  - Four-tab clean navigation for the main sections.  
  - Nested stacks for drilling into groups, chats, and post creation.  

## Technical Stack  

This is a full-stack mobile app built on a **React Native + Firebase BaaS** foundation.  

**Frontend**  
- Framework: React Native (Expo)  
- Language: TypeScript  
- Navigation: Expo Router (file-based v2)  
- UI: Various React Native Components
- Styling: React Native StyleSheet API  

**Backend**  
- Auth: Firebase Authentication  
- Database: Firestore for real-time storage (users, groups, posts, messages)  
- Storage: Firebase Cloud Storage for all media  

## Skills & Concepts Demonstrated  

- **Full-Stack App Architecture:** Designed the full data model from user → group → post in Firestore.  
- **Real-Time Sync:** Firestore `onSnapshot` listeners for instant updates (no manual refresh).  
- **Auth & Protected Routes:** Auth guard at the root level keeps private routes secure.  
- **Complex Navigation:** Nested stacks + tab navigation for a clean, scalable structure.  
- **Cloud Storage Integration:** Media uploads handled via Expo `ImagePicker` → Firebase Storage → Firestore.  
- **Reusable Components:** Modular components like `PostCard` and `GroupChat` keep the codebase tidy.  
- **Async React:** Hooks + `async/await` for seamless UI updates without blocking the app.  

## Future Roadmap  

The Huddle is just getting started. Here’s where it’s headed:  

- **Smarter Content Discovery:** A personalized “For You” feed powered by a recommendation algorithm that learns from user behavior, surfacing fresh groups, trending conversations, and content that matches each user’s interests.  
- **Video Integration:** Support for short-form video content to capture big moments, hot takes, and post-game recaps—turning The Huddle into a richer, more dynamic space for sports conversations.  
- **Revenue Expansion Paths:** Introduce features like premium groups, sponsored content, and enhanced community tools that create value for users while opening the door to sustainable monetization.  
