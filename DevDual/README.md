# Dev Dual — Real-Time 1v1 Competitive Coding Platform

Dev Dual is a real-time 1v1 coding battle platform built from scratch. Two developers join a shared room, get the same set of problems, and race to solve as many as possible within a fixed time window. The winner is determined by problems solved, with cumulative solve time as a tiebreaker.

This project went through long pauses and restarts, but it was one of the most technically engaging things I have built. Nearly every core feature — code execution, real-time synchronization, rating calculation, the social graph — introduced a problem I had not encountered before in a real project.

---

## Table of Contents

- [What is Dev Dual](#what-is-dev-dual)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Challenges & Learning](#challenges--learning)
- [Known Issues & Future Improvements](#known-issues--future-improvements)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Database Models](#database-models)
- [Backend Deep Dive](#backend-deep-dive)
- [API Reference](#api-reference)
- [Socket Events Reference](#socket-events-reference)
- [Frontend Deep Dive](#frontend-deep-dive)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [Local Development Setup](#local-development-setup)
- [Scripts Reference](#scripts-reference)

---

## What is Dev Dual

Dev Dual is a custom competitive programming platform where:

- A host creates a battle room, selects problems by difficulty and topic, sets a time limit.
- An opponent joins the room using an 8-character room ID.
- Once both players are in, the host starts the match and the countdown begins.
- Both players see the same problems in a Monaco-based code editor.
- Submissions are evaluated against hidden test cases inside isolated Docker containers.
- Progress is visible in real time — you can see when your opponent submits, which problem they are on, whether they passed.
- After both players end the match, ratings are updated and a results screen is shown.

Beyond the battle system, the platform includes a social graph (follow requests, private messaging, notifications), match history, a global leaderboard, company-wise DSA sheets, and system design notes.

---

## Features

- 1v1 live coding battles with real-time opponent progress
- Docker-based sandboxed code execution (no external judge API)
- Server-synchronized match countdown timer
- In-room chat during the match
- Post-match rating update with a speed bonus component
- Social system: follow/unfollow, follow requests, private messaging
- Real-time direct messages via WebSocket
- Notifications for follow requests, accepted follows, and new messages
- Match history with win/loss/draw breakdown
- Global leaderboard sorted by rating
- Email/password auth and Google Sign-In via Firebase
- Profile editing with Cloudinary image uploads
- Company-wise LeetCode problem sheets
- System design topic notes
- Gemini AI chatbot embedded in the UI

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server and REST API |
| Socket.IO 4 | Real-time WebSocket communication |
| MongoDB + Mongoose | Primary database and ODM |
| Firebase Admin SDK | Google OAuth token verification server-side |
| JWT (jsonwebtoken) | Session tokens stored as HTTP-only cookies |
| bcryptjs | Password hashing |
| Dockerode | Node.js client for the Docker API |
| Cloudinary | Profile image hosting |
| Multer | Multipart file upload handling |
| uuid / nanoid | Unique ID generation |
| validator | Input validation (email format, etc.) |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + Vite 7 | UI framework and build tool |
| React Router DOM 7 | Client-side routing |
| Socket.IO Client 4 | WebSocket connection to backend |
| Monaco Editor | VS Code-style code editor in the browser |
| TailwindCSS 4 | Styling |
| Firebase Client SDK | Google Sign-In on the browser side |
| Recharts | Charts in match history and analysis |
| React Toastify | Toast notifications |
| React Markdown | Renders problem descriptions (HTML/Markdown) |
| PapaParse | CSV parsing for DSA sheets |
| @google/genai | Gemini AI chatbot integration |

---

## Challenges & Learning

### 1. Code Execution Without a Paid Judge

The most fundamental problem: how do you safely run arbitrary user-submitted code on your server?

The obvious solution is Judge0, which handles compilation and execution in a sandboxed environment. But Judge0's hosted API is paid, and self-hosting it is heavy. I did not want to depend on a third-party paid API for a core feature.

The solution was Docker. Each submission spins up a fresh container using a custom `cpp-runner` image (just `gcc` with a working directory). The container gets a bind-mounted temp directory containing `main.cpp` and `input.txt`. It compiles with `g++ -std=c++20 -O2` and runs with `./main < input.txt`. The container has no network access, a 512 MB memory limit, a 50% CPU quota, and a 10-second hard timeout enforced by killing the container.

This meant learning Dockerode, understanding Docker's log stream framing (Docker log output has 8-byte headers per chunk that need to be stripped before reading the actual stdout/stderr), and writing output comparison logic that handles strings, JSON arrays, numbers, and floating point tolerances.

**What I learned:**
- Docker API via Node.js (Dockerode), container lifecycle management
- How to safely bind-mount directories into containers
- Parsing Docker multiplexed log streams
- Writing an output comparator that handles multiple formats (string, JSON, numeric with epsilon)

### 2. LeetCode-Style Wrapper Auto-Generation

LeetCode problems are written as `class Solution { ... }` — there is no `main()` function. Running that directly produces no output.

For each submission, the backend:
1. Regex-parses the function signature out of the `class Solution` block
2. Reads the test case input (which can be a JSON object like `{"nums": [1,2,3], "target": 5}` or a plain value)
3. Generates typed C++ variable declarations matching each parameter type (`vector<int>`, `string`, `bool`, etc.)
4. Appends a `main()` function that calls `sol.funcName(args...)` and prints the result

This was trickier than it sounds. C++ types like `vector<vector<int>>` or `long long` needed custom handling. Initializer syntax for vectors uses `{}` not `[]`. The type extraction from parameter lists had to handle references (`&`), const qualifiers, and nested templates.

**What I learned:**
- Regex-based C++ function signature parsing
- Programmatic C++ code generation for wrapper `main()` functions
- Type-to-literal conversion for different C++ types from JSON input

### 3. Real-Time Match Timer Synchronization

If both clients start a countdown independently using `Date.now()`, their clocks may differ by seconds — one client's browser clock could be off, or network latency when receiving the `match-started` event varies per player. This means both players see a different time remaining.

The solution: on mount, the `BattleContext` fetches `/auth/time` from the server and computes a clock offset:
```
offset = serverTime - Date.now() + (roundTripLatency / 2)
```
Every time computation in the frontend uses `Date.now() + serverTimeOffset` instead of raw `Date.now()`. The `startTime` broadcast in the `match-started` event is the authoritative server timestamp.

**What I learned:**
- Clock synchronization using round-trip latency estimation
- Why client clocks cannot be trusted for fairness in competitive applications

### 4. Race Conditions in Room Joining

If two people enter the same room ID simultaneously and both hit `POST /api/rooms/join` at nearly the same time, a naive find-then-update would let both through, resulting in three people in a two-person room.

The solution was a single atomic `findOneAndUpdate` with conditions: find a room that is `status: 'waiting'`, has `opponent: null`, and whose host is not the joining user — then set `opponent` and change status in the same operation. If two requests arrive simultaneously, only one succeeds in the atomic update; the other gets `null` back and receives an appropriate error.

**What I learned:**
- Atomic MongoDB operations as a concurrency control mechanism
- `findOneAndUpdate` with compound query conditions as a compare-and-swap equivalent

### 5. Match End Coordination

When a match ends, both players need to see the results at the same time, but each player independently clicks "End Match". The server cannot calculate results until it has final submission data from both players.

The solution uses an in-memory `matchEndMap` on the socket server. When a player emits `end-match`, the server marks them as done. Only when both players have signaled does the server run `calculateMatchResults()`, compute the winner, update ratings in MongoDB, emit `match-results` to the room, and delete the room. If only one player has ended, the server emits `waiting-for-opponent` back to them.

**What I learned:**
- Coordinating multi-party state on a WebSocket server
- The difference between room-lifecycle events (which affect DB) and match-end events (which need both parties to confirm)

### 6. Rating Calculation

A simple +10/-5 system felt unsatisfying. Winners who solved problems in 5 minutes should gain more than those who barely scraped a win in the last second of a 60-minute match.

The speed bonus works like this:
```
speedRatio = 1 - (totalSolveTime / maxPossibleTime)
speedBonus = floor(15 * speedRatio)   // 0 to +15 extra points
totalGain  = 10 + speedBonus
```
`maxPossibleTime` is the match duration times the number of problems solved. A player who solves all problems near instantly gets close to +25; someone who wins narrowly with one problem in the last few seconds gets closer to +10. Losers always lose -5. Draws result in no rating change.

**What I learned:**
- Designing a rating formula with a meaningful fast-win bonus
- Computing cumulative solve times per participant from `MatchParticipant.problems[].lastSubmissionTime`

### 7. Private Messaging with a Social Guard

Allowing any user to message any other user would make the platform unusable with strangers sending unsolicited messages. The rule: you can only DM someone you follow, or someone you already have an existing conversation with (so previously established conversations are preserved even if you unfollow someone).

This check is duplicated in both the REST message endpoint and the Socket.IO private message handler, since messages can arrive via either path.

**What I learned:**
- Enforcing social graph constraints on messaging
- Deduplicating notifications (if user A sends 5 unread messages, only one notification is kept and its timestamp is updated, rather than creating 5 separate notification records)

---

## Known Issues & Future Improvements

### 1. Only C++ Is Supported

This is the most significant current limitation. The `executionService.js` has a `LANGUAGE_CONFIG` object with only a `cpp` entry. The `docker/js/` and `docker/python/` directories exist but are empty placeholders. The wrapper auto-generation logic that builds `main()` functions only handles C++.

Adding Python would require a different approach: Python functions can be called more directly, but output formatting differs. JavaScript would need a Node.js runner image. Each language needs its own Docker image and its own wrapper generation logic.

### 2. Custom Data Structure Problems

This is technically the hardest open problem. Problems that use non-primitive inputs — like `ListNode` for linked list problems or `TreeNode` for binary tree problems — cannot be handled by the current auto-generation system.

The current system converts JSON inputs (arrays, numbers, strings, booleans) into C++ literals. But for a linked list problem, the input `[1, 2, 3]` needs to be converted into a chain of `ListNode*` objects, not a `vector<int>`. The struct definition for `ListNode` needs to be injected. The `main()` wrapper needs to know that this particular parameter is a linked list, not a plain vector.

Solving this properly requires:
- A problem metadata field tagging which parameters use custom types
- Pre-written constructor helpers (e.g., `ListNode* buildList(vector<int>)`) injected into the template
- Output deserialization (e.g., converting a `ListNode*` back to a readable format for comparison)

This is solvable but requires considerable effort and careful test case design per problem type.

### 3. Rating Has No Floor

Player rating can go negative. There is no floor. A new player who loses several matches in a row will go below 0. A minimum rating cap (e.g., 0 or 50) should be added.

### 4. Reconnection Handling

If a player disconnects and reconnects mid-match (refreshed the page, network dropped), their socket joins a new socket ID. The server currently marks their `opponent-disconnected` event but does not re-attach them to the match. A reconnection flow that checks for an active match and re-joins the room would improve reliability.

### 5. Problem Selection Is Random

When a host selects difficulty and topic filters, problems are selected randomly from the database. There is no guarantee of balance, no duplicate prevention across matches, and no weighting toward less-seen problems.

---

## Project Structure

```
1v1/
├── backend/
└── client/
```

### Backend

```
backend/
├── server.js                    # Entry point
├── package.json
├── .env
├── .env.example
│
├── config/
│   ├── connectDB.js             # Mongoose connection
│   ├── cloudinaryConfig.js      # Cloudinary SDK + Multer storage
│   ├── firebaseConfig.js        # Firebase Admin SDK initialization
│   └── token.js                 # JWT generation helper
│
├── middlewares/
│   └── isAuth.js                # JWT authentication middleware
│
├── model/
│   ├── userModel.js
│   ├── roomModel.js
│   ├── matchModel.js
│   ├── matchParticipantModel.js
│   ├── submissionModel.js
│   ├── problemModel.js
│   ├── messageModel.js
│   ├── notificationModel.js
│   └── followRequestModel.js
│
├── controller/
│   ├── authController.js        # signup, login, logout, firebaseAuth
│   ├── userController.js        # profile, leaderboard, match history
│   ├── roomController.js        # create, join, cancel, start, end room
│   ├── evaluationController.js  # run (single test) and submit (all tests)
│   ├── submissionController.js  # match submissions, reports
│   ├── socialController.js      # follow requests, followers, following
│   ├── messageController.js     # conversations, send, unread count
│   ├── notificationController.js
│   └── problemController.js
│
├── routes/
│   ├── authRoute.js             # /api/auth/*
│   ├── userRoute.js             # /api/user/*
│   ├── roomRoute.js             # /api/rooms/*
│   ├── evaluationRoute.js       # /api/evaluate/*
│   ├── submissionRoute.js       # /api/submissions/*
│   ├── socialRoute.js           # /api/social/*
│   ├── messageRoute.js          # /api/messages/*
│   ├── notificationRoute.js     # /api/notifications/*
│   └── problemRoute.js          # /api/problems/*
│
├── services/
│   └── executionService.js      # Docker execution + output comparison
│
├── sockets/
│   └── socketServer.js          # Full Socket.IO server logic
│
├── scripts/
│   ├── buildRunners.js          # Builds Docker images
│   ├── importProblems.js        # Bulk import problems from JSON to MongoDB
│   ├── checkEnv.js              # Validates required env vars
│   ├── checkEnvStatus.js
│   └── testMatching.js
│
├── data/
│   ├── problems.json            # Raw problem data (~22 MB)
│   └── problems_cleaned.json    # Processed problems (~23 MB)
│
├── docker/
│   ├── cpp/Dockerfile           # GCC image for C++ execution
│   ├── js/                      # Placeholder (not implemented)
│   └── python/                  # Placeholder (not implemented)
│
└── temp/                        # Per-job temp directories (auto-cleaned)
```

### Frontend

```
client/
├── index.html
├── vite.config.js
├── package.json
│
└── src/
    ├── main.jsx
    ├── App.jsx                  # Route definitions
    ├── index.css
    ├── socket.js                # Singleton Socket.IO client
    │
    ├── context/
    │   ├── BattleContext.jsx    # Battle state (room, problems, timer, opponent)
    │   ├── FirebaseAuthContext.jsx
    │   └── UserContext.jsx
    │
    ├── hooks/
    │   ├── ProtectedRoutes.jsx
    │   └── getCurrentUser.js
    │
    ├── pages/
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Signup.jsx
    │   ├── SelectProblem.jsx    # Battle setup (difficulty, tags, duration)
    │   ├── JoinRoom.jsx
    │   ├── WaitingWindow.jsx    # Pre-match lobby
    │   ├── History.jsx
    │   ├── LeaderBoard.jsx
    │   ├── MessagesPage.jsx
    │   ├── NotificationsPage.jsx
    │   ├── SocialListPage.jsx
    │   ├── UserProfile.jsx
    │   ├── DsaSheet.jsx
    │   ├── CompanyWiseSheet.jsx
    │   ├── CompanySheet.jsx
    │   ├── SystemDesign.jsx
    │   ├── SystemDesignTopic.jsx
    │   ├── PrivacyPolicy.jsx
    │   ├── TermsOfService.jsx
    │   └── NotFound.jsx
    │
    └── components/
        ├── Navbar.jsx
        ├── Footer.jsx
        ├── ChatBot.jsx
        ├── NotificationBell.jsx
        ├── SearchUsers.jsx
        ├── PageLoader.jsx
        ├── RatingTiers.jsx
        ├── displayResults.jsx
        │
        ├── home/
        │   ├── HeroSection.jsx
        │   ├── FeaturesSection.jsx
        │   ├── HowItWorksSection.jsx
        │   └── CompanyResourcesSection.jsx
        │
        ├── problemPanel/
        │   ├── ProblemScreen.jsx     # Main battle layout
        │   ├── LeftPanel.jsx         # Problem description
        │   ├── rightPanel.jsx        # Monaco editor
        │   ├── OutputPanel.jsx       # Test results
        │   ├── problemNavbar.jsx     # Timer, problem tabs, opponent status
        │   └── editorUtils.js
        │
        └── profile/
            ├── Profile.jsx
            └── EditProfile.jsx
```

---

## Architecture Overview

```
Client (React + Vite)
    |
    |-- REST API (Axios) ---------> Express Router
    |-- WebSocket (Socket.IO) ----> Socket Server
    
Express Server (server.js)
    |
    |-- /api/auth        --> authController
    |-- /api/user        --> userController
    |-- /api/rooms       --> roomController
    |-- /api/evaluate    --> evaluationController  --> executionService (Docker)
    |-- /api/submissions --> submissionController
    |-- /api/social      --> socialController
    |-- /api/messages    --> messageController
    |-- /api/notifications
    |-- /api/problems
    |
    |-- socketServer.js (Socket.IO)
            |-- in-memory maps: userSocketMap, roomHostMap, matchEndMap
            |-- handles: rooms, match lifecycle, chat, DMs, code sync

MongoDB
    Collections: users, rooms, matches, matchparticipants,
                 submissions, problems, messages, notifications, followrequests

External
    |-- Firebase Admin SDK  (token verification for Google sign-in)
    |-- Cloudinary          (profile image storage)
    |-- Docker Engine       (code sandbox)
```

---

## Database Models

### User
```js
{
  name: String,
  email: String,         // unique
  password: String,      // bcrypt hash; null for Firebase-only users
  description: String,   // default: "Hi there! I'm using LeetCompete."
  photoURL: String,
  playerId: String,      // 8-char uppercase alphanumeric, unique
  rating: Number,        // starts at 100
  firebaseUid: String,   // sparse unique index
  authProvider: String,  // 'email' | 'firebase' | 'google'
  emailVerified: Boolean,
  matches: [ObjectId],   // ref: Match
  followers: [ObjectId], // ref: User
  following: [ObjectId], // ref: User
  timestamps: true
}
```

### Room (TTL: 24 hours)
```js
{
  roomId: String,        // 8-char uppercase, e.g. "A3F9BC12"
  host: ObjectId,        // ref: User
  opponent: ObjectId,    // null until someone joins
  problems: [ObjectId],  // ref: Problem
  status: String,        // 'waiting' | 'active' | 'started'
  matchId: ObjectId,     // set when match starts
  metadata: {
    difficulty: String,  // 'easy' | 'medium' | 'hard'
    duration: Number,    // minutes, default 30
    categories: [String]
  },
  createdAt: Date        // TTL index expires after 86400 seconds
}
```

### Match
```js
{
  host: ObjectId,
  challenger: ObjectId,
  problems: [ObjectId],
  scoreHost: Number,
  scoreChallenger: Number,
  duration: Number,       // stored in seconds
  winner: String,         // ObjectId string or 'draw'
  timestamps: true
}
```

### MatchParticipant
```js
{
  userId: ObjectId,
  matchId: ObjectId,
  problems: [{
    problemId: ObjectId,
    status: String,        // 'not_attempted' | 'attempted' | 'solved'
    attempts: Number,
    lastSubmissionTime: Date,
    bestScore: Number
  }],
  totalScore: Number,      // problems solved count
  totalTime: Number,
  status: String,          // 'joined' | 'ready' | 'active' | 'completed' | 'disconnected'
  rank: Number,
  timestamps: true
}
// Compound unique index: { matchId, userId }
```

### Submission
```js
{
  userId: ObjectId,
  problemId: ObjectId,
  matchId: ObjectId,
  code: String,
  language: String,   // 'cpp' | 'javascript' | 'python' | 'python3' | 'java'
  status: String,     // 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' | 'Syntax Error'
  results: Mixed,     // full evaluation result object
  submittedAt: Date,
  timestamps: true
}
// Index: { matchId, userId, problemId }
```

### Problem
```js
{
  problemNumber: Number,  // unique
  title: String,
  slug: String,
  difficulty: String,     // 'Easy' | 'Medium' | 'Hard'
  content: String,        // full HTML description
  testCases: [{
    input: Mixed,
    expectedOutput: Mixed
  }],
  sampleTestCase: String,
  hints: [String],
  topicTags: [String],
  codeSnippets: [{
    lang: String,
    langSlug: String,
    code: String          // starter code template
  }],
  leetcodeUrl: String
}
// Index: { difficulty, topicTags }
```

### Message
```js
{
  sender: ObjectId,
  receiver: ObjectId,
  content: String,
  read: Boolean,
  timestamps: true
}
```

### Notification
```js
{
  recipient: ObjectId,
  sender: ObjectId,
  type: String,       // 'follow_request' | 'follow_accepted' | 'message'
  message: String,
  read: Boolean,
  link: String,
  timestamps: true
}
// Index: { recipient, read, createdAt }
```

### FollowRequest
```js
{
  sender: ObjectId,
  receiver: ObjectId,
  status: String      // 'pending' | 'accepted' | 'rejected'
}
```

---

## Backend Deep Dive

### Server Entry Point (`server.js`)

1. Loads `.env` via `dotenv`
2. Initializes Firebase Admin SDK
3. Creates Express app with JSON parsing, cookie parsing, and CORS (allowing localhost:5173 and the Vercel production domain)
4. Mounts all 9 route groups
5. Creates an `http.Server` from the Express app
6. Passes the HTTP server to `setupSocketServer()` to attach Socket.IO
7. Stores `io` on the Express app via `app.set('io', io)` — this avoids circular imports when controllers need to emit socket events
8. Connects to MongoDB and starts listening

---

### Authentication

#### Email/Password
- Signup validates email format, checks uniqueness, enforces password length >= 8, bcrypt-hashes the password with 10 rounds, generates a unique `playerId`, creates the user, issues a JWT stored as an HTTP-only cookie (7-day expiry).
- Login looks up by email, compares bcrypt hash, issues the same cookie on success.
- Logout clears the cookie.

#### Google / Firebase OAuth
1. Client signs in with Google via the Firebase client SDK, gets a Firebase ID token.
2. Token is sent to `POST /api/auth/firebase`.
3. Backend verifies it with `admin.auth().verifyIdToken()`.
4. If the user already exists by `firebaseUid` or email, it logs them in. If they also have no `firebaseUid` on the record (signed up with email before), it links the Firebase UID to their existing account.
5. If the user does not exist, it creates a new user with a random placeholder password and the Firebase profile data.
6. In both cases, a JWT cookie is issued identically to the email flow.

#### `isAuth` Middleware
- Reads token from `req.cookies.token`, falls back to `Authorization: Bearer <token>` header.
- Verifies JWT against `JWT_SECRET`.
- Fetches the full user from MongoDB and attaches it to both `req.user` and `req.userId` for backward compatibility.

---

### Room & Match Lifecycle

```
1. Host: POST /api/rooms/create
   - Validates hostId and problems list
   - Generates unique 8-char roomId (UUID v4, first 8 chars, uppercased)
   - Creates Room { status: 'waiting' }

2. Host: Socket emit 'join-room'
   - Server validates user is authorized (host or opponent of that room)
   - Joins socket room, stores in roomHostMap

3. Opponent: POST /api/rooms/join
   - Atomic findOneAndUpdate: { status:'waiting', opponent:null, host:{$ne:opponentId} }
   - Sets opponent and changes status to 'active' in one DB operation
   - Returns populated room data

4. Opponent: Socket emit 'join-room'
   - Server emits 'opponent-joined' to host

5. Host: Socket emit 'start-match'
   - Verifies host identity, checks 2 sockets in room
   - Creates Match document
   - Creates two MatchParticipant documents (one per player)
   - Updates Room { status: 'started', matchId }
   - Emits 'match-started' with startTime (server timestamp) and matchId

6. During match: /problem/:problemId
   - Run: POST /api/evaluate/run (first test case only, fast feedback)
   - Submit: POST /api/evaluate/submit (all test cases)
   - On pass: Socket emit 'code-submitted'
     - Server saves Submission, updates MatchParticipant
     - Emits 'opponent-submitted' to other player
     - Emits 'my-submission' back to sender

7. End: Socket emit 'end-match' (from each player)
   - Server tracks via matchEndMap
   - When both players have ended:
     - Runs calculateMatchResults()
     - Updates Match with scores and winner
     - Updates User ratings
     - Emits 'match-results' to room
     - Deletes Room, clears socket room
```

**Room Cleanup Rules:**
- Host leaves before match starts -> `destroyRoomOnHostLeave()`: notifies others, deletes Room, removes all sockets.
- Opponent leaves -> room reverts to `status: 'waiting', opponent: null`.
- Disconnect during match -> emits `opponent-disconnected`, room is preserved.
- New rooms younger than 60 seconds are not auto-cleaned (grace period for host socket to connect after HTTP room creation).
- MongoDB TTL index deletes abandoned rooms after 24 hours.

---

### Code Execution Engine (`services/executionService.js`)

#### C++ Wrapper Auto-Generation

LeetCode-style solutions are written as `class Solution { ... }` with no `main()`. The service generates a wrapper:

1. Regex-matches the function signature inside `class Solution`
2. Parses the test case input as JSON (either a named-args object `{"nums":[1,2,3],"target":5}` or a positional value)
3. For each parameter, converts the JSON value to a C++ literal:
   - `vector<...>` -> `{...}` initializer syntax
   - `string` -> quoted string literal
   - `bool` -> `true`/`false`
   - `char` -> single-quoted character
   - Numeric types -> raw number literal
4. Generates `main()` that declares variables and calls `sol.funcName(arg0, arg1, ...)`
5. Prepends a standard set of `#include` headers

#### Docker Execution

```
Config (cpp):
  Image:       cpp-runner
  Command:     sh -c "g++ main.cpp -std=c++20 -O2 -o main && ./main < input.txt"
  WorkingDir:  /app
  Binds:       <tempDir>:/app
  Memory:      512 MB
  MemorySwap:  512 MB (no swap beyond limit)
  CpuQuota:    50000 (50% of one CPU core)
  Network:     none

Timeout: container killed after 10 seconds
```

Docker log output uses multiplexed streams with 8-byte framing per chunk. `cleanDockerLogs()` strips these headers to extract raw text.

#### Output Comparison

`compareOutputs(actual, expected)` tries three strategies in order:
1. Exact string match (after trimming whitespace)
2. JSON parse both sides and compare via `JSON.stringify` (handles array output)
3. Numeric parse both sides and compare with epsilon `< 0.0001`

#### Full Submit vs Run

- `runSingleTest`: runs only the first test case. Used for quick "Run" feedback.
- `submitAllTests`: loops over all test cases sequentially. Aggregates `passedCount` and `finalStatus`. Priority: TLE > Runtime Error > Wrong Answer > Accepted.

---

### Socket Server (`sockets/socketServer.js`)

In-memory state (not persisted, reset on server restart):

```js
userSocketMap = Map<userId, socketId>       // for private message delivery
roomHostMap   = Map<roomId, hostUserId>     // for host privilege checks
matchEndMap   = Map<matchId, { player1Left, player2Left }>  // end-match coordination
```

The `io` instance is exported via a `getIO()` function so controllers (like `roomController`) can emit events without circular imports.

---

### Rating Calculation (`calculateMatchResults` in socketServer.js)

```
Per player, count solved problems and sum solve times:
  score     = number of problems with status === 'solved'
  totalTime = sum of (lastSubmissionTime - matchStartTime) for solved problems

Winner determination:
  if p1.score > p2.score   -> p1 wins
  if p2.score > p1.score   -> p2 wins
  if scores equal and both > 0:
    if p1.totalTime < p2.totalTime -> p1 wins (faster)
    if p2.totalTime < p1.totalTime -> p2 wins
  else -> draw

Rating changes:
  Winner:
    base gain = 10
    maxTime   = matchDuration * 1000 * solvedCount
    speedRatio = max(0, 1 - winnerTotalTime / maxTime)
    speedBonus = floor(15 * speedRatio)
    total gain = 10 + speedBonus   // between +10 and +25
  Loser:  -5
  Draw:   0 (match recorded in history for both)
```

---

### Social & Messaging System

Follow flow:
```
sendFollowRequest  -> FollowRequest {status:'pending'} + Notification to receiver
acceptFollowRequest -> status:'accepted', updates following/followers arrays on both users,
                       deletes follow_request notification, creates follow_accepted notification
rejectFollowRequest -> status:'rejected', deletes follow_request notification
cancelFollowRequest -> deletes FollowRequest entirely (sender only)
unfollowUser        -> $pull from following and followers arrays on both users
```

Messaging:
- Stored in MongoDB on send, delivered in real-time via `send-private-message` socket event.
- Guard: sender must be in receiver's `following` list, OR a conversation between them already exists.
- Notification deduplication: if unread notifications from the same sender/type already exist, the timestamp is updated in place rather than creating duplicates.
- Conversations list is built by querying all messages where the user is sender or receiver, then deduplicating by the other party.
- Fetching a conversation auto-marks all messages from the other user as `read: true`.

---

## API Reference

### Auth `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Register with email and password |
| POST | `/login` | No | Login with email and password |
| POST | `/logout` | No | Clear auth cookie |
| POST | `/firebase` | No | Login or register via Firebase token |

### User `/api/user`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/getcurrentuser` | Yes | Get logged-in user |
| POST | `/updateDescription` | Yes | Update bio |
| POST | `/updateName` | Yes | Update display name |
| POST | `/updatePhotoURL` | Yes | Upload profile image (multipart) |
| GET | `/getleaderboard` | No | Global leaderboard by rating |
| GET | `/getmatchhistory` | Yes | Current user's match history |
| GET | `/:userId` | No | Get public profile by user ID |

### Rooms `/api/rooms`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/create` | No | Create a battle room |
| POST | `/join` | No | Join a waiting room |
| GET | `/:roomId` | No | Get room details |
| DELETE | `/cancel` | No | Cancel or leave a room |
| POST | `/end` | No | End room and record match (HTTP fallback) |
| POST | `/start` | No | Mark room as started (HTTP fallback) |

### Evaluation `/api/evaluate`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/run` | No | Run code against the first test case |
| POST | `/submit` | No | Run code against all test cases |

### Submissions `/api/submissions`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/submit` | Yes | Record a match submission |
| GET | `/match/:matchId` | Yes | Get all submissions for a match |
| GET | `/stats/:matchId` | Yes | Get user stats for a match |
| GET | `/report/:matchId` | Yes | Get full match analysis report |

### Social `/api/social`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/follow-request` | Yes | Send a follow request |
| PUT | `/follow-request/:id/accept` | Yes | Accept a follow request |
| PUT | `/follow-request/:id/reject` | Yes | Reject a follow request |
| DELETE | `/follow-request/:id/cancel` | Yes | Cancel a sent follow request |
| GET | `/follow-requests/pending` | Yes | Get received pending requests |
| GET | `/follow-requests/sent` | Yes | Get sent pending requests |
| DELETE | `/unfollow/:targetUserId` | Yes | Unfollow a user |
| GET | `/followers/:userId` | No | Get followers list |
| GET | `/following/:userId` | No | Get following list |
| GET | `/search/:playerId` | No | Find user by player ID |

### Messages `/api/messages`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/conversations` | Yes | List all conversations |
| GET | `/:otherUserId` | Yes | Get message thread |
| POST | `/send` | Yes | Send a message (HTTP fallback) |
| GET | `/unread/count` | Yes | Count unread messages |

### Notifications `/api/notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | Get all notifications |
| PUT | `/:id/read` | Yes | Mark one as read |
| PUT | `/read-all` | Yes | Mark all as read |
| DELETE | `/:id` | Yes | Delete a notification |

### Problems `/api/problems`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List problems with filters |
| GET | `/:problemId` | No | Get a single problem |

---

## Socket Events Reference

### Client to Server

```js
socket.emit('authenticate', { userId })

socket.emit('join-room', { roomId, userId, name, photoURL })

socket.emit('leave-room', { roomId, userId })

socket.emit('cancel-room', { roomId, userId })

socket.emit('start-match', { roomId, metadata: { duration } })

socket.emit('end-match', { roomId, matchId, userId })

socket.emit('send-message', { roomId, sender, name, text })
// text is trimmed and capped at 500 characters

socket.emit('sync-code', { roomId, problemId, language, code, userId })

socket.emit('code-submitted', { roomId, userId, problemId, code, language, result })
// result = { allPassed: bool, status: string, ... }

socket.emit('change-problem', { roomId, problemIndex, userId })

socket.emit('send-private-message', { receiverId, content })
// sender is inferred from socket.data.userId (requires prior 'authenticate')
```

### Server to Client

```js
socket.on('opponent-joined', ({ userId, name, photoURL }) => {})
socket.on('opponent-left', ({ userId }) => {})
socket.on('opponent-disconnected', ({ userId }) => {})
socket.on('room-cancelled', ({ reason }) => {})
socket.on('room-error', ({ message }) => {})
socket.on('match-started', ({ startTime, matchId, metadata }) => {})
socket.on('match-results', ({ matchId, players, winner, isDraw }) => {})
socket.on('opponent-ended-match', ({ userId }) => {})
socket.on('waiting-for-opponent', ({ message }) => {})
socket.on('receive-message', ({ sender, name, text, timestamp }) => {})
socket.on('opponent-submitted', ({ userId, problemId, result }) => {})
socket.on('my-submission', ({ userId, problemId, result }) => {})
socket.on('opponent-changed-problem', ({ problemIndex, userId }) => {})
socket.on('code-updated', ({ problemId, language, code, userId }) => {})
socket.on('private-message-sent', populatedMessage => {})
socket.on('private-message-received', populatedMessage => {})
socket.on('notification', notification => {})
```

---

## Frontend Deep Dive

### Routing

All page components are lazy-loaded via `React.lazy()` wrapped in `<Suspense>`. A `PageLoader` spinner shows during navigation and on initial load.

| Route | Component | Protected |
|---|---|---|
| `/` | Home | No |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/battle` | SelectProblem | Yes |
| `/waiting-window` | WaitingWindow | Yes |
| `/problem/:problemId` | ProblemScreen | Yes |
| `/join-room` | JoinRoom | Yes |
| `/history` | History | Yes |
| `/profile` | Profile | Yes |
| `/edit-profile` | EditProfile | Yes |
| `/leaderboard` | LeaderBoard | No |
| `/messages` | MessagesPage | Yes |
| `/messages/:userId` | MessagesPage | Yes |
| `/social/:userId/:type` | SocialListPage | Yes |
| `/follow-requests` | NotificationsPage | Yes |
| `/user/:userId` | UserProfile | Yes |
| `/dsa-sheets` | DsaSheet | Yes |
| `/sheets` | CompanyWiseSheet | No |
| `/sheet/:company` | CompanySheet | Yes |
| `/system-design` | SystemDesign | No |
| `/system-design/:slug` | SystemDesignTopic | Yes |
| `/privacy-policy` | PrivacyPolicy | No |
| `/terms-of-service` | TermsOfService | No |

---

### Context Providers

#### BattleContext (`context/BattleContext.jsx`)

The single source of truth for active battle state. Persists to `localStorage` so that a page refresh mid-match does not lose room and problem data. `opponentJoined` is deliberately reset to `false` on reload so the waiting room correctly shows waiting status again.

State shape:
```js
{
  roomId, problems, currentProblemIndex,
  opponent, host, duration, difficulty, topics,
  startTime,       // server timestamp ms (for timer sync)
  isHost,
  metadata,
  opponentJoined,
  opponentName
}
```

`serverTimeOffset` is computed on mount by fetching `/auth/time`, measuring round-trip latency, and calculating `serverTime - Date.now() + latency/2`. All countdown calculations use `Date.now() + serverTimeOffset` for accuracy regardless of client clock drift.

Key functions: `updateBattleData`, `setProblems`, `setCurrentProblem`, `saveUserCode`, `getUserCode`, `resetBattle`.

`saveUserCode(problemId, language, code)` stores editor content keyed by `{problemId: {language: code}}` so switching problems preserves your code.

#### FirebaseAuthContext

Wraps Firebase client SDK. Provides `firebaseUser`, `signInWithGoogle()`, and `signOut()`.

#### UserContext

Fetches and caches the logged-in user from `/api/user/getcurrentuser`. Provides `currentUser`, `setCurrentUser`, `loading`.

---

### Key Pages

**SelectProblem.jsx** — The battle setup page. User picks difficulty, topic tags, number of problems, and time limit. Calls `POST /api/rooms/create`, saves room data to `BattleContext`, navigates to `/waiting-window`.

**WaitingWindow.jsx** — Pre-match lobby. Displays the room ID for sharing. Handles the `opponent-joined` event to show opponent info. Provides a real-time chat panel. Host gets "Start Match" and "Cancel Room" controls. Listens for `match-started` to navigate to the first problem.

**ProblemScreen.jsx** — The main battle interface. Split-panel: left shows problem description (rendered from HTML with `react-markdown`), right shows Monaco editor with language selector. The `problemNavbar` at the top shows the countdown timer, problem tab switcher, and real-time opponent submission indicators. Run/Submit buttons call the evaluation API. On a passing submission, `code-submitted` is emitted to the socket server so the opponent sees the update.

**MessagesPage.jsx** — Conversation list on the left, message thread on the right. New messages arrive via `private-message-received`. Send via `send-private-message` socket event.

---

## Environment Variables

### Backend (`backend/.env`)

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
PORT=8080

# Firebase Admin
FIREBASE_PROJECT_ID=devdualnew
# For production with service account:
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (`client/.env`)

```env
VITE_SERVER_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Docker Setup

Docker must be installed and running on the machine that runs the backend.

### Build the C++ Runner Image

```bash
cd backend
node scripts/buildRunners.js

# or manually:
docker build -t cpp-runner ./docker/cpp
```

The image is based on the official `gcc` Docker image with `/app` as the working directory. It is kept minimal intentionally — no extra packages, no network access at runtime.

Each code execution job:
1. Creates a temp directory `backend/temp/<uuid>/`
2. Writes `main.cpp` and `input.txt`
3. Starts a fresh container with the directory bind-mounted
4. Runs compile + execute in one shell command
5. Captures stdout/stderr via Dockerode's `.logs()` API
6. Force-removes the container and deletes the temp directory in the `finally` block

---

## Local Development Setup

**Prerequisites:**
- Node.js 18+
- MongoDB (local or Atlas URI)
- Docker Desktop
- Firebase project (for Google sign-in)
- Cloudinary account (for image uploads)

```bash
# Clone repo
git clone <repo-url>

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../client && npm install

# Copy and fill environment files
cp backend/.env.example backend/.env
cp client/.env.example client/.env

# Build the C++ Docker image
cd backend
docker build -t cpp-runner ./docker/cpp

# Import problems into MongoDB (first-time setup)
node scripts/importProblems.js

# Verify environment variables
node scripts/checkEnv.js

# Start backend (hot-reload)
npm run dev

# Start frontend in another terminal
cd ../client
npm run dev
```

Backend runs at `http://localhost:8080`.
Frontend runs at `http://localhost:5173`.

---

## Scripts Reference

### Backend

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start with nodemon |
| Production | `npm start` | Start with node |
| Build Docker | `npm run build-runners` | Build code runner Docker images |
| Import Problems | `node scripts/importProblems.js` | Bulk import problems from JSON |
| Check Env | `node scripts/checkEnv.js` | Validate environment variables |
| Test Matching | `npm test` | Test room matching logic |

### Frontend

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start Vite dev server |
| Build | `npm run build` | Build production bundle |
| Preview | `npm run preview` | Preview production build locally |
| Lint | `npm run lint` | Run ESLint |
